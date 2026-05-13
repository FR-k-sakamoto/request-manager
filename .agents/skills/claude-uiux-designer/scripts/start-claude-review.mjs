#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const readPrompt = async () => {
  if (process.argv[2]) {
    return process.argv[2];
  }

  if (process.stdin.isTTY) {
    throw new Error("Usage: start-claude-review.sh '<prompt>' or pipe the prompt on stdin.");
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

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const runScript = path.join(scriptDir, 'run-claude-review.mjs');

const prompt = await readPrompt();
ensureDir(runsRoot);

const runDir = path.join(runsRoot, `${timestamp()}-${process.pid}`);
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
fs.writeFileSync(
  statusFile,
  JSON.stringify(
    {
      runDir,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      status: 'queued',
      phase: 'queued',
      finalTextLength: 0,
      promptFile,
      rawFile,
      finalFile,
      statusFile,
      stdoutLogFile,
      stderrLogFile,
    },
    null,
    2
  ),
  'utf8'
);

const stdoutFd = fs.openSync(stdoutLogFile, 'a');
const stderrFd = fs.openSync(stderrLogFile, 'a');

const child = spawn(process.execPath, [runScript], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    CLAUDE_REVIEW_RUN_DIR: runDir,
    CLAUDE_REVIEW_PROMPT_FILE: promptFile,
    CLAUDE_REVIEW_PROGRESS_MODE: process.env.CLAUDE_REVIEW_PROGRESS_MODE ?? 'quiet',
  },
  detached: true,
  stdio: ['ignore', stdoutFd, stderrFd],
});

child.unref();

fs.closeSync(stdoutFd);
fs.closeSync(stderrFd);

process.stdout.write(`run_dir: ${runDir}\n`);
process.stdout.write(`status_file: ${statusFile}\n`);
process.stdout.write(`final_file: ${finalFile}\n`);
process.stdout.write(`stdout_log: ${stdoutLogFile}\n`);
process.stdout.write(`stderr_log: ${stderrLogFile}\n`);
