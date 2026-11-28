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
import type {
  CallWarning,
  FinishReason,
  LanguageModel,
  LanguageModelUsage,
  UIMessageChunk,
} from 'ai';
import { CHAT_CALL_SETTINGS, CHAT_TIMEOUT, getChatModel } from '@/library/ai/model';
import { CHAT_INSTRUCTIONS } from '@/library/ai/prompts';
import { parseChatRequest } from '@/library/ai/validation';
import { classifyAiError, logAiError } from '@/library/ai/errors';
import { CHAT_STREAM_ERROR_MESSAGE, CHAT_TIMEOUT_MESSAGE } from '@/library/ai/chatContract';

export const config = {
  api: {
    // Rejects oversized payloads with 413 before the handler runs.
    bodyParser: { sizeLimit: '64kb' },
  },
};

// Re-exported so existing tests keep importing it from the route.
export { CHAT_STREAM_ERROR_MESSAGE };

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

  // The streamText callbacks record what happened; the UI stream's onEnd (which fires exactly
  // once per request) writes the single completion log from this state.
  const generation: GenerationState = { startedAt: Date.now(), hasError: false, aborted: false };

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
      onError: ({ error }) => {
        if (!generation.hasError) generation.error = error;
        generation.hasError = true;
        logAiError('chat', error);
      },
      onEnd: ({ finishReason, usage, warnings }) => {
        generation.end = { finishReason, usage, warnings };
      },
      // Fires for client disconnects (AbortError) and for timeouts (TimeoutError).
      onAbort: ({ reason }) => {
        generation.aborted = true;
        generation.abortReason = reason;
      },
    });

    const uiStream = toUIMessageStream({
      stream: result.stream,
      sendReasoning: false, // default is true; reasoning text never goes to the browser
      sendSources: false,
      // Errors are logged by `streamText`'s onError above; this only shapes the client message.
      onError: () => CHAT_STREAM_ERROR_MESSAGE,
      onEnd: ({ isCancelled }) => logCompletion(generation, isCancelled === true),
    });

    await pipeUIMessageStreamToResponse({
      response: res,
      stream: sanitizeClientStream(uiStream, generation),
    });
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

export type GenerationOutcome = 'completed' | 'failed' | 'timed-out' | 'aborted';

type GenerationState = {
  startedAt: number;
  hasError: boolean;
  error?: unknown;
  aborted: boolean;
  abortReason?: unknown;
  end?: { finishReason: FinishReason; usage: LanguageModelUsage; warnings?: CallWarning[] };
};

/**
 * Why each signal is needed (verified against ai@7.0.181):
 * - `onEnd` also fires after a mid-stream error, with finishReason 'error' — or even 'stop' if
 *   the provider keeps streaming afterwards — so finishReason alone cannot mean "completed".
 * - When the provider fails before streaming, neither `onEnd` nor `onAbort` fires.
 * - Timeouts and disconnects both arrive via `onAbort`; only the reason's name differs.
 * - On a client disconnect the UI stream ends (isCancelled) before `onAbort` may have run.
 */
function resolveOutcome(state: GenerationState, isCancelled: boolean): GenerationOutcome {
  if (isCancelled) return 'aborted';
  if (state.aborted) return isTimeout(state.abortReason) ? 'timed-out' : 'aborted';
  if (state.hasError || !state.end || state.end.finishReason === 'error') return 'failed';
  return 'completed';
}

function isTimeout(reason: unknown): boolean {
  return reason instanceof Error && reason.name === 'TimeoutError';
}

/**
 * Shapes the browser-facing stream:
 * - Timeouts: the browser's chat client ignores `abort` chunks, so a server timeout would
 *   otherwise look like a normal completion, and the SDK puts its timeout message (incl. our
 *   budgets) in the chunk's `reason`. Timeouts become a generic `error` chunk (useChat shows
 *   an error and keeps the partial reply); other aborts are forwarded without the reason.
 *   Relies on `onAbort` running before the abort chunk is emitted (verified in ai@7.0.181).
 * - Provider metadata (e.g. Gemini's encrypted `thoughtSignature`) is removed: the text-only
 *   chat doesn't need it in the browser. Revisit when tool calling needs signatures preserved.
 */
function sanitizeClientStream(
  stream: ReadableStream<UIMessageChunk>,
  generation: GenerationState,
): ReadableStream<UIMessageChunk> {
  return stream.pipeThrough(
    new TransformStream<UIMessageChunk, UIMessageChunk>({
      transform(chunk, controller) {
        if (chunk.type === 'abort') {
          controller.enqueue(
            isTimeout(generation.abortReason)
              ? { type: 'error', errorText: CHAT_TIMEOUT_MESSAGE }
              : { type: 'abort' },
          );
          return;
        }
        controller.enqueue(withoutProviderMetadata(chunk));
      },
    }),
  );
}

function withoutProviderMetadata(chunk: UIMessageChunk): UIMessageChunk {
  if (!('providerMetadata' in chunk) || chunk.providerMetadata === undefined) return chunk;
  const { providerMetadata: _removed, ...rest } = chunk;
  return rest as UIMessageChunk;
}

/** Metadata only — never message content. Cost/quota tracking builds on this in Phase 3. */
function logCompletion(state: GenerationState, isCancelled: boolean) {
  const outcome = resolveOutcome(state, isCancelled);
  const { end } = state;
  const write = outcome === 'failed' || outcome === 'timed-out' ? console.warn : console.info;

  write('[chat] completion', {
    outcome,
    ...(outcome === 'failed' && state.hasError && { errorKind: classifyAiError(state.error) }),
    finishReason: end?.finishReason,
    durationMs: Date.now() - state.startedAt,
    // Absent for aborted/timed-out streams: the provider never sent final usage (Phase 3 item).
    inputTokens: end?.usage.inputTokens,
    outputTokens: end?.usage.outputTokens, // includes reasoning tokens
    reasoningTokens: end?.usage.outputTokenDetails.reasoningTokens,
    warnings: end?.warnings?.map((warning) => warning.type),
  });
}
