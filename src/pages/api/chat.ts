/**
 * Streaming chat endpoint (Phase 2).
 *
 * DEVELOPMENT ONLY until Phase 3 adds rate limiting, auth-based quotas, and cost controls.
 *
 * Flow: validate → resolve model → streamText (server-controlled settings) → UI message stream
 * piped to the Node response as SSE (the format `useChat` consumes).
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  convertToModelMessages,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
} from 'ai';
import type { LanguageModel, LanguageModelUsage } from 'ai';
import { CHAT_CALL_SETTINGS, getChatModel } from '@/library/ai/model';
import { CHAT_INSTRUCTIONS } from '@/library/ai/prompts';
import { parseChatRequest } from '@/library/ai/validation';
import { classifyAiError, logAiError } from '@/library/ai/errors';

export const config = {
  api: {
    // Rejects oversized payloads with 413 before the handler runs.
    bodyParser: { sizeLimit: '64kb' },
  },
};

/** Sent to the client when the stream fails after headers are sent. Never provider details. */
export const CHAT_STREAM_ERROR_MESSAGE = 'The assistant could not complete the response.';

const CHAT_TIMEOUT = {
  totalMs: 60_000, // hard cap on the whole call
  firstChunkMs: 15_000, // provider must start responding
  chunkMs: 15_000, // and must not stall between chunks
} as const;

type ErrorResponse = { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ErrorResponse>) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = parseChatRequest(req.body);
  if (!parsed.success) {
    console.warn('[chat] invalid request', { issues: parsed.issues });
    return res.status(400).json({ error: 'Invalid request' });
  }

  let model: LanguageModel;
  try {
    model = getChatModel();
  } catch (error) {
    logAiError('chat', error);
    return sendErrorResponse(res, error);
  }

  // Abort the provider request when the client disconnects, so the model stops generating
  // (and billing for) tokens nobody will read. `writableFinished` is true on normal completion.
  const abortController = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) abortController.abort();
  });

  const startedAt = Date.now();

  try {
    const result = streamText({
      model,
      ...CHAT_CALL_SETTINGS, // reasoning + maxOutputTokens: server-controlled only
      instructions: CHAT_INSTRUCTIONS,
      messages: await convertToModelMessages(parsed.messages),
      maxRetries: 1,
      timeout: CHAT_TIMEOUT,
      abortSignal: abortController.signal,
      // Must be overridden: the SDK default is `console.error(error)`, which would log the
      // raw provider error including the full conversation.
      onError: ({ error }) => logAiError('chat', error),
      onEnd: ({ finishReason, usage, warnings }) =>
        logCompletion({ outcome: 'completed', finishReason, usage, startedAt, warnings }),
      onAbort: ({ steps }) =>
        logCompletion({
          outcome: 'aborted',
          finishReason: undefined,
          usage: steps.at(-1)?.usage,
          startedAt,
          warnings: undefined,
        }),
    });

    const uiStream = toUIMessageStream({
      stream: result.stream,
      sendReasoning: false, // default is true; reasoning text never goes to the browser
      sendSources: false,
      // Errors are logged by `streamText`'s onError above; this only shapes the client message.
      onError: () => CHAT_STREAM_ERROR_MESSAGE,
    });

    await pipeUIMessageStreamToResponse({ response: res, stream: uiStream });
  } catch (error) {
    logAiError('chat', error);
    // Once streaming has started, the status is already sent; just close the connection.
    if (res.headersSent) {
      if (!res.writableEnded) res.end();
      return;
    }
    return sendErrorResponse(res, error);
  }
}

function sendErrorResponse(res: NextApiResponse<ErrorResponse>, error: unknown) {
  if (classifyAiError(error) === 'configuration') {
    return res.status(500).json({ error: 'Server configuration error' });
  }
  return res.status(500).json({ error: 'Internal server error' });
}

type CompletionLog = {
  outcome: 'completed' | 'aborted';
  finishReason: string | undefined;
  usage: LanguageModelUsage | undefined;
  startedAt: number;
  warnings: ReadonlyArray<{ type: string }> | undefined;
};

/** Metadata only — never message content. Cost/quota tracking builds on this in Phase 3. */
function logCompletion({ outcome, finishReason, usage, startedAt, warnings }: CompletionLog) {
  console.info('[chat] completion', {
    outcome,
    finishReason,
    durationMs: Date.now() - startedAt,
    inputTokens: usage?.inputTokens,
    outputTokens: usage?.outputTokens, // includes reasoning tokens
    reasoningTokens: usage?.outputTokenDetails.reasoningTokens,
    warnings: warnings?.map((warning) => warning.type),
  });
}
