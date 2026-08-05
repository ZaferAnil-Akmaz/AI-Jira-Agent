# Architecture

The UI is a Next.js client workflow. It only calls REST routes and never holds provider credentials. Route handlers validate requests, attach request telemetry, apply lightweight rate limits, and delegate work to services.

```text
Browser → /api/* route → service → provider interface → external service
                                  ├─ AIProvider: MockAIProvider | OpenAIProvider
                                  └─ JiraProvider: MockJiraProvider | JiraRestProvider
```

`lib/validation` owns Zod contracts. `lib/errors` supplies stable machine-readable errors. `server/services` owns application orchestration; `server/providers` owns HTTP/SDK integration. `JiraIssueMapper` is deliberately separate so the AI domain model does not become coupled to Jira payloads.

The creation endpoint uses an `Idempotency-Key`; the current in-memory store retains a completed result for 24 hours. This is appropriate for a single-instance MVP only. Production deployments should replace it with a shared, durable store.
