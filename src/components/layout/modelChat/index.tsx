import { useEffect, useRef } from 'react';
import { CHAT_LIMITS } from '@/library/ai/chatContract';
import { REPLY_ENDING_NOTES, SEND_BLOCK_MESSAGES, getMessageText } from '@/library/chat/messages';
import { useChatSession } from '@/library/chat/useChatSession';
import { ChatMarkdown } from './ChatMarkdown';

/** Display only — the model is fixed and chosen on the server. */
const MODEL_LABEL = 'Gemini 3.5 Flash-Lite';

/** Show the character counter once the draft passes this share of the limit. */
const COUNTER_THRESHOLD = 0.8;

export default function ModelChat() {
  const chat = useChatSession();
  const { messages, status, isBusy, draft, sendCheck } = chat;

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status, chat.errorMessage]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    void chat.send();
  };

  const lastMessage = messages.at(-1);
  // Waiting for the first token (or the assistant message hasn't been created yet).
  const showTypingDots =
    status === 'submitted' || (status === 'streaming' && lastMessage?.role === 'user');
  const blockReason = !sendCheck.ok && sendCheck.reason !== 'empty' ? sendCheck.reason : undefined;
  const showCounter = draft.length >= CHAT_LIMITS.maxUserMessageChars * COUNTER_THRESHOLD;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-gray-900">
      <header className="flex shrink-0 items-center justify-between border-b border-gray-700/60 bg-gray-900 px-6 py-3">
        <div className="text-s flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 py-1.5 pr-3 pl-3 text-gray-200">
          <span className="h-2 w-2 rounded-full bg-[#64ffda]" aria-hidden="true" />
          {MODEL_LABEL}
        </div>
        <button
          type="button"
          onClick={() => void chat.clear()}
          disabled={messages.length === 0 && !chat.errorMessage}
          className="text-s rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-gray-200 transition-colors hover:border-[#64ffda] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-700"
        >
          Clear chat
        </button>
      </header>

      {/* ── Messages ─────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !chat.errorMessage ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-2xl font-bold text-white">What can I help you with?</p>
            <p className="max-w-xs text-sm text-gray-500">Ask anything to get started.</p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8" aria-live="polite">
            {messages.map((m) => {
              const text = getMessageText(m);
              const isStreamingThis =
                status === 'streaming' && m.role === 'assistant' && m.id === lastMessage?.id;
              const ending = m.role === 'assistant' ? chat.getReplyEnding(m.id) : undefined;
              const note = ending ? REPLY_ENDING_NOTES[ending] : undefined;
              const isLast = m.id === lastMessage?.id;

              if (m.role === 'assistant' && text.length === 0 && !isStreamingThis) return null;

              return (
                <div
                  key={m.id}
                  className={`animate__animated animate__fadeIn animate__faster flex ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="mt-0.5 mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#64ffda]/30 bg-[#64ffda]/10">
                      <span className="text-[10px] font-bold text-[#64ffda]">AI</span>
                    </div>
                  )}
                  <div className="flex max-w-[85%] min-w-0 flex-col">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed break-words ${
                        m.role === 'user'
                          ? 'rounded-br-sm bg-[#64ffda] font-medium whitespace-pre-wrap text-gray-900'
                          : 'rounded-bl-sm bg-gray-800 text-gray-200'
                      }`}
                    >
                      {m.role === 'user' ? text : <ChatMarkdown text={text} />}
                      {/* blinking cursor while streaming */}
                      {isStreamingThis && text.length > 0 && (
                        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#64ffda] align-middle" />
                      )}
                    </div>
                    {note && (
                      <p className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-500">
                        {note}
                        {isLast && chat.canRetry && !chat.errorMessage && (
                          <button
                            type="button"
                            onClick={() => void chat.retry()}
                            className="text-[#64ffda] hover:underline"
                          >
                            Retry
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing dots — before first token arrives */}
            {showTypingDots && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#64ffda]/30 bg-[#64ffda]/10">
                  <span className="text-[10px] font-bold text-[#64ffda]">AI</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-gray-800 px-4 py-3.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#64ffda] [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#64ffda] [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#64ffda]" />
                </div>
              </div>
            )}

            {chat.errorMessage && (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                <span>{chat.errorMessage}</span>
                {chat.canRetry && (
                  <button
                    type="button"
                    onClick={() => void chat.retry()}
                    className="shrink-0 rounded-lg border border-red-400/40 px-3 py-1 text-xs text-red-100 transition-colors hover:border-red-300"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Composer ─────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-gray-700/60 bg-gray-900 px-4 py-4">
        <form
          onSubmit={onSubmit}
          className="mx-auto flex w-full max-w-2xl items-end gap-3 rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3 transition-colors focus-within:border-[#64ffda]/50"
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => chat.setDraft(e.target.value)}
            placeholder="Message Nicode AI…"
            aria-label="Message"
            rows={1}
            maxLength={CHAT_LIMITS.maxUserMessageChars}
            onKeyDown={(e) => {
              // Ignore Enter while an IME composition is in progress.
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void chat.send();
              }
            }}
            className="max-h-40 flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          {isBusy ? (
            <button
              type="button"
              onClick={() => void chat.stop()}
              aria-label="Stop generating"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#64ffda] text-gray-900 transition-all duration-200 hover:shadow-[0_0_12px_#64ffda55]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!sendCheck.ok}
              aria-label="Send message"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#64ffda] text-gray-900 transition-all duration-200 hover:shadow-[0_0_12px_#64ffda55] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          )}
        </form>
        <div className="mx-auto mt-2 flex w-full max-w-2xl justify-center gap-3 text-center text-[11px]">
          {blockReason ? (
            <p className="text-amber-400">{SEND_BLOCK_MESSAGES[blockReason]}</p>
          ) : (
            <p className="text-gray-600">AI can make mistakes. Check important information.</p>
          )}
          {showCounter && (
            <p className="text-gray-500">
              {draft.length.toLocaleString('en-US')} /{' '}
              {CHAT_LIMITS.maxUserMessageChars.toLocaleString('en-US')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
