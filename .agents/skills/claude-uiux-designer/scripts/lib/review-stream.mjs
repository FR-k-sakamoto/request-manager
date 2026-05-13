import fs from 'node:fs';
import path from 'node:path';

const PREVIEW_LIMIT = 220;

const normalizePreview = (value) => value.replace(/\s+/g, ' ').trim().slice(-PREVIEW_LIMIT);

const truncate = (value, max = 96) => {
  if (!value) {
    return '';
  }
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

const basenameOrValue = (value) => {
  if (!value) {
    return '';
  }
  return value.includes('/') ? (value.split('/').pop() ?? value) : value;
};

const summarizeToolInput = (toolName, rawInput) => {
  if (!rawInput.trim()) {
    return '';
  }

  try {
    const parsed = JSON.parse(rawInput);
    if (toolName === 'Read') {
      return basenameOrValue(parsed.file_path ?? '');
    }
    if (toolName === 'Grep') {
      const pattern = truncate(parsed.pattern ?? '', 48);
      const target = basenameOrValue(parsed.path ?? '');
      return [pattern, target].filter(Boolean).join(' @ ');
    }
    if (toolName === 'Glob') {
      return truncate(parsed.pattern ?? '', 64);
    }

    return truncate(JSON.stringify(parsed), 96);
  } catch {
    return truncate(rawInput.replace(/\s+/g, ' '), 96);
  }
};

const finalizeCurrentMessage = (state) => {
  if (!state.currentMessage) {
    return;
  }

  if (state.currentMessage.text.trim() || state.currentMessage.toolUses.length > 0) {
    state.messages.push({
      ...state.currentMessage,
      text: state.currentMessage.text,
    });
  }

  state.currentMessage = null;
  state.currentBlock = null;
};

export const createReviewState = (runDir = null) => ({
  runDir,
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedAt: null,
  status: 'starting',
  phase: 'starting',
  sessionId: null,
  model: null,
  permissionMode: null,
  tools: [],
  messages: [],
  currentMessage: null,
  currentBlock: null,
  latestTool: null,
  preview: '',
  toolCounts: {},
  rawLineCount: 0,
  errors: [],
  exitCode: null,
});

export const parseReviewStreamLine = (state, line) => {
  if (!line.trim()) {
    return null;
  }

  state.rawLineCount += 1;
  state.updatedAt = new Date().toISOString();

  let payload;
  try {
    payload = JSON.parse(line);
  } catch (error) {
    state.errors.push(`invalid-json:${error instanceof Error ? error.message : 'unknown'}`);
    return { type: 'parse_error' };
  }

  if (payload.type === 'system' && payload.subtype === 'init') {
    state.sessionId = payload.session_id ?? state.sessionId;
    state.model = payload.model ?? state.model;
    state.permissionMode = payload.permissionMode ?? state.permissionMode;
    state.tools = payload.tools ?? state.tools;
    state.status = 'running';
    state.phase = 'starting';
    return { type: 'init' };
  }

  if (payload.type === 'stream_event' && payload.event) {
    const event = payload.event;

    if (event.type === 'message_start') {
      finalizeCurrentMessage(state);
      state.currentMessage = {
        id: event.message?.id ?? `message-${state.messages.length + 1}`,
        text: '',
        toolUses: [],
      };
      return { type: 'message_start' };
    }

    if (event.type === 'content_block_start') {
      const block = event.content_block;
      if (!block) {
        return null;
      }

      if (block.type === 'tool_use') {
        state.phase = 'reading';
        state.currentBlock = {
          type: 'tool_use',
          name: block.name,
          input: '',
        };
        state.latestTool = {
          name: block.name,
          summary: '',
        };
        if (state.currentMessage) {
          state.currentMessage.toolUses.push({
            name: block.name,
            input: '',
          });
        }
        return { type: 'tool_use_start', tool: block.name };
      }

      state.currentBlock = { type: block.type };
      return null;
    }

    if (event.type === 'content_block_delta') {
      const delta = event.delta;
      if (!delta) {
        return null;
      }

      if (delta.type === 'text_delta' && state.currentMessage) {
        const wasDrafting = state.phase === 'drafting';
        state.phase = 'drafting';
        state.currentMessage.text += delta.text ?? '';
        state.preview = normalizePreview(state.currentMessage.text);
        return wasDrafting ? null : { type: 'drafting_started' };
      }

      if (delta.type === 'input_json_delta' && state.currentBlock?.type === 'tool_use') {
        state.currentBlock.input += delta.partial_json ?? '';
        if (state.currentMessage?.toolUses.length) {
          state.currentMessage.toolUses[state.currentMessage.toolUses.length - 1].input =
            state.currentBlock.input;
        }
        return null;
      }

      return null;
    }

    if (event.type === 'content_block_stop') {
      if (state.currentBlock?.type === 'tool_use') {
        const toolName = state.currentBlock.name;
        state.toolCounts[toolName] = (state.toolCounts[toolName] ?? 0) + 1;
        state.latestTool = {
          name: toolName,
          summary: summarizeToolInput(toolName, state.currentBlock.input),
        };
        state.currentBlock = null;
        return { type: 'tool_use_complete', tool: toolName };
      }
      state.currentBlock = null;
      return null;
    }

    if (event.type === 'message_stop') {
      finalizeCurrentMessage(state);
      return { type: 'message_stop' };
    }
  }

  if (payload.type === 'rate_limit_event') {
    return { type: 'rate_limit' };
  }

  return null;
};

export const finalizeReviewState = (state, exitCode = 0) => {
  finalizeCurrentMessage(state);
  state.exitCode = exitCode;
  state.completedAt = new Date().toISOString();
  state.status = exitCode === 0 ? 'completed' : 'failed';
  if (state.status === 'completed' && state.phase !== 'drafting') {
    state.phase = 'completed';
  }
  return state;
};

export const getFinalReviewText = (state) => {
  const messages = [...state.messages];
  if (state.currentMessage) {
    messages.push(state.currentMessage);
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const text = messages[index]?.text?.trim();
    if (text) {
      return text;
    }
  }

  return '';
};

export const toSerializableStatus = (state, extra = {}) => ({
  runDir: state.runDir,
  startedAt: state.startedAt,
  updatedAt: state.updatedAt,
  completedAt: state.completedAt,
  status: state.status,
  phase: state.phase,
  sessionId: state.sessionId,
  model: state.model,
  permissionMode: state.permissionMode,
  tools: state.tools,
  preview: state.preview,
  latestTool: state.latestTool,
  toolCounts: state.toolCounts,
  rawLineCount: state.rawLineCount,
  messageCount: state.messages.length + (state.currentMessage ? 1 : 0),
  finalTextLength: getFinalReviewText(state).length,
  exitCode: state.exitCode,
  errors: state.errors,
  ...extra,
});

export const resolveRunDir = (inputPath, runsRoot) => {
  if (inputPath) {
    const absolutePath = path.resolve(inputPath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Path not found: ${absolutePath}`);
    }
    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      return absolutePath;
    }
    return path.dirname(absolutePath);
  }

  const latestPointer = path.join(runsRoot, 'latest-run.txt');
  if (!fs.existsSync(latestPointer)) {
    throw new Error(`Latest run pointer not found: ${latestPointer}`);
  }

  const latestRunDir = fs.readFileSync(latestPointer, 'utf8').trim();
  if (!latestRunDir) {
    throw new Error(`Latest run pointer is empty: ${latestPointer}`);
  }

  return latestRunDir;
};

export const parseRawReviewFile = (rawFilePath, runDir = path.dirname(rawFilePath)) => {
  const state = createReviewState(runDir);
  const content = fs.existsSync(rawFilePath) ? fs.readFileSync(rawFilePath, 'utf8') : '';
  for (const line of content.split('\n')) {
    parseReviewStreamLine(state, line);
  }
  finalizeReviewState(state, state.exitCode ?? 0);
  return state;
};
