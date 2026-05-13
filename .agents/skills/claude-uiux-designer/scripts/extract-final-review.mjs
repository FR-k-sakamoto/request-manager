#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getFinalReviewText, parseRawReviewFile, resolveRunDir } from './lib/review-stream.mjs';

const runsRoot = process.env.CLAUDE_REVIEW_RUNS_DIR
  ? path.resolve(process.env.CLAUDE_REVIEW_RUNS_DIR)
  : path.join(os.tmpdir(), 'claude-uiux-designer-runs');

const cliArgs = process.argv.slice(2);
const inputPath = cliArgs.find((arg) => !arg.startsWith('--'));
const allowPartial = cliArgs.includes('--allow-partial');
const runDir = resolveRunDir(inputPath, runsRoot);
const resolvedInputPath = inputPath ? path.resolve(inputPath) : null;
const finalFile = path.join(runDir, 'final.md');
const statusFile = path.join(runDir, 'status.json');
const rawFile =
  resolvedInputPath && fs.existsSync(resolvedInputPath) && fs.statSync(resolvedInputPath).isFile()
    ? resolvedInputPath
    : path.join(runDir, 'raw.jsonl');

let status = null;
if (fs.existsSync(statusFile)) {
  status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
}

if (!allowPartial && status && status.status !== 'completed') {
  console.error(
    'Review is still running. Check review-status.mjs and rerun extract-final-review.mjs after completion.'
  );
  process.exit(2);
}

if (fs.existsSync(finalFile)) {
  process.stdout.write(fs.readFileSync(finalFile, 'utf8'));
  process.exit(0);
}

const state = parseRawReviewFile(rawFile, runDir);
const finalText = getFinalReviewText(state);

if (!finalText) {
  console.error(
    'No final review text extracted. Check status.json or increase CLAUDE_REVIEW_MAX_TURNS to 12 before retrying.'
  );
  process.exit(1);
}

process.stdout.write(finalText);
if (!finalText.endsWith('\n')) {
  process.stdout.write('\n');
}
