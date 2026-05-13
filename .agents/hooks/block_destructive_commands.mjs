#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';

const denyPatterns = [
  /(^|\s)(pnpm|npx)\s+prisma\s+db\s+push(\s|$)/i,
  /(^|\s)prisma\s+db\s+push(\s|$)/i,
];

const denyReason =
  '「prisma db push」などのデータベースを直接更新するコマンドの実行はルールにより禁止されています。`pnpm prisma:migrate:dev --name <変更内容>` を使ってください。';

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

function findCommand(node) {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findCommand(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (!node || typeof node !== 'object') {
    return null;
  }

  if (typeof node.command === 'string') {
    return node.command;
  }

  for (const key of ['tool_input', 'toolInput', 'input', 'payload']) {
    const found = findCommand(node[key]);
    if (found) {
      return found;
    }
  }

  return null;
}

function shouldDeny(command) {
  const normalized = command.trim().split(/\s+/).join(' ');
  return denyPatterns.some((pattern) => pattern.test(normalized));
}

const payload = readPayload();
const command = findCommand(payload);

if (command && shouldDeny(command)) {
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: denyReason,
      },
    })}\n`
  );
}
