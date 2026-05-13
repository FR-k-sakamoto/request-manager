#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  createReviewState,
  finalizeReviewState,
  getFinalReviewText,
  parseReviewStreamLine,
  toSerializableStatus,
} from './lib/review-stream.mjs';

const readPrompt = async () => {
  const promptFile = process.env.CLAUDE_REVIEW_PROMPT_FILE;
  if (promptFile) {
    const resolvedPromptFile = path.resolve(promptFile);
    if (!fs.existsSync(resolvedPromptFile)) {
      throw new Error(`Prompt file not found: ${resolvedPromptFile}`);
    }
    return fs.readFileSync(resolvedPromptFile, 'utf8');
  }

  if (process.argv[2]) {
    return process.argv[2];
  }

  if (process.stdin.isTTY) {
    throw new Error("Usage: run-claude-review.sh '<prompt>' or pipe the prompt on stdin.");
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
};

const ensureDir = (targetDir) => {
  fs.mkdirSync(targetDir, { recursive: true });
};

const timestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const runsRoot = process.env.CLAUDE_REVIEW_RUNS_DIR
  ? path.resolve(process.env.CLAUDE_REVIEW_RUNS_DIR)
  : path.join(os.tmpdir(), 'claude-uiux-designer-runs');
const requestedRunDir = process.env.CLAUDE_REVIEW_RUN_DIR
  ? path.resolve(process.env.CLAUDE_REVIEW_RUN_DIR)
  : null;
const progressMode = process.env.CLAUDE_REVIEW_PROGRESS_MODE ?? 'status';

const prompt = await readPrompt();
ensureDir(runsRoot);

const runDir = requestedRunDir ?? path.join(runsRoot, `${timestamp()}-${process.pid}`);
ensureDir(runDir);

const promptFile = path.join(runDir, 'prompt.txt');
const rawFile = path.join(runDir, 'raw.jsonl');
const finalFile = path.join(runDir, 'final.md');
const statusFile = path.join(runDir, 'status.json');
const stdoutLogFile = path.join(runDir, 'runner.stdout.log');
const stderrLogFile = path.join(runDir, 'runner.stderr.log');
const latestPointer = path.join(runsRoot, 'latest-run.txt');

fs.writeFileSync(promptFile, prompt, 'utf8');
fs.writeFileSync(rawFile, '', 'utf8');
fs.writeFileSync(latestPointer, runDir, 'utf8');

const model = process.env.CLAUDE_REVIEW_MODEL ?? 'opus';
const permissionMode = process.env.CLAUDE_REVIEW_PERMISSION_MODE ?? 'default';
const tools = process.env.CLAUDE_REVIEW_TOOLS ?? 'Read,Grep,Glob';
const maxTurns = process.env.CLAUDE_REVIEW_MAX_TURNS ?? '8';
const systemPrompt =
  process.env.CLAUDE_REVIEW_APPEND_SYSTEM_PROMPT ??
  'Return the review directly in the final answer. Do not write files, plans, or patches.';

const args = [
  '-p',
  '--model',
  model,
  '--permission-mode',
  permissionMode,
  '--append-system-prompt',
  systemPrompt,
  '--verbose',
  '--output-format',
  'stream-json',
  '--include-partial-messages',
  '--no-session-persistence',
  '--max-turns',
  maxTurns,
];

if (tools) {
  args.push('--tools', tools);
}

if (process.env.CLAUDE_REVIEW_ADD_DIR) {
  args.push('--add-dir', process.env.CLAUDE_REVIEW_ADD_DIR);
}

if (process.env.CLAUDE_REVIEW_BARE === '1') {
  args.push('--bare');
}

if (process.env.CLAUDE_REVIEW_DEBUG_FILE) {
  args.push('--debug-file', process.env.CLAUDE_REVIEW_DEBUG_FILE);
}

const state = createReviewState(runDir);

const persistStatus = (exitCode = null) => {
  const payload = toSerializableStatus(state, {
    promptFile,
    rawFile,
    finalFile,
    statusFile,
    stdoutLogFile,
    stderrLogFile,
    exitCode,
  });
  fs.writeFileSync(statusFile, JSON.stringify(payload, null, 2), 'utf8');
};

persistStatus();
if (progressMode !== 'quiet') {
  console.error(`[claude-review] run_dir=${runDir}`);
  console.error(`[claude-review] status_file=${statusFile}`);
}

let stdoutBuffer = '';
let lastProgressSignature = '';
let lastProgressAt = 0;
const significantEventTypes = new Set([
  'init',
  'tool_use_complete',
  'drafting_started',
  'message_stop',
  'rate_limit',
]);

const emitProgress = (force = false) => {
  if (progressMode === 'quiet') {
    return;
  }

  const now = Date.now();
  const preview = state.preview ? truncatePreview(state.preview) : '';
  const latestToolSummary = state.latestTool?.summary
    ? `${state.latestTool.name} ${state.latestTool.summary}`
    : (state.latestTool?.name ?? '');
  const signature = `${state.phase}|${latestToolSummary}|${preview}`;

  if (!force && signature === lastProgressSignature && now - lastProgressAt < 8000) {
    return;
  }

  lastProgressSignature = signature;
  lastProgressAt = now;

  const parts = [`phase=${state.phase}`];
  if (latestToolSummary) {
    parts.push(`tool=${latestToolSummary}`);
  }
  if (
    progressMode === 'preview' &&
    preview &&
    (force || preview.length >= 28 || state.status === 'completed')
  ) {
    parts.push(`preview=${JSON.stringify(preview)}`);
  }
  console.error(`[claude-review] ${parts.join(' | ')}`);
};

function truncatePreview(value) {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > 120 ? `${clean.slice(0, 119)}…` : clean;
}

const child = spawn('claude', args, {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['pipe', 'pipe', 'inherit'],
});

child.stdin.end(prompt);

child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
  stdoutBuffer += chunk;

  while (stdoutBuffer.includes('\n')) {
    const newlineIndex = stdoutBuffer.indexOf('\n');
    const line = stdoutBuffer.slice(0, newlineIndex);
    stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);

    fs.appendFileSync(rawFile, `${line}\n`, 'utf8');
    const parsedEvent = parseReviewStreamLine(state, line);
    persistStatus();
    if (parsedEvent && significantEventTypes.has(parsedEvent.type)) {
      emitProgress(true);
    } else {
      emitProgress(false);
    }
  }
});

child.on('error', (error) => {
  state.errors.push(error.message);
  finalizeReviewState(state, 1);
  persistStatus(1);
  console.error(
    error.code === 'ENOENT'
      ? 'claude command not found. Ensure ~/.local/bin is on PATH.'
      : `[claude-review] spawn error: ${error.message}`
  );
  process.exit(1);
});

child.on('close', (code) => {
  if (stdoutBuffer.trim()) {
    fs.appendFileSync(rawFile, `${stdoutBuffer}\n`, 'utf8');
    parseReviewStreamLine(state, stdoutBuffer);
  }

  finalizeReviewState(state, code ?? 1);
  const finalText = getFinalReviewText(state);

  if (finalText) {
    fs.writeFileSync(finalFile, `${finalText}\n`, 'utf8');
  }

  persistStatus(code ?? 1);
  emitProgress(true);
  if (progressMode !== 'quiet') {
    console.error(`[claude-review] final_file=${finalFile}`);
  }

  if (code === 0 && finalText) {
    process.stdout.write(finalText);
    if (!finalText.endsWith('\n')) {
      process.stdout.write('\n');
    }
    process.exit(0);
  }

  if (code === 0 && !finalText) {
    console.error(
      '[claude-review] final text was not extracted. Increase CLAUDE_REVIEW_MAX_TURNS to 12 or inspect status.json before retrying.'
    );
  }

  if (code !== 0) {
    console.error(`[claude-review] claude exited with code ${code ?? 1}`);
  }
  process.exit(code ?? 1);
});
