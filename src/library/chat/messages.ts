/**
 * Pure, browser-side chat logic: message text, request-size checks that mirror the server's
 * validation, reply-ending classification, and user-facing error messages.
 *
 * Must only import browser-safe modules (never `@/library/ai/model`, `validation`, `errors`).
 */
import { APICallError } from 'ai';
import type { FinishReason, UIMessage } from 'ai';
import {
  CHAT_LIMITS,
  CHAT_STREAM_ERROR_MESSAGE,
  CHAT_TIMEOUT_MESSAGE,
} from '@/library/ai/chatContract';

export function getMessageText(message: UIMessage): string {
  return message.parts.map((part) => (part.type === 'text' ? part.text : '')).join('');
}

/** Same measure the server uses: total characters of text parts. */
export function getConversationChars(messages: UIMessage[]): number {
  return messages.reduce((sum, message) => sum + getMessageText(message).length, 0);
}

export type SendBlockReason =
  | 'empty'
  | 'message-too-long'
  | 'conversation-too-long'
  | 'too-many-messages';

export type SendCheck = { ok: true } | { ok: false; reason: SendBlockReason };

/**
 * Mirrors the server's limits so the UI can block a request the server would reject (400).
 * The server remains the authority; this only avoids a pointless round trip.
 */
export function checkCanSend(messages: UIMessage[], draft: string): SendCheck {
  if (draft.trim().length === 0) return { ok: false, reason: 'empty' };
  if (draft.length > CHAT_LIMITS.maxUserMessageChars) {
    return { ok: false, reason: 'message-too-long' };
  }
  if (messages.length + 1 > CHAT_LIMITS.maxMessages) {
    return { ok: false, reason: 'too-many-messages' };
  }
  if (getConversationChars(messages) + draft.length > CHAT_LIMITS.maxTotalChars) {
    return { ok: false, reason: 'conversation-too-long' };
  }
  return { ok: true };
}

export const SEND_BLOCK_MESSAGES: Record<Exclude<SendBlockReason, 'empty'>, string> = {
  'message-too-long': `Messages are limited to ${CHAT_LIMITS.maxUserMessageChars.toLocaleString('en-US')} characters.`,
  'conversation-too-long':
    'This conversation has reached its length limit. Clear the chat to continue.',
  'too-many-messages':
    'This conversation has reached its message limit. Clear the chat to continue.',
};

/**
 * How an assistant reply ended, from useChat's `onFinish` event.
 * - `stopped`: the user pressed stop (`isAbort` is only set by the client's own abort).
 * - `interrupted`: the stream ended without a `finish` chunk and nobody stopped it — e.g. a
 *   connection drop, or a server abort (the client ignores `abort` chunks).
 * - `truncated`: the model hit the output-token limit.
 * - `failed`: an error chunk or request error (useChat also exposes it as `error`).
 */
export type ReplyEnding = 'completed' | 'stopped' | 'interrupted' | 'truncated' | 'failed';

export function classifyReplyEnding(event: {
  isAbort: boolean;
  isError: boolean;
  finishReason?: FinishReason;
}): ReplyEnding {
  if (event.isError) return 'failed';
  if (event.isAbort) return 'stopped';
  if (event.finishReason === undefined) return 'interrupted';
  if (event.finishReason === 'length') return 'truncated';
  if (event.finishReason === 'error') return 'failed';
  return 'completed';
}

export const REPLY_ENDING_NOTES: Partial<Record<ReplyEnding, string>> = {
  stopped: 'Response stopped.',
  interrupted: 'The response was interrupted.',
  truncated: 'The response was cut off at the length limit.',
};

/**
 * Which visible message a finished reply's ending belongs to. If the reply never produced a
 * visible assistant message (e.g. stopped before the first token), the ending is attached to
 * the user turn it answered, so the UI can still show feedback and offer a retry.
 */
export function getEndingTargetId(
  reply: UIMessage,
  messages: readonly UIMessage[],
): string | undefined {
  if (messages.some((message) => message.id === reply.id)) return reply.id;
  const last = messages.at(-1);
  return last?.role === 'user' ? last.id : undefined;
}

/** Puts a rejected message back in the composer without discarding a draft typed meanwhile. */
export function mergeRejectedIntoDraft(rejected: string, currentDraft: string): string {
  if (currentDraft.trim().length === 0) return rejected;
  if (currentDraft.includes(rejected)) return currentDraft;
  return `${rejected}\n\n${currentDraft}`;
}

/** Errors for which the rejected user message should be returned to the composer for editing. */
export function isRejectedRequest(error: Error): boolean {
  return APICallError.isInstance(error) && (error.statusCode === 400 || error.statusCode === 413);
}

/**
 * Maps any chat error to a fixed, user-facing message. Never shows `error.message` for unknown
 * errors: for HTTP errors it is the raw response body.
 */
export function describeChatError(error: Error): string {
  if (APICallError.isInstance(error)) {
    if (isRejectedRequest(error)) {
      return 'Your message could not be sent because it or the conversation is too long. Shorten it or clear the chat.';
    }
    if (error.statusCode === 404) return 'The chat is not available right now.';
    return 'Something went wrong on our side. Please try again.';
  }
  if (error.message === CHAT_TIMEOUT_MESSAGE) {
    return 'The assistant took too long to respond. You can retry.';
  }
  if (error.message === CHAT_STREAM_ERROR_MESSAGE) {
    return 'The assistant could not complete the response. You can retry.';
  }
  if (error instanceof TypeError) {
    return 'Network error. Check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}
