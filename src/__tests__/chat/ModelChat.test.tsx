// @vitest-environment jsdom
/**
 * The chat UI (real component + hook) against the real /api/chat handler with a mock model.
 * Verifies user-visible feedback for the edge cases, through buttons and keyboard only.
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { NextApiHandler } from 'next';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/chat';
import { getChatModel } from '@/library/ai/model';
import ModelChat from '@/components/layout/modelChat';
import {
  fixed,
  scriptedModel,
  silenceServerLogs,
  stalling,
  startChatBackend,
  textReply,
} from '@/__tests__/chat/testUtils';

vi.mock('@/library/ai/model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/library/ai/model')>();
  return { ...actual, getChatModel: vi.fn() };
});

let backend: Awaited<ReturnType<typeof startChatBackend>>;

beforeAll(() => {
  // jsdom does not implement element scrolling.
  Element.prototype.scrollTo = () => {};
});

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'development');
  silenceServerLogs();
});

afterEach(async () => {
  cleanup();
  await backend?.close();
});

const textbox = () => screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });
const type = (value: string) => fireEvent.change(textbox(), { target: { value } });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ModelChat', () => {
  it('shows the fixed model and no model selector', async () => {
    backend = await startChatBackend(handler);
    render(<ModelChat />);
    expect(screen.getByText('Gemini 3.5 Flash-Lite')).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('sends once for a rapid double Enter and renders the streamed Markdown reply', async () => {
    vi.mocked(getChatModel).mockReturnValue(scriptedModel([fixed(textReply('Hello **world**'))]));
    backend = await startChatBackend(handler);
    render(<ModelChat />);

    type('Hi');
    fireEvent.keyDown(textbox(), { key: 'Enter' });
    fireEvent.keyDown(textbox(), { key: 'Enter' });

    await waitFor(() => expect(screen.getByText('world').tagName).toBe('STRONG'));
    expect(backend.requests).toHaveLength(1);
    expect(screen.getAllByText('Hi')).toHaveLength(1);
  });

  it('shows "Response stopped." with Retry when stopped before the first token', async () => {
    const model = scriptedModel([stalling([]), fixed(textReply('Second try.'))]);
    vi.mocked(getChatModel).mockReturnValue(model);
    backend = await startChatBackend(handler);
    render(<ModelChat />);

    type('Hi');
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    const stopButton = await screen.findByRole('button', { name: 'Stop generating' });
    // Stop only once the request has reached the (stalling) model, i.e. truly "before the
    // first token" — not while the request body is still being uploaded.
    await waitFor(() => expect(model.doStreamCalls).toHaveLength(1));
    await act(async () => {
      fireEvent.click(stopButton);
    });

    expect(await screen.findByText('Response stopped.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Second try.')).toBeTruthy();
    expect(screen.queryByText('Response stopped.')).toBeNull();
  });

  it('restores a rejected message into the composer alongside a newer draft', async () => {
    const rejecting: NextApiHandler = async (_req, res) => {
      await sleep(100);
      res.status(400).json({ error: 'Invalid request' });
    };
    backend = await startChatBackend(rejecting);
    render(<ModelChat />);

    type('My long question');
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(textbox().value).toBe(''));
    type('A new thought');

    expect((await screen.findByRole('alert')).textContent).toMatch(/too long/);
    await waitFor(() => expect(textbox().value).toContain('My long question'));
    expect(textbox().value).toContain('A new thought');
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('clears an actively streaming conversation and it stays cleared', async () => {
    const words = Array.from({ length: 60 }, (_, i) => `w${i}`).join(' ');
    vi.mocked(getChatModel).mockReturnValue(scriptedModel([fixed(textReply(words), 15)]));
    backend = await startChatBackend(handler);
    render(<ModelChat />);

    type('Old conversation');
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await screen.findByText(/w3/);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Clear chat' }));
    });
    await act(() => sleep(300));

    expect(screen.queryByText('Old conversation')).toBeNull();
    expect(screen.queryByText(/w3/)).toBeNull();
    expect(screen.getByText('What can I help you with?')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
