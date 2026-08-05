# API

All successful responses are `{ "success": true, "data": ... }`. Failures are `{ "success": false, "error": { "code", "message" }, "requestId" }`.

| Method | Path                                | Purpose                                                  |
| ------ | ----------------------------------- | -------------------------------------------------------- |
| GET    | `/api/health`                       | Liveness response `{ status: "ok" }`                     |
| GET    | `/api/health/ready`                 | Validates active provider configuration                  |
| POST   | `/api/ai/generate`                  | Validated requirement to work breakdown                  |
| POST   | `/api/jira/connection/test`         | Tests supplied Jira credentials; token is never returned |
| GET    | `/api/jira/project?projectKey=PROD` | Project metadata, issue types, priorities, components    |
| POST   | `/api/jira/issues/search`           | `{ query, projectKey }` similar issues                   |
| POST   | `/api/jira/issues`                  | `{ projectKey, issues }` approved Jira writes            |

`POST /api/ai/generate` accepts `requirement`, optional `context`, and selected `taskTypes`. Jira creation accepts an optional `Idempotency-Key` header. Its result always includes `created` and `failed`, so partial failures are visible.

Common errors: `VALIDATION_ERROR`, `AI_PROVIDER_ERROR`, `AI_OUTPUT_INVALID`, `JIRA_AUTHENTICATION_FAILED`, `JIRA_PERMISSION_DENIED`, `JIRA_ISSUE_CREATION_FAILED`, and `RATE_LIMITED`.
