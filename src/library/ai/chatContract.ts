/**
 * The contract between `/api/chat` and its browser client: request limits and the
 * client-visible error texts the server may send.
 *
 * BROWSER-SAFE: no server imports, secrets, or heavy dependencies. Both the API route and
 * the chat UI import this module, so it must stay that way.
 */

/**
 * Initial request limits (to be replaced by token budgets in Phase 3).
 * ~4 characters per token, so maxTotalChars ≈ 6k input tokens per request.
 */
export const CHAT_LIMITS = {
  maxMessages: 40,
  maxUserMessageChars: 4_000,
  maxAssistantMessageChars: 8_000,
  maxTotalChars: 24_000,
  maxPartsPerMessage: 20,
  maxIdLength: 128,
} as const;

/** Sent in an `error` chunk when the stream fails after headers are sent. */
export const CHAT_STREAM_ERROR_MESSAGE = 'The assistant could not complete the response.';

/** Sent in an `error` chunk (instead of the SDK's `abort` chunk) when a timeout fires. */
export const CHAT_TIMEOUT_MESSAGE = 'The assistant took too long to respond.';
