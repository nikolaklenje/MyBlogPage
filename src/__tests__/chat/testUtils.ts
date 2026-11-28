/**
 * Shared setup for browser-side chat tests (hook + component): the real /api/chat handler on
 * a local HTTP server, a scripted mock model, and a fetch that resolves the app's relative
 * `/api/chat` URL against that server.
 */
import { simulateReadableStream } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import type { NextApiHandler } from 'next';
import { vi } from 'vitest';
import { startApiServer } from '@/__tests__/helpers/apiServer';
import type { TestApiServer } from '@/__tests__/helpers/apiServer';

export type StreamPart = Parameters<typeof simulateReadableStream>[0]['chunks'][number];

export const finishPart = (unified: 'stop' | 'length' = 'stop'): StreamPart => ({
  type: 'finish',
  finishReason: { unified, raw: unified.toUpperCase() },
  usage: {
    inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: undefined },
    outputTokens: { total: 5, text: 5, reasoning: 0 },
  },
});

export const textReply = (text: string): StreamPart[] => [
  { type: 'stream-start', warnings: [] },
  { type: 'text-start', id: 't1' },
  ...text
    .split(' ')
    .map((word, i) => ({ type: 'text-delta', id: 't1', delta: (i ? ' ' : '') + word })),
  { type: 'text-end', id: 't1' },
  finishPart(),
];

export type ReplyScript = () => ReadableStream<never>;

export const fixed =
  (parts: StreamPart[], chunkDelayInMs: number | null = null): ReplyScript =>
  () =>
    simulateReadableStream({ chunks: parts, chunkDelayInMs }) as ReadableStream<never>;

/** Emits `parts`, then stalls forever (only a stop/abort/timeout can end it). */
export const stalling =
  (parts: StreamPart[]): ReplyScript =>
  () =>
    new ReadableStream<never>({
      start(controller) {
        for (const part of parts) controller.enqueue(part as never);
      },
    });

/** Model that answers successive requests with successive scripts (last one repeats). */
export function scriptedModel(replies: ReplyScript[]) {
  let call = 0;
  return new MockLanguageModelV4({
    doStream: async () => {
      const next = replies[Math.min(call, replies.length - 1)]!;
      call += 1;
      return { stream: next() };
    },
  });
}

/**
 * Starts the handler and routes the app's relative fetches to it. Counts requests so tests
 * can assert on duplicate submissions.
 */
export async function startChatBackend(handler: NextApiHandler) {
  const server: TestApiServer = await startApiServer(handler);
  const realFetch = globalThis.fetch;
  const requests: string[] = [];
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' && input.startsWith('/') ? server.baseUrl + input : input;
    requests.push(String(url));
    return realFetch(url, init);
  });
  return {
    requests,
    close: async () => {
      vi.unstubAllGlobals();
      await server.close();
    },
  };
}

export const silenceServerLogs = () => {
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
};
