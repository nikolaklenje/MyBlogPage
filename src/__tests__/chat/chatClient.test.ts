/**
 * Client ↔ server integration: the real `Chat` class that `useChat` wraps, with the real
 * `DefaultChatTransport`, talking over HTTP to the real /api/chat handler. Only the model is
 * mocked. Verifies the browser-side outcome logic against the actual protocol behaviour.
 */
import { Chat } from '@ai-sdk/react';
import { DefaultChatTransport, simulateReadableStream } from 'ai';
import type { UIMessage } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/chat';
import { getChatModel } from '@/library/ai/model';
import { CHAT_LIMITS } from '@/library/ai/chatContract';
import {
  checkCanSend,
  classifyReplyEnding,
  describeChatError,
  getMessageText,
  isRejectedRequest,
} from '@/library/chat/messages';
import type { ReplyEnding } from '@/library/chat/messages';
import { startApiServer } from '@/__tests__/helpers/apiServer';
import type { TestApiServer } from '@/__tests__/helpers/apiServer';

const testTimeout = vi.hoisted(() => ({ totalMs: 60_000, firstChunkMs: 15_000, chunkMs: 15_000 }));

vi.mock('@/library/ai/model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/library/ai/model')>();
  return { ...actual, CHAT_TIMEOUT: testTimeout, getChatModel: vi.fn() };
});

type StreamPart = Parameters<typeof simulateReadableStream>[0]['chunks'][number];

const finish = (unified: 'stop' | 'length' = 'stop'): StreamPart => ({
  type: 'finish',
  finishReason: { unified, raw: unified.toUpperCase() },
  usage: {
    inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: undefined },
    outputTokens: { total: 5, text: 5, reasoning: 0 },
  },
});

const textReply = (text: string, reason: 'stop' | 'length' = 'stop'): StreamPart[] => [
  { type: 'stream-start', warnings: [] },
  { type: 'text-start', id: 't1' },
  ...text
    .split(' ')
    .map((word, i) => ({ type: 'text-delta', id: 't1', delta: (i ? ' ' : '') + word })),
  { type: 'text-end', id: 't1' },
  finish(reason),
];

/** Model whose replies are produced in order, one per request. */
function scriptedModel(replies: Array<() => ReadableStream<never>>) {
  let call = 0;
  return new MockLanguageModelV4({
    doStream: async () => {
      const next = replies[Math.min(call, replies.length - 1)];
      call += 1;
      return { stream: next!() };
    },
  });
}

const fixed =
  (parts: StreamPart[], chunkDelayInMs: number | null = null) =>
  () =>
    simulateReadableStream({ chunks: parts, chunkDelayInMs }) as ReadableStream<never>;

/** Emits `parts` then stalls forever (only a timeout or abort can end it). */
const stalling = (parts: StreamPart[]) => () =>
  new ReadableStream<never>({
    start(controller) {
      for (const part of parts) controller.enqueue(part as never);
    },
  });

let server: TestApiServer;
let endings: ReplyEnding[];

function createChat(messages: UIMessage[] = []) {
  return new Chat<UIMessage>({
    messages,
    transport: new DefaultChatTransport<UIMessage>({ api: `${server.baseUrl}/api/chat` }),
    // Same classification the useChatSession hook performs.
    onFinish: ({ message, isAbort, isError, finishReason }) => {
      if (message.role === 'assistant') {
        endings.push(classifyReplyEnding({ isAbort, isError, finishReason }));
      }
    },
  });
}

const lastText = (chat: Chat<UIMessage>) => getMessageText(chat.messages.at(-1)!);

beforeEach(async () => {
  vi.stubEnv('NODE_ENV', 'development');
  Object.assign(testTimeout, { totalMs: 60_000, firstChunkMs: 15_000, chunkMs: 15_000 });
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  endings = [];
  server = await startApiServer(handler);
});

afterEach(async () => {
  await server.close();
});

describe('chat client against /api/chat', () => {
  it('streams a reply and continues a multi-turn conversation', async () => {
    vi.mocked(getChatModel).mockReturnValue(
      scriptedModel([fixed(textReply('Rust is noted.')), fixed(textReply('You said Rust.'))]),
    );
    const chat = createChat();

    await chat.sendMessage({ text: 'My favourite language is Rust.' });
    await chat.sendMessage({ text: 'Which language did I mention?' });

    expect(chat.status).toBe('ready');
    expect(chat.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant']);
    expect(lastText(chat)).toBe('You said Rust.');
    expect(endings).toEqual(['completed', 'completed']);
  });

  it('classifies a user stop as "stopped" and keeps the partial reply', async () => {
    vi.mocked(getChatModel).mockReturnValue(
      scriptedModel([stalling(textReply('Partial answer').slice(0, 3))]),
    );
    const chat = createChat();

    const pending = chat.sendMessage({ text: 'Write an essay' });
    await vi.waitFor(() => expect(lastText(chat)).toBe('Partial'));
    await chat.stop();
    await pending;

    expect(chat.status).toBe('ready');
    expect(chat.error).toBeUndefined();
    expect(lastText(chat)).toBe('Partial');
    expect(endings).toEqual(['stopped']);
  });

  it('surfaces a server timeout as an error (not a silent completion) and keeps the partial reply', async () => {
    Object.assign(testTimeout, { chunkMs: 50 });
    vi.mocked(getChatModel).mockReturnValue(
      scriptedModel([stalling(textReply('Partial answer').slice(0, 3))]),
    );
    const chat = createChat();

    await chat.sendMessage({ text: 'Hello' });

    expect(chat.status).toBe('error');
    expect(describeChatError(chat.error!)).toMatch(/took too long/);
    expect(lastText(chat)).toBe('Partial');
    expect(endings).toEqual(['failed']);
  });

  it('recovers from a mid-stream failure via regenerate (compatible with validation)', async () => {
    vi.mocked(getChatModel).mockReturnValue(
      scriptedModel([
        fixed([
          { type: 'stream-start', warnings: [] },
          { type: 'text-start', id: 't1' },
          { type: 'text-delta', id: 't1', delta: 'Broken' },
          { type: 'error', error: new Error('provider exploded') },
        ]),
        fixed(textReply('Fixed answer.')),
      ]),
    );
    const chat = createChat();

    await chat.sendMessage({ text: 'Hello' });
    expect(chat.status).toBe('error');
    expect(describeChatError(chat.error!)).toMatch(/could not complete/);

    chat.clearError();
    await chat.regenerate();

    expect(chat.status).toBe('ready');
    expect(chat.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(lastText(chat)).toBe('Fixed answer.');
    expect(endings).toEqual(['failed', 'completed']);
  });

  it('regenerates the last reply of a completed multi-turn conversation', async () => {
    vi.mocked(getChatModel).mockReturnValue(
      scriptedModel([fixed(textReply('First.')), fixed(textReply('Second take.'))]),
    );
    const chat = createChat();

    await chat.sendMessage({ text: 'Hi' });
    await chat.regenerate();

    expect(chat.status).toBe('ready');
    expect(chat.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(lastText(chat)).toBe('Second take.');
  });

  it('classifies a reply cut off by the token limit as "truncated"', async () => {
    vi.mocked(getChatModel).mockReturnValue(scriptedModel([fixed(textReply('Cut off', 'length'))]));
    const chat = createChat();

    await chat.sendMessage({ text: 'Hi' });

    expect(endings).toEqual(['truncated']);
  });

  it('maps a server validation rejection (400) to a friendly, actionable error', async () => {
    const chat = createChat();
    const oversized = 'a'.repeat(CHAT_LIMITS.maxUserMessageChars + 1);
    expect(checkCanSend(chat.messages, oversized).ok).toBe(false); // UI would block it first

    await chat.sendMessage({ text: oversized }); // bypass the UI check to hit the server

    expect(chat.status).toBe('error');
    expect(isRejectedRequest(chat.error!)).toBe(true);
    expect(describeChatError(chat.error!)).toMatch(/too long/);
    expect(describeChatError(chat.error!)).not.toContain('Invalid request'); // no raw body
    expect(getChatModel).not.toHaveBeenCalled();
  });

  it('clears the conversation', async () => {
    vi.mocked(getChatModel).mockReturnValue(scriptedModel([fixed(textReply('Hello.'))]));
    const chat = createChat();
    await chat.sendMessage({ text: 'Hi' });

    chat.messages = [];
    chat.clearError();

    expect(chat.messages).toEqual([]);
    expect(chat.status).toBe('ready');
  });
});
