# AI Chat — Progress Log

Tracks progress against `AI_CHAT_ROADMAP.md`. Update at the end of each session.

---

## Current status

- **Phase:** 2 — Streaming Chat (in progress). Phase 1 was reviewed and approved.
- **Done:** Task 2.1, the backend streaming endpoint `/api/chat` (development only), verified on its own. Reviewed in PR #60, plus follow-up fixes for outcome logging and timeout tests (Session 4).
- **Next task:** Task 2.2, connecting the frontend with `useChat`. It needs `@ai-sdk/react` and must wait for an explicit go-ahead.

---

## 2026-11-27 — Session 4 (Task 2.1 review follow-ups, PR #60)

### 1. Can `onEnd` log `completed` after a failure? Yes, so it was fixed

Measured with `MockLanguageModelV4` against installed `ai@7.0.181`:

| Scenario                                       | `streamText` callbacks                                                    | UI stream `onEnd` outcome | Old log      | New log                  |
| ---------------------------------------------- | ------------------------------------------------------------------------- | ------------------------- | ------------ | ------------------------ |
| Normal                                         | `onEnd(stop)`                                                             | completed                 | completed    | **completed**            |
| Error mid-stream                               | `onError`, `onEnd(finishReason: error)`                                   | completed                 | ❌ completed | **failed**               |
| Error, then provider sends `finish`            | `onError`, `onEnd(finishReason: stop)`                                    | completed                 | ❌ completed | **failed**               |
| Provider throws before streaming               | `onError` only (no `onEnd` / `onAbort`)                                   | failed                    | ❌ no record | **failed** + `errorKind` |
| `firstChunkMs` / `chunkMs` / `totalMs` timeout | `onAbort(reason: TimeoutError)` only, no `onError`                        | aborted                   | ❌ aborted   | **timed-out**            |
| Client disconnect                              | `onAbort(reason: AbortError)`; UI `onEnd(isCancelled)` may fire **first** | unknown / aborted         | aborted      | **aborted**              |

- Fix (`src/pages/api/chat.ts`): the `streamText` callbacks only record state (first error, end event, abort reason). The UI stream's `onEnd`, which fires exactly once in every scenario, writes one completion log via `resolveOutcome`: `isCancelled` → aborted; abort with `TimeoutError` → timed-out; other abort → aborted; any error, no end event, or `finishReason: error` → failed; otherwise completed.
- `failed` and `timed-out` are logged at warn level; `completed` and `aborted` at info. `failed` includes `errorKind` (classification only, no message).
- `CHAT_TIMEOUT` moved from `chat.ts` to `model.ts`, next to the other server-controlled call settings, so tests can override it. Values are unchanged (60 s / 15 s / 15 s).

### 2. Deterministic timeout tests (no live requests)

- The tests replace `CHAT_TIMEOUT` with millisecond budgets via a hoisted mutable object. Mock providers either stall forever or stream forever, so only the configured timeout can end the request.
- Covered: `firstChunkMs` (no data), `chunkMs` (stall mid-response), `totalMs` (endless stream). For each: HTTP 200, the model's `abortSignal` is aborted with `TimeoutError` (so the provider request stops), exactly one `timed-out` warn log, and the stream ends with an `abort` chunk.
- Also: production budgets are unchanged; outcome tests for completed, failed (mid-stream, error then `stop`, failure before streaming) and aborted.
- Regenerate-shaped requests are accepted, and `resume-stream` is rejected (validation tests).

### Results

| Check                                             | Result                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `yarn test`                                       | **42/42 pass** (23 validation, 19 route)                                        |
| Flakiness                                         | 10 consecutive full runs: 40/40 each (before the 2 validation tests were added) |
| Mutation checks                                   | "Trust `onEnd` alone" → 2 failures; "timeouts reported as aborted" → 3 failures |
| `tsc --noEmit`, deprecation diagnostics, Prettier | Pass, 0, pass                                                                   |
| Real Gemini e2e (two turns + a disconnect)        | `completed` ×2 with usage, `aborted` ×1                                         |

### New finding

- **On timeout the client receives an `abort` chunk, not an `error` chunk.** The UI would show a silently truncated reply. Task 2.2 must handle it: either show a timeout notice in the UI when the stream ends with `abort` and the user didn't press stop, or have the server replace the final `abort` with an `error` chunk when the abort reason was a timeout.

---

## 2026-11-27 — Session 3 (Phase 2, Task 2.1)

### Completed

**New and changed files**

- `src/pages/api/chat.ts`: the streaming endpoint, development only (404 otherwise), POST only (405 with `Allow`), body limit `bodyParser.sizeLimit: '64kb'` (413).
  - Flow: validate → `getChatModel()` → `streamText` → `toUIMessageStream` → `pipeUIMessageStreamToResponse` (SSE, the format `useChat` consumes).
  - Server-controlled settings: `...CHAT_CALL_SETTINGS` (reasoning `minimal`, `maxOutputTokens` 500), `instructions: CHAT_INSTRUCTIONS`, `maxRetries: 1`, `timeout: { totalMs: 60s, firstChunkMs: 15s, chunkMs: 15s }`.
  - Disconnect: an `AbortController` is aborted on `res` `'close'` (if `!writableFinished`) and passed as `abortSignal`.
  - Callbacks: `onError` → sanitized `logAiError`; `onEnd` / `onAbort` → metadata-only completion log (outcome, finishReason, duration, input/output/reasoning tokens, warning types).
  - `toUIMessageStream`: `sendReasoning: false`, `sendSources: false`, `onError` → fixed message `CHAT_STREAM_ERROR_MESSAGE`.
- `src/library/ai/validation.ts`: Zod policy for the `useChat` body `{ id, messages, trigger, messageId }`.
  - Unknown keys are stripped.
  - Roles: `user` and `assistant` only (`system` rejected). Parts: `text` only, plus `step-start` on assistant messages, which is dropped. File, tool, reasoning and data parts are rejected.
  - Limits: 40 messages; 4,000 characters per user message and 8,000 per assistant message; 24,000 characters total; the last message must be a non-blank user message.
  - Over-limit requests are **rejected, not trimmed**; trimming is a Phase 3 context-management decision.
  - Validation errors return issue codes and paths only, never values.
- `src/library/ai/prompts.ts`: `CHAT_INSTRUCTIONS`, a minimal system prompt.
- `src/library/ai/errors.ts`: `classifyAiError` (configuration, timeout, aborted, provider, unexpected), `toSafeErrorLog` (allowlisted fields, plus Google's `data.error.status` only when it matches `^[A-Z_]+$`) and `logAiError` (aborts logged at info level).
- Removed `src/pages/api/ai-smoke.ts` (Phase 1 smoke test), as planned.
- Testing: added `vitest@5.1.0` and its required peer dependency `vite@8.3.8`, both pinned exactly and both at least two weeks old (5.1.2 was two days old). Added `vitest.config.mts` (`@/` alias, Node environment, tests excluded from `src/pages`) and `yarn test` / `yarn test:watch`.

**v7 API findings (installed `ai@7.0.181`)**

- `result.pipeUIMessageStreamToResponse()` is **deprecated**. Use the standalone `toUIMessageStream({ stream: result.stream })` + `pipeUIMessageStreamToResponse({ response, stream })`.
- `system` is deprecated in favor of `instructions`; `onFinish` in favor of `onEnd`. `convertToModelMessages` is async. `allowSystemInMessages` defaults to `false`.
- **The default `streamText` `onError` is `console.error(error)`.** It would log the raw provider error, including the full conversation, so it must always be overridden.
- `toUIMessageStream` defaults to `sendReasoning: true`, so it's set to `false` explicitly.
- The SDK's own disconnect handling cancels its stream reader but does **not** abort the provider request (confirmed by the test that fails without it). Our `abortSignal` is required to stop generation and billing.

**Test results (actual)**

| Check                                                    | Result                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit`                                           | Pass                                                                                                                                                                                                                                                                                                                                                                                                        |
| Deprecation diagnostics on all new files, tests included | 0                                                                                                                                                                                                                                                                                                                                                                                                           |
| Prettier                                                 | Pass                                                                                                                                                                                                                                                                                                                                                                                                        |
| `yarn test`                                              | **31/31 pass**: 21 validation unit tests and 10 route integration tests (real handler on node:http, `MockLanguageModelV4`)                                                                                                                                                                                                                                                                                  |
| Integration coverage                                     | 404 outside dev; 405; 400 with no logged content; 500 configuration error; SSE text deltas + finish; server settings enforced (500 tokens, `minimal`, system prompt) despite client overrides; multi-turn role order; mid-stream error → generic message only; `APICallError` log allowlist incl. `providerStatus: RESOURCE_EXHAUSTED` with no leaks; disconnect aborts the model signal and logs `aborted` |
| Mutation checks                                          | Removing `abortSignal`, the `onError` override, or the generic client error each made the matching test fail                                                                                                                                                                                                                                                                                                |
| Real Gemini, single turn (dev server)                    | 200; headers in 43 ms; first token ≈0.5 s; incremental `text-delta` chunks; `finish: stop`                                                                                                                                                                                                                                                                                                                  |
| Real Gemini, multi-turn                                  | Turn 2 answered "Rust" from turn 1's context                                                                                                                                                                                                                                                                                                                                                                |
| Real Gemini, disconnect                                  | Client aborted at 507 ms → `[chat] completion { outcome: 'aborted' }`                                                                                                                                                                                                                                                                                                                                       |
| Request guards (real Next)                               | GET 405; system role 400; malformed JSON 400 (rejected by Next); text/plain 400; 5,000-char message 400; 70 KB body 413                                                                                                                                                                                                                                                                                     |
| `next build` + `next start`                              | `/api/chat` 404                                                                                                                                                                                                                                                                                                                                                                                             |
| Real key or system prompt in `.next/static`              | 0 files                                                                                                                                                                                                                                                                                                                                                                                                     |

### Findings for later phases

- **Mid-stream failures return HTTP 200 plus an `error` chunk** (headers are sent before the model responds). Accepted tradeoff; the server log records the real cause.
- **The system prompt costs about 120 input tokens per turn** (a 10-word question used 130 input tokens). Count it in Phase 3 cost estimates.
- **Aborted streams report no usage** (no final `finish` part), yet the tokens generated before the abort are billed. Phase 3 cost tracking must estimate them.
- **Gemini's `providerMetadata.google.thoughtSignature`** (an opaque, encrypted reasoning-state blob) reaches the client inside a `text-delta` chunk. Validation strips it when the client sends it back, so it can't be injected. It's low risk for text-only chat. Revisit in Phase 5: tool calling with thinking needs signatures round-tripped, which argues for server-side history (Phase 4).
- The client can fabricate assistant turns, since history is client-held. That's unavoidable until server-side persistence (Phase 4). Validation limits the shape and size.
- Node 26 prints a `DEP0205` deprecation warning from Vite/Vitest internals. It's harmless.

---

## 2026-11-27 — Session 2

### Completed

- `src/library/ai/model.ts` implemented (by Claude, at the user's request). It contains `CHAT_MODEL_ID`, `DEFAULT_MAX_OUTPUT_TOKENS` (500), `CHAT_CALL_SETTINGS` (`reasoning: 'minimal'`, `as const satisfies Pick<LanguageModelCallOptions, …>`; switched from the deprecated `CallSettings`), and a lazy `getChatModel(): LanguageModel` using `createGoogle`.
- Verified: `tsc --noEmit` passes for the whole project and Prettier check passes. A runtime check without network calls confirmed the getter throws for an undefined, empty or whitespace-only key without leaking the value, and that it returns provider `google.generative-ai`, model `gemini-3.5-flash-lite`, spec `v4`.
- Note: `as const` is compile-time readonly only; the object isn't frozen at runtime. That's acceptable because callers spread it.
- Added `ModelConfigurationError` to `model.ts`, thrown for a missing or blank key, so routes can tell configuration failures apart from other errors without matching message text.

**Smoke-test endpoint `src/pages/api/ai-smoke.ts`** (temporary, local development only; delete when `/api/chat` exists)

- Guard: `NODE_ENV !== 'development'` returns 404, checked before the method so production, previews, `next start` and tests never reveal the route. A non-POST request returns 405 with `Allow: POST`.
- Hard-coded prompt; `req.body` is never read. Uses `getChatModel()` and `...CHAT_CALL_SETTINGS`, overridden with `maxOutputTokens: 100`, plus `maxRetries: 0` and `timeout: 15_000`.
- Response fields are whitelisted: `text`, `finishReason`, `usage` (input, output, text, reasoning, total), `model` (provider, requested model ID, response ID) and `warnings`.
- Errors: `ModelConfigurationError` → 500 "Server configuration error"; `TimeoutError` → 504; `APICallError` / `RetryError` → 502 "Model request failed"; anything else → 500 "Internal server error". The server log records only `kind`, `name`, `statusCode` and `isRetryable`. It never logs the raw error, URL, request body or response body.

**Test results (actual)**

| Test                                                                                 | Result                                                                                                 |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `tsc --noEmit` (whole project)                                                       | Pass                                                                                                   |
| Deprecation diagnostics `ts(6385)` (checker validated with a `CallSettings` control) | 0 in both files                                                                                        |
| Prettier                                                                             | Pass                                                                                                   |
| POST in dev (real call)                                                              | 200, about 0.95s. `finishReason: stop`; in 17, out 36 (text 36, reasoning 0), total 53; `warnings: []` |
| GET in dev                                                                           | 405, `Allow: POST`                                                                                     |
| POST with an injected body                                                           | 200; body ignored                                                                                      |
| `NODE_ENV` production or test (POST and GET)                                         | 404                                                                                                    |
| Key missing or blank                                                                 | 500 "Server configuration error"; log has no key                                                       |
| Invalid key                                                                          | 502 "Model request failed"; log: `AI_APICallError`, status 400, not retryable; no key                  |
| `next build` + `next start`                                                          | 404 for POST and GET                                                                                   |
| Real key in `.next/static` or the server build                                       | 0 files                                                                                                |
| Timeout path (504)                                                                   | **Not exercised live** (the code maps it; it would need a slow provider or an injectable timeout)      |

**Experiments: thinking and token limits**

- `maxOutputTokens: 5` → `finishReason: length`, text "In".
- `reasoning: 'low'`, 20 tokens → `length`; out 16 = 15 reasoning + 1 text. Thinking used up the budget, which shows reasoning is billed as output and shares the cap.
- `reasoning: 'low'`, 400 tokens, same prompt → reasoning 0. Thinking is dynamic and varies from run to run even at the same level.
- `reasoning: 'none'` → `compatibility` warning, mapped to `minimal`.
- In every run, `outputTokens === textTokens + reasoningTokens`, so there's no double counting.
- At `minimal`, ordinary prompts used 0 reasoning tokens.

**Correction:** the SDK does not expose the resolved model snapshot (for example `3.5-flash-lite-07-2026`). `response.modelId` only echoes the requested ID; the Google provider maps only `responseId`. Detecting snapshot changes would need another approach (Phase 3 concern).

### Found (pre-existing, not fixed)

- ESLint is broken repo-wide. ESLint 8 with the legacy `.eslintrc.json` crashes loading `eslint-config-next@16`, and `yarn lint` uses `next lint`, which Next 16 removed. Fixing it needs a migration to flat config. Tracked as an open item.

---

## 2026-11-23 — Session 1

### Completed

**Repository audit**

- Chat UI (`src/components/layout/modelChat/index.tsx`) is self-contained with mocked streaming. Reuse the visuals (bubbles, typing dots, composer, autoscroll). Remove the model selector and mock `send()` in Phase 2.
- Local `Message` type (`content: string`) must move to AI SDK `UIMessage` (`parts[]`) in Phase 2.
- Only API route is the `api/hello.ts` scaffold; `/api/chat` will be the first real route.
- Supabase is browser-only (`createClient`, session in localStorage). The server cannot read the session from cookies. Planned for Phase 3: client sends `Authorization: Bearer <access_token>`, server verifies it. `@supabase/ssr` is installed but unused.
- CSP `connect-src 'self'` is already compatible (browser only calls same-origin `/api/chat`).
- No test runner yet. Plan: add Vitest before Phase 2/3 logic.
- Tooling: Yarn Classic 1.22.22, Node 26.13.1, Next 16.1.6, TS strict.

**Model selection** (verified against Google docs on 2026-11-23)

- Chosen: `gemini-3.5-flash-lite`. Stable, no announced shutdown, and Google recommends it for new projects. Currently resolves to snapshot `3.5-flash-lite-07-2026`.
- Rejected `gemini-2.5-flash-lite` (access limited to existing users) and `gemini-3.1-flash-lite` (earliest shutdown May 7, 2027).
- Rules: pin the exact ID in `model.ts`, never use a `-latest` alias, minimal thinking by default, and count reasoning tokens in cost tracking.
- Paid Standard pricing: $0.30 / 1M input tokens, $2.50 / 1M output tokens (output includes thinking tokens).
- `CLAUDE.md` and `AI_CHAT_ROADMAP.md` updated to reflect this.

**API key and environment**

- Gemini API key created in a dedicated Google Cloud project and restricted to the Generative Language API.
- `GOOGLE_GENERATIVE_AI_API_KEY` set in `.env.local` (no `NEXT_PUBLIC_` prefix). Confirmed ignored by `.gitignore:28` (`.env*.local`).
- Connectivity verified via the model metadata endpoint: input limit 1,048,576, output limit 65,536, thinking supported.
- Not yet done: Vercel env var. Add it to Production only, marked Sensitive, when there's a route to deploy.
- Reminder: switch to the **paid tier before public launch**, because free-tier content is used to improve Google's products.

**Dependencies installed**

- `ai@7.0.181`: core SDK (`generateText`, `streamText`, usage, streaming helpers).
- `@ai-sdk/google@4.0.125`: Gemini provider. Only `model.ts` may import it.
- `zod@4.6.7`: peer dependency of `ai`, also used later for request validation. Now a direct dependency.
- `@ai-sdk/react` is deferred to Phase 2 (`useChat`).

**SDK facts verified in installed `node_modules`**

- Factory: `createGoogle` (`createGoogleGenerativeAI` is only a compatibility alias).
- Thinking: call-level `reasoning` option. For this model the supported levels are `minimal | low | medium | high`. `'none'` maps to `minimal` with a warning. Leaving it unset sends no config, so Google's default applies. `providerOptions.google.thinkingConfig` overrides `reasoning`, so never set both.
- `maxOutputTokens`: call-level option. The SDK only checks that it's an integer ≥ 1, with no upper bound. If unset, no limit is sent (up to 65,536), so always set it. It covers thinking and the answer together.
- Usage: `outputTokens` already **includes** reasoning. `outputTokenDetails.reasoningTokens` is a breakdown and must not be added on top. `reasoningTokens` is `number | undefined`, so log `undefined` as "not reported".
- v7 changes: `result.usage` is summed across steps (`totalUsage` is deprecated); `result.response` is deprecated in favor of `result.finalStep.response`; `result.warnings` exposes reasoning-mapping warnings.

### Key concepts learned

- Tokens: input and output are billed separately, output costs more, and thinking tokens are billed as output.
- Multi-turn chats re-send the full history, so cost grows roughly quadratically with conversation length.
- Choosing the free or paid tier is a data-retention decision as well as a cost decision.
- Billing alerts notify but don't stop spending. The hard cap comes from app code in Phase 3.
- Pinned model IDs vs. `-latest` aliases: model changes should be deliberate and reviewed.
- In the Pages Router, the `server-only` package doesn't work. Secret safety relies on the missing `NEXT_PUBLIC_` prefix plus importing secrets only from `pages/api/*`.

---

## Next session — exact starting point

**Task 2.2: connect the existing chat UI to `/api/chat` with `useChat`.** Start only after the user's explicit go-ahead.

- Install `@ai-sdk/react` (explain it first; pick a version at least two weeks old, pinned).
- In `src/components/layout/modelChat/index.tsx`: remove the model selector and the mock `send()`; render `UIMessage.parts` (text only); map `status` (`submitted` → typing dots, `streaming` → cursor); show error and "response cut off" (`finishReason: length`) states; add stop and retry.
- Keep business logic out of the component (CLAUDE.md).
- Update the page and footer copy that mentions multiple models.

### Open items / decisions deferred

**Task 2.2 (frontend) inputs**

- **Timeout UX:** a timed-out stream ends with an `abort` chunk (no error). Surface it to the user (see Session 4).
- **Regeneration:** compatible with the last-user-message rule. `regenerate()` slices history to just before the regenerated assistant message and sends `trigger: 'regenerate-message'` (verified in the SDK; covered by a test). `trigger: 'resume-stream'` is rejected with 400; don't enable `resume` in `useChat` until server-side stream storage exists.
- **`thoughtSignature` in the public stream:** decide whether to strip `providerMetadata` (Gemini's encrypted reasoning-state blob) from outgoing chunks. Today it's harmless for text-only chat, and inbound copies are already stripped by validation. Stripping saves payload and exposes less provider internals, but tool calling with thinking (Phase 5) needs signatures round-tripped, ideally from server-held history (Phase 4).

**Phase 3**

- **Token-based context budgets:** replace character limits (24k chars ≈ 6k tokens) with token budgets per tier, and decide between trimming history and rejecting. Account for the system prompt overhead (~120 input tokens per turn).
- **Cost accounting for aborted and timed-out generations:** no usage is reported (the provider never sends a final `finish`), yet generated tokens are billed. Estimate them, e.g. from streamed text length plus input size, and flag the entries as estimates.
- Supabase server-side verification (Bearer token planned), rate limiting, spend cap, correlation IDs in logs.

**Phase 4**

- **Server-controlled conversation history:** today the client sends and can fabricate the whole history, including assistant turns. Persisting conversations server-side (Supabase, with RLS) and loading history by conversation ID removes that and enables signature round-tripping.

**Tooling and deployment**

- **ESLint is broken (pre-existing):** ESLint 8 with the legacy `.eslintrc.json` crashes loading `eslint-config-next@16`, and `yarn lint` calls `next lint`, which Next 16 removed. Needs a migration to flat config and ESLint 9.
- Vercel: Production env var (Preview excluded until rate limiting exists); `maxDuration` for `/api/chat` at deploy time.
- Switch to the paid Gemini tier before public launch.
