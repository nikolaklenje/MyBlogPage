// @vitest-environment jsdom
/**
 * useChatSession against the real /api/chat handler (mock model) via React Testing Library.
 * Covers the edge cases the Chat-class tests cannot: React state timing and hook logic.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import type { NextApiHandler } from 'next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/chat';
import { getChatModel } from '@/library/ai/model';
import { getMessageText } from '@/library/chat/messages';
import { useChatSession } from '@/library/chat/useChatSession';
import {
  fixed,
  scriptedModel,
  silenceServerLogs,
  stalling,
  startChatBackend,
  textReply,
} from '@/__tests__/chat/testUtils';

vi.mock('@/library/ai/model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/library/ai/model')>();
  return { ...actual, getChatModel: vi.fn() };
});

let backend: Awaited<ReturnType<typeof startChatBackend>>;

async function start(customHandler: NextApiHandler = handler) {
  backend = await startChatBackend(customHandler);
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'development');
  silenceServerLogs();
});

afterEach(async () => {
  await backend?.close();
});

const texts = (messages: ReturnType<typeof useChatSession>['messages']) =>
  messages.map((m) => `${m.role}:${getMessageText(m)}`);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('useChatSession', () => {
  it('sends a message and streams the reply', async () => {
    vi.mocked(getChatModel).mockReturnValue(scriptedModel([fixed(textReply('Hello there.'))]));
    await start();
    const { result } = renderHook(() => useChatSession());

    act(() => result.current.setDraft('Hi'));
    await act(() => result.current.send());

    expect(texts(result.current.messages)).toEqual(['user:Hi', 'assistant:Hello there.']);
    expect(result.current.draft).toBe('');
  });

  it('ignores a second submission made before React re-renders', async () => {
    vi.mocked(getChatModel).mockReturnValue(scriptedModel([fixed(textReply('Only once.'))]));
    await start();
    const { result } = renderHook(() => useChatSession());
    act(() => result.current.setDraft('Hi'));

    // Both calls use the same render's closure: `isBusy` is still false for the second one.
    const { send } = result.current;
    await act(async () => {
      await Promise.all([send(), send()]);
    });

    expect(backend.requests).toHaveLength(1);
    expect(texts(result.current.messages)).toEqual(['user:Hi', 'assistant:Only once.']);
  });

  it('gives feedback and allows retry when stopped before the first token', async () => {
    const model = scriptedModel([stalling([]), fixed(textReply('Second try.'))]);
    vi.mocked(getChatModel).mockReturnValue(model);
    await start();
    const { result } = renderHook(() => useChatSession());
    act(() => result.current.setDraft('Hi'));

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.send();
    });
    await waitFor(() => expect(result.current.status).toBe('submitted'));
    // The request reached the (stalling) model: no token will ever arrive.
    await waitFor(() => expect(model.doStreamCalls).toHaveLength(1));
    await act(() => result.current.stop());
    await act(() => pending);

    // No assistant message exists, yet the user turn shows it was stopped and can be retried.
    expect(texts(result.current.messages)).toEqual(['user:Hi']);
    const lastUser = result.current.messages.at(-1)!;
    expect(result.current.getReplyEnding(lastUser.id)).toBe('stopped');
    expect(result.current.canRetry).toBe(true);

    await act(() => result.current.retry());
    expect(texts(result.current.messages)).toEqual(['user:Hi', 'assistant:Second try.']);
  });

  it('restores a rejected message without losing a draft typed meanwhile', async () => {
    // A slow 400, as the server sends for over-limit requests the client did not catch.
    const rejecting: NextApiHandler = async (_req, res) => {
      await sleep(100);
      res.status(400).json({ error: 'Invalid request' });
    };
    await start(rejecting);
    const { result } = renderHook(() => useChatSession());
    act(() => result.current.setDraft('My long question'));

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.send();
    });
    act(() => result.current.setDraft('A new thought')); // user keeps typing during the request
    await act(() => pending);

    await waitFor(() => expect(result.current.messages).toEqual([]));
    expect(result.current.draft).toContain('My long question');
    expect(result.current.draft).toContain('A new thought');
    expect(result.current.errorMessage).toMatch(/too long/);
    expect(result.current.canRetry).toBe(false);
  });

  it('keeps a cleared conversation empty even if the old stream was still running', async () => {
    const words = Array.from({ length: 60 }, (_, i) => `w${i}`).join(' ');
    vi.mocked(getChatModel).mockReturnValue(
      scriptedModel([fixed(textReply(words), 15), fixed(textReply('Fresh reply.'))]),
    );
    await start();
    const { result } = renderHook(() => useChatSession());
    act(() => result.current.setDraft('Old conversation'));

    act(() => {
      void result.current.send();
    });
    await waitFor(() => expect(getMessageText(result.current.messages.at(-1)!)).toContain('w3'));
    await act(() => result.current.clear());
    await act(() => sleep(300)); // give any late chunks/callbacks a chance to land

    expect(result.current.messages).toEqual([]);
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.isBusy).toBe(false);

    act(() => result.current.setDraft('New conversation'));
    await act(() => result.current.send());
    expect(texts(result.current.messages)).toEqual([
      'user:New conversation',
      'assistant:Fresh reply.',
    ]);
    expect(result.current.getReplyEnding(result.current.messages[1]!.id)).toBe('completed');
  });

  it('ignores a send issued while a clear is still in progress', async () => {
    const words = Array.from({ length: 60 }, (_, i) => `w${i}`).join(' ');
    vi.mocked(getChatModel).mockReturnValue(
      scriptedModel([fixed(textReply(words), 15), fixed(textReply('Should not be sent.'))]),
    );
    await start();
    const { result } = renderHook(() => useChatSession());
    act(() => result.current.setDraft('Old conversation'));
    act(() => {
      void result.current.send();
    });
    await waitFor(() => expect(getMessageText(result.current.messages.at(-1)!)).toContain('w3'));
    act(() => result.current.setDraft('Typed during clear'));

    const { clear, send } = result.current;
    await act(async () => {
      const clearing = clear();
      await send(); // the stale send() closure still has the old draft; must be a no-op
      await clearing;
    });
    await act(() => sleep(200));

    expect(result.current.messages).toEqual([]);
    expect(backend.requests).toHaveLength(1);
    expect(result.current.draft).toBe('Typed during clear'); // nothing was lost
  });

  it('keeps the conversation empty when cleared before the request became active', async () => {
    vi.mocked(getChatModel).mockReturnValue(scriptedModel([fixed(textReply('Late reply.'), 10)]));
    await start();
    const { result } = renderHook(() => useChatSession());
    act(() => result.current.setDraft('Hi'));

    // Send and clear from the same render, before `status` has changed.
    const { send, clear } = result.current;
    await act(async () => {
      void send();
      await clear();
    });
    await act(() => sleep(300));

    expect(result.current.messages).toEqual([]);
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.isBusy).toBe(false);
  });
});
