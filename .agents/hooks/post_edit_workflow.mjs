#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';

const mutatingToolNames = new Set([
  'write',
  'edit',
  'multiedit',
  'apply_patch',
  'functions.apply_patch',
]);

const staticChecks = [
  ['format:check', ['corepack', 'pnpm', 'format:check']],
  ['lint', ['corepack', 'pnpm', 'lint']],
  ['typecheck', ['corepack', 'pnpm', 'typecheck']],
];

function readPayload() {
  const raw = process.stdin.isTTY ? '' : fs.readFileSync(0, 'utf8').trim();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function extractTranscriptPath(node) {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = extractTranscriptPath(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (!node || typeof node !== 'object') {
    return null;
  }

  for (const key of ['transcript_path', 'transcriptPath']) {
    if (typeof node[key] === 'string' && node[key]) {
      return node[key];
    }
  }

  for (const value of Object.values(node)) {
    const found = extractTranscriptPath(value);
    if (found) {
      return found;
    }
  }

  return null;
}

function loadTranscript(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return [];
  }

  const raw = fs.readFileSync(transcriptPath, 'utf8').trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (parsed && typeof parsed === 'object') {
      for (const key of ['entries', 'events', 'items', 'messages', 'transcript']) {
        if (Array.isArray(parsed[key])) {
          return parsed[key];
        }
      }
      return [parsed];
    }
  } catch {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line)];
        } catch {
          return [];
        }
      });
  }

  return [];
}

function isUserBoundary(entry) {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const role = String(entry.role ?? '').toLowerCase();
  if (role === 'user') {
    return true;
  }

  const entryType = String(entry.type ?? '').toLowerCase();
  const author = String(entry.author ?? entry.sender ?? '').toLowerCase();
  return ['user_message', 'message'].includes(entryType) && author === 'user';
}

function extractToolName(entry) {
  const candidates = [
    entry.tool_name,
    entry.toolName,
    entry.name,
    entry.tool,
    entry.recipient_name,
    entry.recipientName,
    entry.tool_input?.tool_name,
    entry.tool_input?.toolName,
    entry.tool_input?.name,
    entry.toolInput?.tool_name,
    entry.toolInput?.toolName,
    entry.toolInput?.name,
    entry.input?.tool_name,
    entry.input?.toolName,
    entry.input?.name,
  ];

  return (
    candidates
      .find((candidate) => typeof candidate === 'string' && candidate.trim())
      ?.trim()
      .toLowerCase() ?? ''
  );
}

function entryIsMutation(entry) {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const toolName = extractToolName(entry);
  if (mutatingToolNames.has(toolName)) {
    return true;
  }

  const entryType = String(entry.type ?? '').toLowerCase();
  if (['tool_use', 'tool_call', 'tool_result', 'function_call'].includes(entryType)) {
    return mutatingToolNames.has(toolName);
  }

  return typeof entry.content === 'string' && entry.content.includes('*** Begin Patch');
}

function latestTurnHasMutation(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return false;
  }

  let lastUserIndex = -1;
  entries.forEach((entry, index) => {
    if (isUserBoundary(entry)) {
      lastUserIndex = index;
    }
  });

  const relevantEntries = lastUserIndex >= 0 ? entries.slice(lastUserIndex + 1) : entries;
  return relevantEntries.some((entry) => entryIsMutation(entry));
}

function runStaticChecks() {
  const failures = [];

  for (const [label, command] of staticChecks) {
    const [file, ...args] = command;
    const result = spawnSync(file, args, {
      encoding: 'utf8',
    });

    if (result.status === 0) {
      continue;
    }

    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim();
    const trimmed = output.split('\n').slice(0, 20).join('\n').trim();
    failures.push(trimmed ? `${label} failed\n${trimmed}` : `${label} failed`);
  }

  return failures;
}

function printBlock(reason) {
  process.stdout.write(`${JSON.stringify({ decision: 'block', reason })}\n`);
}

const payload = readPayload();
const transcriptPath = extractTranscriptPath(payload);

if (!transcriptPath) {
  process.exit(0);
}

const entries = loadTranscript(transcriptPath);
if (!latestTurnHasMutation(entries)) {
  process.exit(0);
}

const failures = runStaticChecks();
if (failures.length > 0) {
  printBlock(
    `コード変更後の静的解析でエラーが発生しました。修正してください。\n\n${failures.join('\n\n')}`
  );
  process.exit(0);
}

printBlock(
  'コードが変更されました。`plan-test-strategy` スキルを呼び出して、作成すべきテストの提案を行ってください。'
);
