# AI Chat Integration — Implementation & Learning Plan

## 1. Project Overview

I have an existing personal blog built with:

- Next.js 16 (Pages Router)
- React + TypeScript
- Tailwind CSS
- Supabase Authentication
- An existing chat page with UI only

**Goal:** Transform the existing chat page into a fully functional AI chatbot similar to ChatGPT or Claude.

### Requirements

- One AI model, no model selector.
- Real-time streaming responses.
- Clean, responsive chat interface.
- Support for multi-turn conversations.
- Secure server-side AI integration.
- Rate limiting and cost protection.
- Optional authentication using existing Supabase setup.
- Maintainable, production-quality architecture.

**Long-term goal:** Use this project to learn AI engineering and gradually introduce LangChain, RAG, tool calling, and agentic workflows.

Do not overengineer the initial implementation.

---

## 2. Technology Decisions

| Component               | Decision                                                                      |
| ----------------------- | ----------------------------------------------------------------------------- |
| Frontend                | Existing Next.js + React + TypeScript                                         |
| AI model                | Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`, pinned; minimal/low thinking) |
| AI integration          | Vercel AI SDK                                                                 |
| Streaming               | Vercel AI SDK `useChat`                                                       |
| Backend                 | Next.js Pages Router API routes                                               |
| Authentication          | Existing Supabase                                                             |
| Rate limiting           | Redis-backed rate limiter                                                     |
| Conversation storage    | Supabase (later phase)                                                        |
| Future AI orchestration | LangChain / LangGraph                                                         |

### Architecture

```text
Visitor
   |
   v
Next.js Chat UI
   |
   | useChat()
   v
POST /api/chat
   |
   +-- Validate request
   +-- Verify Supabase session (if logged in)
   +-- Apply rate limits
   +-- Enforce context / token limits
   |
   v
Vercel AI SDK
   |
   v
Gemini 3.5 Flash-Lite
   |
   v
Streaming response
   |
   v
Chat UI
```

Important: The Gemini API key must never be exposed to the browser.

---

# 3. Implementation Roadmap

## Phase 1 — Project Audit and AI Setup

**Objective:** Understand the existing code and prepare the AI integration.

### Tasks

1. Review the existing project structure.
2. Inspect the current chat page and components.
3. Review the existing Supabase authentication implementation.
4. Confirm dependencies and deployment environment.
5. Create and configure a Google Gemini API key.
6. Install the Vercel AI SDK and Gemini provider integration.
7. Configure server-side environment variables.

### Learning objectives

- How LLM APIs work.
- Input tokens vs. output tokens.
- Model context windows.
- API authentication and secrets.
- Basic inference pricing.

### Definition of done

The project is configured to make authenticated server-side calls to Gemini without exposing credentials.

---

## Phase 2 — Build the Streaming Chat

**Objective:** Implement the first working AI conversation.

### Tasks

1. Create `src/pages/api/chat.ts`.
2. Integrate Gemini using Vercel AI SDK.
3. Implement streaming responses.
4. Connect the existing chat page using `useChat`.
5. Display user and assistant messages.
6. Add loading and error states.
7. Support multi-turn conversations.
8. Add cancellation and retry behavior where appropriate.

### Learning objectives

- Streaming HTTP responses.
- LLM message roles.
- System prompts.
- Multi-turn conversation context.
- Context windows and token limits.
- Server-side vs. client-side responsibilities.

### Definition of done

A visitor can send messages, receive streamed AI replies, and continue the conversation without refreshing the page.

**Important:** Do not introduce LangChain yet.

---

## Phase 3 — Security, Rate Limiting, and Cost Control

**Objective:** Make the chat safe for public access.

### Tasks

1. Validate all incoming chat messages.
2. Limit message length and conversation history.
3. Set maximum output tokens.
4. Implement rate limiting with a shared Redis store.
5. Create different limits for anonymous and authenticated visitors.
6. Verify Supabase identities on the server.
7. Add basic bot protection where necessary.
8. Handle API timeouts, rate-limit errors, and provider failures.
9. Add structured logs and usage monitoring (input, output, and reasoning/thinking tokens; reasoning tokens are billed as output).
10. Implement an application-level spending limit and emergency disable switch.

### Initial limits

| Type                  | Anonymous | Authenticated |
| --------------------- | --------: | ------------: |
| Messages per day      |         5 |            30 |
| Requests per minute   |         2 |             5 |
| Maximum output tokens |       500 |         1,000 |

### Learning objectives

- API security.
- Authentication vs. authorization.
- Rate limiting.
- Token-based cost calculation.
- Observability.
- Failure handling in production AI systems.

### Definition of done

The chatbot can be publicly deployed with enforceable usage quotas and monitored costs.

---

## Phase 4 — Conversation Persistence and UX

**Objective:** Improve the experience and add conversation history.

### Tasks

1. Design a conversation schema in Supabase.
2. Store conversations and messages for authenticated users.
3. Restore previous conversations.
4. Support creating and deleting conversations.
5. Add a clear-chat option.
6. Improve scrolling and streaming UX.
7. Add Markdown and code-block rendering.
8. Handle reconnects, cancelled requests, and partial responses.
9. Enforce database row-level security and verify conversation ownership.

### Learning objectives

- AI conversation storage.
- Database schema design.
- Context management.
- Chat history vs. model context.
- Privacy and data retention.

### Definition of done

Authenticated visitors can return to their previous conversations securely.

**Note:** Conversation persistence is optional for the initial launch. Complete it after the streaming chat is secure.

---

# 4. Future AI Engineering Roadmap

Once the basic chat is production-ready, gradually introduce more advanced AI features.

## Phase 5 — Structured Outputs and Tool Calling

**Feature:** Give the chatbot useful capabilities beyond conversation.

Potential examples:

- Retrieve information about my blog.
- Recommend relevant articles.
- Return structured data.
- Call internal APIs.
- Provide information about my projects and experience.

### Technologies

- Vercel AI SDK tool calling.
- Zod schema validation.
- External APIs.

### Learning objectives

- Function/tool calling.
- Structured outputs.
- Tool execution and permissions.
- AI workflows.
- Prompt injection and tool security.

**Goal:** Understand how models interact with application functionality before adopting LangChain.

---

## Phase 6 — LangChain + RAG

**Feature:** Let visitors ask questions about my blog articles and projects.

Example:

> "What has the author written about React performance optimization?"

Instead of relying only on the model's existing knowledge, retrieve relevant content from my blog and provide it as context.

### Architecture

```text
User question
     |
     v
LangChain retrieval pipeline
     |
     v
Embeddings + Vector Store
     |
     v
Relevant blog content
     |
     v
LLM with retrieved context
     |
     v
Streaming answer + citations
```

### Technologies to evaluate

- LangChain.js for an initial TypeScript integration.
- LangChain Python if introducing a separate Python AI backend.
- Gemini embeddings or another suitable embedding model.
- Supabase pgvector for vector storage.
- Document chunking and indexing.

### Learning objectives

- Embeddings.
- Vector similarity search.
- Document chunking.
- Semantic retrieval.
- Retrieval-Augmented Generation.
- Hallucination reduction.
- AI evaluation and retrieval quality.

### Definition of done

Visitors can ask questions about my published articles, and the assistant answers using retrieved content with references to the source articles.

---

## Phase 7 — LangGraph and Agentic Workflows

**Feature:** Introduce controlled multi-step AI workflows.

Potential example:

An AI assistant that can:

1. Understand a question.
2. Determine whether it needs external information.
3. Search blog content or call an external API.
4. Process the results.
5. Generate a response.

### Technologies

- LangGraph.
- LangChain.
- Tool calling.
- State management.
- Observability and tracing.

### Learning objectives

- Agent architecture.
- Workflow orchestration.
- Stateful AI systems.
- Tool execution.
- Error recovery.
- AI evaluation.
- Latency and cost optimization.

### Definition of done

At least one reliable, measurable multi-step AI workflow is running in production.

---

# 5. Suggested Project Structure

Adapt to the existing repository rather than unnecessarily restructuring working code.

```text
src/
├── pages/
│   ├── chat.tsx
│   └── api/
│       └── chat.ts
│
├── components/
│   └── chat/
│       ├── ChatInput.tsx
│       ├── ChatMessages.tsx
│       └── ChatMessage.tsx
│
├── library/
│   └── ai/
│       ├── model.ts
│       ├── prompts.ts
│       ├── validation.ts
│       ├── limits.ts
│       └── usage.ts
│
└── ...
```

For future phases, introduce additional modules or services only when necessary. Keep the current architecture easy to understand.

---

# 6. Engineering Standards

Treat this as a real production application.

All implementation should follow these principles:

- TypeScript strict typing.
- Separation of concerns.
- Reusable components and services.
- Server-only secrets.
- Input validation.
- Reliable error handling.
- Secure authentication.
- Rate limiting.
- Logging and monitoring.
- Unit and integration tests.
- Database access controls.
- Cost tracking.
- Minimal unnecessary dependencies.

Evaluate quality, latency, cost, and reliability as features are added.

---

# 7. Instructions for Claude — Act as My AI Engineering Mentor

You are helping me implement this project as a senior software engineer transitioning into AI engineering.

My strongest skills are React, TypeScript, Next.js, frontend architecture, and API integrations. I want to learn AI engineering through practical implementation.

Follow these rules:

1. **Start by reviewing my existing repository.** Understand the current architecture before making changes.
2. Do not rewrite existing working functionality unless necessary.
3. Work one phase and one manageable task at a time.
4. Explain the AI engineering concepts behind each implementation.
5. Do not generate the entire finished solution immediately.
6. Let me implement meaningful portions of the code and review my work.
7. Explain architectural tradeoffs before introducing dependencies.
8. Prefer production-quality solutions over tutorial shortcuts.
9. Use current official documentation, especially for Vercel AI SDK and Next.js 16 Pages Router compatibility.
10. Keep security, reliability, and cost control in mind throughout.
11. Introduce LangChain only when we reach features that benefit from it.
12. When we introduce a Python AI service, teach me idiomatic Python, FastAPI, testing, and deployment.
13. At the end of each task, summarize what I learned, what was completed, and the next task.
14. Do not proceed to the next major phase without reviewing the current implementation.

## First assignment

Review my existing Next.js project and chat UI.

Identify:

- What can be reused.
- Which dependencies are needed.
- Where the chat API should live.
- How to integrate streaming with my current UI.
- Any compatibility issues with Next.js 16 Pages Router.
- Which environment variables must be configured.

Then give me the **first small implementation task**, explain why it matters, and guide me through writing it.

Do not implement all phases at once.
