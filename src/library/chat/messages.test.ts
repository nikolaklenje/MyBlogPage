import { APICallError } from 'ai';
import type { UIMessage } from 'ai';
import { describe, expect, it } from 'vitest';
import {
  CHAT_LIMITS,
  CHAT_STREAM_ERROR_MESSAGE,
  CHAT_TIMEOUT_MESSAGE,
} from '@/library/ai/chatContract';
import {
  checkCanSend,
  classifyReplyEnding,
  describeChatError,
  getConversationChars,
  getMessageText,
  isRejectedRequest,
} from '@/library/chat/messages';

const msg = (role: UIMessage['role'], text: string): UIMessage => ({
  id: `${role}-${Math.random()}`,
  role,
  parts: [{ type: 'step-start' }, { type: 'text', text }],
});

const httpError = (statusCode: number, responseBody = '{"error":"Invalid request"}') =>
  new APICallError({
    message: responseBody,
    url: '/api/chat',
    requestBodyValues: undefined,
    statusCode,
    responseBody,
  });

describe('getMessageText / getConversationChars', () => {
  it('joins text parts and ignores other parts', () => {
    const message: UIMessage = {
      id: 'a',
      role: 'assistant',
      parts: [{ type: 'step-start' }, { type: 'text', text: 'Hel' }, { type: 'text', text: 'lo' }],
    };
    expect(getMessageText(message)).toBe('Hello');
  });

  it('counts characters across the conversation like the server does', () => {
    expect(getConversationChars([msg('user', 'abc'), msg('assistant', 'de')])).toBe(5);
  });
});

describe('checkCanSend (mirrors server validation)', () => {
  it('accepts a normal message', () => {
    expect(checkCanSend([], 'Hello')).toEqual({ ok: true });
  });

  it('rejects empty and whitespace-only drafts', () => {
    expect(checkCanSend([], '')).toEqual({ ok: false, reason: 'empty' });
    expect(checkCanSend([], '   \n')).toEqual({ ok: false, reason: 'empty' });
  });

  it('enforces the per-message limit at the exact boundary', () => {
    expect(checkCanSend([], 'a'.repeat(CHAT_LIMITS.maxUserMessageChars)).ok).toBe(true);
    expect(checkCanSend([], 'a'.repeat(CHAT_LIMITS.maxUserMessageChars + 1))).toEqual({
      ok: false,
      reason: 'message-too-long',
    });
  });

  it('enforces the total conversation length including the draft', () => {
    const history = [msg('user', 'a'.repeat(CHAT_LIMITS.maxTotalChars - 5))];
    expect(checkCanSend(history, 'abcde').ok).toBe(true);
    expect(checkCanSend(history, 'abcdef')).toEqual({ ok: false, reason: 'conversation-too-long' });
  });

  it('enforces the message-count limit including the new message', () => {
    const full = Array.from({ length: CHAT_LIMITS.maxMessages }, () => msg('user', 'x'));
    expect(checkCanSend(full.slice(1), 'hi').ok).toBe(true);
    expect(checkCanSend(full, 'hi')).toEqual({ ok: false, reason: 'too-many-messages' });
  });
});

describe('classifyReplyEnding', () => {
  it.each([
    [{ isAbort: false, isError: false, finishReason: 'stop' as const }, 'completed'],
    [{ isAbort: true, isError: false, finishReason: undefined }, 'stopped'],
    [{ isAbort: false, isError: false, finishReason: undefined }, 'interrupted'],
    [{ isAbort: false, isError: false, finishReason: 'length' as const }, 'truncated'],
    [{ isAbort: false, isError: true, finishReason: undefined }, 'failed'],
    [{ isAbort: false, isError: false, finishReason: 'error' as const }, 'failed'],
  ])('%o → %s', (event, expected) => {
    expect(classifyReplyEnding(event)).toBe(expected);
  });
});

describe('describeChatError', () => {
  it('maps validation rejections (400/413) to an actionable message', () => {
    for (const status of [400, 413]) {
      const error = httpError(status, 'Body exceeded 64kb limit');
      expect(isRejectedRequest(error)).toBe(true);
      expect(describeChatError(error)).toMatch(/too long/);
    }
  });

  it('maps server-sent stream errors to their user-facing text', () => {
    expect(describeChatError(new Error(CHAT_TIMEOUT_MESSAGE))).toMatch(/took too long/);
    expect(describeChatError(new Error(CHAT_STREAM_ERROR_MESSAGE))).toMatch(/could not complete/);
  });

  it('maps network failures', () => {
    expect(describeChatError(new TypeError('Failed to fetch'))).toMatch(/Network error/);
  });

  it('never shows raw error content for unknown or server errors', () => {
    const leaky = 'SECRET stack trace at /var/task/chat.js';
    expect(describeChatError(new Error(leaky))).not.toContain('SECRET');
    expect(describeChatError(httpError(500, leaky))).not.toContain('SECRET');
    expect(isRejectedRequest(httpError(500))).toBe(false);
  });
});
