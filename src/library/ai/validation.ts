import { z } from 'zod';
import type { UIMessage } from 'ai';
import { CHAT_LIMITS } from '@/library/ai/chatContract';

// Re-exported for existing server-side imports; the browser imports from chatContract directly.
export { CHAT_LIMITS };

const idSchema = z.string().min(1).max(CHAT_LIMITS.maxIdLength);

// `z.object` strips unknown keys, so client-sent extras (`state`, `providerMetadata`,
// `metadata`, `model`, `system`, `maxOutputTokens`, ...) never reach the model call.
const textPartSchema = z.object({ type: z.literal('text'), text: z.string() });
const stepStartPartSchema = z.object({ type: z.literal('step-start') });

const userMessageSchema = z.object({
  id: idSchema,
  role: z.literal('user'),
  parts: z.array(textPartSchema).min(1).max(CHAT_LIMITS.maxPartsPerMessage),
});

// `useChat` adds `step-start` parts to assistant messages. Any other part type (file, tool,
// reasoning, data) is rejected by the discriminated unions below.
const assistantMessageSchema = z.object({
  id: idSchema,
  role: z.literal('assistant'),
  parts: z
    .array(z.discriminatedUnion('type', [textPartSchema, stepStartPartSchema]))
    .max(CHAT_LIMITS.maxPartsPerMessage),
});

// Only 'user' and 'assistant' roles are accepted: a client-supplied 'system' message is the
// most direct prompt-injection vector, so it is rejected outright.
const messageSchema = z.discriminatedUnion('role', [userMessageSchema, assistantMessageSchema]);

type ParsedMessage = z.infer<typeof messageSchema>;

const textLength = (message: ParsedMessage) =>
  message.parts.reduce((sum, part) => sum + (part.type === 'text' ? part.text.length : 0), 0);

/** Request body sent by the AI SDK's default chat transport (`useChat`). */
export const chatRequestSchema = z
  .object({
    id: idSchema.optional(),
    trigger: z.enum(['submit-message', 'regenerate-message']).optional(),
    messageId: idSchema.optional(),
    messages: z.array(messageSchema).min(1).max(CHAT_LIMITS.maxMessages),
  })
  .superRefine(({ messages }, ctx) => {
    let total = 0;
    messages.forEach((message, index) => {
      const length = textLength(message);
      total += length;
      const max =
        message.role === 'user'
          ? CHAT_LIMITS.maxUserMessageChars
          : CHAT_LIMITS.maxAssistantMessageChars;
      if (length > max) {
        ctx.addIssue({ code: 'custom', message: 'Message too long', path: ['messages', index] });
      }
    });

    if (total > CHAT_LIMITS.maxTotalChars) {
      ctx.addIssue({ code: 'custom', message: 'Conversation too long', path: ['messages'] });
    }

    const last = messages.at(-1);
    if (last?.role !== 'user' || !hasNonBlankText(last)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Last message must be a non-empty user message',
        path: ['messages', messages.length - 1],
      });
    }
  });

function hasNonBlankText(message: ParsedMessage): boolean {
  return message.parts.some((part) => part.type === 'text' && part.text.trim().length > 0);
}

/** Issue codes and paths only — never the submitted values — so they are safe to log. */
export type ValidationIssue = { code: string; path: string };

export type ChatRequestParseResult =
  | { success: true; messages: UIMessage[] }
  | { success: false; issues: ValidationIssue[] };

const MAX_LOGGED_ISSUES = 5;

export function parseChatRequest(body: unknown): ChatRequestParseResult {
  const result = chatRequestSchema.safeParse(body);

  if (!result.success) {
    return {
      success: false,
      issues: result.error.issues.slice(0, MAX_LOGGED_ISSUES).map((issue) => ({
        code: issue.code,
        path: issue.path.map(String).join('.'),
      })),
    };
  }

  // Keep only text parts; drop assistant messages left empty (e.g. an aborted reply).
  const messages: UIMessage[] = result.data.messages
    .map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts.filter((part) => part.type === 'text'),
    }))
    .filter((message) => message.parts.length > 0);

  return { success: true, messages };
}
