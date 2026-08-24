# Architecture

The application is a human-in-the-loop Product Planning Engine. The browser never receives AI or Jira credentials; it submits untrusted user input to validated REST routes.

```text
Requirement
  ↓
Requirement analysis (AI)
  ↓
Capability analysis (AI constrained by supplied repository context)
  ↓
Workstream decision + task planner (AI)
  ↓
Structural validation (Zod)
  ↓
Semantic planning validation (deterministic)
  ↓
Human review, editing, targeted task revision
  ↓
Jira creation
```

```text
Browser → /api/* route → service → provider interface → external service
                                  ├─ AIProvider: MockAIProvider | OpenAIProvider
                                  └─ JiraProvider: MockJiraProvider | JiraRestProvider
```

## Planning domain

`WorkBreakdown` holds the reviewable plan: requirement analysis, optional `RepositoryContext`, `CapabilityAnalysis`, `WorkstreamDecision`, rationale-rich tasks, stable `dependsOn` task IDs, and `PlanningWarning` values. Repository facts are optional inventories (APIs, models, services, routes, components, analytics, authentication, notes). The planner never invents them; missing evidence is represented as `unknown` or `requires_validation`.

Prompts are separated by responsibility—requirement analysis, capability analysis, and task quality—while the product makes one structured planning call for cost and latency control. A targeted task-revision call is used only when a reviewer asks to improve one task.

## Validation and delivery

`lib/validation` owns Zod boundary contracts. `semantic-planning-validator` checks planning coherence after structural validation: task-ID references, backend/capability conflicts, missing QA, duplicate scope, absent rationale, and unknown architecture. Warnings are visible to reviewers and do not silently block human judgment.

`JiraIssueMapper` remains separate so the planning model is not coupled to Jira payloads. The creation endpoint is explicit human approval only, supports partial failures, and uses a stable client creation-operation identifier as an `Idempotency-Key`. The current in-memory 24-hour store is appropriate only for a single-instance MVP; production should use Redis or a database.

## Evaluation

The `evals/` fixtures and `npm run eval` provide deterministic regression coverage for planning decisions such as existing versus missing backend capability, dependency correctness, requirement leakage, and task rationale.
