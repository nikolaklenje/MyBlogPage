import { createGoogle } from '@ai-sdk/google';
import type { LanguageModel, LanguageModelCallOptions } from 'ai';

/**
 * Server-only module: the single place that knows which provider and model the chat uses.
 * Import it only from `src/pages/api/*` or other server-side code — never from components.
 *
 * Pinned to an exact stable model ID. Never use a `-latest` alias: those are hot-swapped by
 * the provider, silently changing behaviour, quality, and cost without a deploy.
 */
export const CHAT_MODEL_ID = 'gemini-3.5-flash-lite' as const;

/**
 * Default cap on generated tokens per call. On Gemini this budget covers thinking AND answer
 * tokens, and the SDK enforces no upper bound — so it must always be set explicitly.
 * Callers may override it per call from server code (e.g. per-tier limits in Phase 3).
 */
export const DEFAULT_MAX_OUTPUT_TOKENS = 500;

/**
 * Default call settings to spread into `generateText` / `streamText`.
 *
 * `reasoning: 'minimal'` is the lowest thinking level this model supports ('none' is mapped
 * to 'minimal' by the SDK with a warning). Do not also set
 * `providerOptions.google.thinkingConfig` — it overrides `reasoning`.
 *
 * Readonly because module-level objects are shared across concurrent requests.
 */
export const CHAT_CALL_SETTINGS = {
  reasoning: 'minimal',
  maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
} as const satisfies Pick<LanguageModelCallOptions, 'reasoning' | 'maxOutputTokens'>;

const API_KEY_ENV_VAR = 'GOOGLE_GENERATIVE_AI_API_KEY';

/** Thrown when server-side model configuration (e.g. the API key) is missing or invalid. */
export class ModelConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelConfigurationError';
  }
}

/**
 * Returns the configured chat model. Reads credentials lazily (at call time, not import time)
 * so a missing key fails the calling route with a clear error instead of breaking module load
 * or the build.
 */
export function getChatModel(): LanguageModel {
  const apiKey = process.env[API_KEY_ENV_VAR]?.trim();

  if (!apiKey) {
    // Name the variable, never the value.
    throw new ModelConfigurationError(`${API_KEY_ENV_VAR} is not configured`);
  }

  return createGoogle({ apiKey })(CHAT_MODEL_ID);
}
