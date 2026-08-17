import { useState, useRef, useEffect } from 'react';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const MODEL_OPTIONS = [
  { id: 'claude-sonnet', label: 'Claude Sonnet' },
  { id: 'claude-opus', label: 'Claude Opus' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
  { id: 'gemini-pro', label: 'Gemini 1.5 Pro' },
] as const;

const MOCK_REPLY =
  "This is a mock response. Real model integration comes later — for now you're just seeing the UI working end to end.";

export default function ModelChat() {
  const [model, setModel] = useState<string>(MODEL_OPTIONS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const send = () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }]);
    setInput('');
    setIsStreaming(true);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: MOCK_REPLY.slice(0, i) } : m)),
      );
      if (i >= MOCK_REPLY.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 18);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-700/60 bg-gray-900 px-6 py-3">
        <span className="text-sm font-bold tracking-tight text-[#64ffda]">Nicode AI Chat</span>

        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isStreaming}
            className="cursor-pointer appearance-none rounded-lg border border-gray-700 bg-gray-800 py-1.5 pr-8 pl-3 text-xs text-gray-200 transition-colors outline-none focus:border-[#64ffda] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id} className="bg-gray-800">
                {m.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 text-[#64ffda]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </header>

      {/* ── Messages ─────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-2xl font-bold text-white">What can I help you with?</p>
            <p className="max-w-xs text-sm text-gray-500">
              Select a model above, then ask anything to get started.
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
            {messages.map((m) => (
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
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-[#64ffda] font-medium text-gray-900'
                      : 'rounded-bl-sm bg-gray-800 text-gray-200'
                  }`}
                >
                  {m.content}
                  {/* blinking cursor while streaming */}
                  {isStreaming && m.role === 'assistant' && m.content.length > 0 && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#64ffda] align-middle" />
                  )}
                </div>
              </div>
            ))}

            {/* Typing dots — before first token arrives */}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Nicode AI…"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="max-h-40 flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#64ffda] text-gray-900 transition-all duration-200 hover:shadow-[0_0_12px_#64ffda55] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-gray-600">
          AI can make mistakes. Switch models anytime using the menu above.
        </p>
      </div>
    </div>
  );
}
