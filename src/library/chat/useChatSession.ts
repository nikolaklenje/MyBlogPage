/**
 * Chat session state for the chat UI: wraps useChat with our transport, tracks how each
 * reply ended, mirrors the server's request limits, and exposes guarded actions.
 * Keeps business logic out of the component (see CLAUDE.md).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ChatStatus, UIMessage } from 'ai';
import {
  checkCanSend,
  classifyReplyEnding,
  describeChatError,
  getEndingTargetId,
  getMessageText,
  isRejectedRequest,
  mergeRejectedIntoDraft,
} from '@/library/chat/messages';
import type { ReplyEnding, SendCheck } from '@/library/chat/messages';

export const CHAT_API_PATH = '/api/chat';

/** Batches UI updates during streaming so Markdown isn't re-rendered on every token. */
const STREAM_THROTTLE_MS = 50;

export type ChatSession = {
  messages: UIMessage[];
  status: ChatStatus;
  /** A request is in flight (waiting for the first token or streaming). */
  isBusy: boolean;
  /** User-facing error text, never raw error content. */
  errorMessage: string | undefined;
  draft: string;
  setDraft: (draft: string) => void;
  sendCheck: SendCheck;
  /** How a finished assistant reply ended (undefined while streaming or if unknown). */
  getReplyEnding: (messageId: string) => ReplyEnding | undefined;
  /** Whether retrying the last exchange makes sense right now. */
  canRetry: boolean;
  send: () => Promise<void>;
  stop: () => Promise<void>;
  retry: () => Promise<void>;
  clear: () => Promise<void>;
};

const RETRYABLE_ENDINGS: ReadonlySet<ReplyEnding> = new Set([
  'stopped',
  'interrupted',
  'truncated',
]);

export function useChatSession(): ChatSession {
  const [draft, setDraft] = useState('');
  const [endings, setEndings] = useState<Record<string, ReplyEnding>>({});
  // Stateless and safe to share for the component's lifetime.
  const [transport] = useState(() => new DefaultChatTransport<UIMessage>({ api: CHAT_API_PATH }));

  // Synchronous duplicate-submission guard. React state (`status`) only changes after a
  // re-render, and the SDK sets `submitted` after an internal await, so two calls from the
  // same render would both pass a state-based check. A ref is updated immediately.
  const inFlightRef = useRef<Promise<void> | null>(null);

  const { messages, status, error, sendMessage, regenerate, stop, setMessages, clearError } =
    useChat<UIMessage>({
      transport,
      throttle: STREAM_THROTTLE_MS,
      onFinish: ({ message, messages: current, isAbort, isError, finishReason }) => {
        if (message.role !== 'assistant') return;
        const targetId = getEndingTargetId(message, current);
        if (!targetId) return;
        const ending = classifyReplyEnding({ isAbort, isError, finishReason });
        setEndings((previous) => ({ ...previous, [targetId]: ending }));
      },
    });

  const isBusy = status === 'submitted' || status === 'streaming';

  /** Runs one request at a time; returns immediately if one is already in flight. */
  const runExclusive = useCallback(async (request: () => Promise<void>) => {
    if (inFlightRef.current) return;
    const promise = request().finally(() => {
      if (inFlightRef.current === promise) inFlightRef.current = null;
    });
    inFlightRef.current = promise;
    await promise;
  }, []);

  // A 400/413 means the server rejected the request (too long). Every later request would
  // resend the same oversized message and fail again, so take it out of the history and put
  // it back in the composer for editing. Each error object is handled once.
  const handledErrorRef = useRef<Error | undefined>(undefined);
  useEffect(() => {
    if (!error || handledErrorRef.current === error || !isRejectedRequest(error)) return;
    handledErrorRef.current = error;
    const last = messages.at(-1);
    if (last?.role !== 'user') return;
    setMessages(messages.slice(0, -1));
    setDraft((current) => mergeRejectedIntoDraft(getMessageText(last), current));
  }, [error, messages, setMessages]);

  const sendCheck = useMemo(() => checkCanSend(messages, draft), [messages, draft]);

  const send = useCallback(async () => {
    // Guards duplicate submissions (Enter + click, double click) while a reply is in flight.
    if (isBusy || !sendCheck.ok) return;
    const text = draft;
    await runExclusive(async () => {
      setDraft('');
      await sendMessage({ text });
    });
  }, [draft, isBusy, runExclusive, sendCheck, sendMessage]);

  const lastMessage = messages.at(-1);
  const lastEnding = lastMessage ? endings[lastMessage.id] : undefined;
  const canRetry =
    !isBusy &&
    messages.length > 0 &&
    ((error !== undefined && !isRejectedRequest(error)) ||
      (lastEnding !== undefined && RETRYABLE_ENDINGS.has(lastEnding)));

  const retry = useCallback(async () => {
    if (!canRetry) return;
    await runExclusive(async () => {
      clearError();
      // Regenerates the last assistant reply, or resends the last user message if it got none.
      // Compatible with server validation: history is sliced to end with the user turn.
      await regenerate();
    });
  }, [canRetry, clearError, regenerate, runExclusive]);

  const clear = useCallback(async () => {
    // Always stop — `isBusy` is React state and can lag behind a send started in the same
    // render. One stop() covers every phase (verified in ai@7.0.181): before the request is
    // active it aborts the SDK's pending message preparation (sendMessage then bails), and
    // afterwards it aborts the request and waits for in-flight writes and onFinish, so no
    // late chunk or callback can re-add messages or endings. Covered by the clear tests.
    await stop();
    setMessages([]);
    clearError();
    setEndings({});
  }, [clearError, setMessages, stop]);

  const getReplyEnding = useCallback((messageId: string) => endings[messageId], [endings]);

  return {
    messages,
    status,
    isBusy,
    errorMessage: error ? describeChatError(error) : undefined,
    draft,
    setDraft,
    sendCheck,
    getReplyEnding,
    canRetry,
    send,
    stop,
    retry,
    clear,
  };
}
