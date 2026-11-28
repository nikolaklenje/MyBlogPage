import { APICallError, RetryError } from 'ai';
import { ModelConfigurationError } from '@/library/ai/model';

export type AiErrorKind = 'configuration' | 'timeout' | 'aborted' | 'provider' | 'unexpected';

/** Allowlisted, non-sensitive error fields that are safe to log. */
export type SafeErrorLog = {
  kind: AiErrorKind;
  name: string;
  statusCode?: number;
  isRetryable?: boolean;
  /** Provider's structured status code, e.g. Google's `RESOURCE_EXHAUSTED`. Never free text. */
  providerStatus?: string;
};

export function classifyAiError(error: unknown): AiErrorKind {
  if (error instanceof ModelConfigurationError) return 'configuration';
  if (error instanceof Error && error.name === 'TimeoutError') return 'timeout';
  if (error instanceof Error && error.name === 'AbortError') return 'aborted';
  if (APICallError.isInstance(error) || RetryError.isInstance(error)) return 'provider';
  return 'unexpected';
}

/**
 * Builds a log entry from allowlisted fields only. Never log raw provider errors: they carry
 * the request URL, the full request body (system prompt + visitor conversation) and the
 * provider's response body. Even `message` is unsafe — for Google it is the provider's text.
 */
export function toSafeErrorLog(error: unknown): SafeErrorLog {
  const apiError = RetryError.isInstance(error) ? error.lastError : error;
  const log: SafeErrorLog = {
    kind: classifyAiError(error),
    name: error instanceof Error ? error.name : typeof error,
  };

  if (APICallError.isInstance(apiError)) {
    log.statusCode = apiError.statusCode;
    log.isRetryable = apiError.isRetryable;
    const providerStatus = readProviderStatus(apiError.data);
    if (providerStatus) log.providerStatus = providerStatus;
  }

  return log;
}

export function logAiError(scope: string, error: unknown): void {
  const entry = toSafeErrorLog(error);
  // A client disconnect is expected behaviour, not a server error.
  const write = entry.kind === 'aborted' ? console.info : console.error;
  write(`[${scope}] request failed`, entry);
}

const PROVIDER_STATUS_PATTERN = /^[A-Z][A-Z_]{0,63}$/;

/** Extracts `{ error: { status } }` (Google's shape) only if it looks like an enum code. */
function readProviderStatus(data: unknown): string | undefined {
  if (!isRecord(data) || !isRecord(data.error)) return undefined;
  const { status } = data.error;
  return typeof status === 'string' && PROVIDER_STATUS_PATTERN.test(status) ? status : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
