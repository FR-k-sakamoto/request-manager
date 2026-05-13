#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseRawReviewFile, resolveRunDir } from './lib/review-stream.mjs';

const runsRoot = process.env.CLAUDE_REVIEW_RUNS_DIR
  ? path.resolve(process.env.CLAUDE_REVIEW_RUNS_DIR)
  : path.join(os.tmpdir(), 'claude-uiux-designer-runs');

const cliArgs = process.argv.slice(2);
const inputPath = cliArgs.find((arg) => !arg.startsWith('--'));
const jsonMode = cliArgs.includes('--json');
const includePreview = cliArgs.includes('--preview') || cliArgs.includes('--verbose');

const runDir = resolveRunDir(inputPath, runsRoot);
const resolvedInputPath = inputPath ? path.resolve(inputPath) : null;
const statusFile = path.join(runDir, 'status.json');
const rawFile =
  resolvedInputPath && fs.existsSync(resolvedInputPath) && fs.statSync(resolvedInputPath).isFile()
    ? resolvedInputPath
    : path.join(runDir, 'raw.jsonl');

let status;
if (fs.existsSync(statusFile)) {
  status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
} else {
  status = {
    ...parseRawReviewFile(rawFile, runDir),
    rawFile,
  };
}

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
  process.exit(0);
}

const lines = [
  `status: ${status.status ?? 'unknown'}`,
  `phase: ${status.phase ?? 'unknown'}`,
  `run_dir: ${runDir}`,
];

if (status.model) {
  lines.push(`model: ${status.model}`);
}
if (status.latestTool?.name) {
  const summary = status.latestTool.summary ? ` ${status.latestTool.summary}` : '';
  lines.push(`latest_tool: ${status.latestTool.name}${summary}`);
}
if (includePreview && status.preview) {
  lines.push(`preview: ${status.preview}`);
}
if (typeof status.finalTextLength === 'number') {
  lines.push(`final_text_length: ${status.finalTextLength}`);
}
if (status.finalFile && fs.existsSync(status.finalFile)) {
  lines.push(`final_file: ${status.finalFile}`);
}
if (
  status.status === 'completed' &&
  typeof status.finalTextLength === 'number' &&
  status.finalTextLength === 0
) {
  lines.push(
    'note: final text is empty. Increase CLAUDE_REVIEW_MAX_TURNS to 12 or inspect raw.jsonl.'
  );
}

process.stdout.write(`${lines.join('\n')}\n`);
