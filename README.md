# AI Product Jira Agent

**Turn ambiguous product requirements into explainable, reviewable, Jira-ready delivery plans with AI.**

[Documentation](docs/architecture.md) · [MIT License](LICENSE)

---

# Author

**Zafer Anıl Akmaz**

Product Manager • AI • Product Development

* GitHub: https://github.com/ZaferAnil-Akmaz
* LinkedIn: https://www.linkedin.com/in/zaferanilakmaz/

---
# License

This project is licensed under the MIT License.

See the **LICENSE** file for details.

---

## Problem

Product requirements are often too vague to directly become implementation-ready Jira work. A PM must reason about scope, data and backend needs, frontend behavior, design, QA, analytics, dependencies, risks, and ambiguity before tickets are useful.

## Solution

AI Product Jira Agent is an open-source Product Planning Engine. It turns a plain-language requirement into an explainable delivery plan: requirement analysis, capability checks, workstream decisions, rationale-rich tasks, task-to-task dependencies, semantic warnings, and an editable Jira preview. Jira is the execution destination; people approve every write.

## Example

**Input:** `Users should have a page where they can track their workouts.`

```text
Requirement
  ↓
AI analysis + assumptions
  ↓
Capability analysis (workout API: unknown / requires validation)
  ↓
Delivery plan (Design → Backend → Frontend → QA)
  ↓
Task rationale, acceptance criteria, and dependencies
  ↓
Human review and optional task revision
  ↓
Jira creation
```

If a supplied repository context confirms an existing workout API and persistence, the plan omits net-new backend work and explains why.

## Features

- Requirement analysis with assumptions, risks, and meaningful ambiguities
- Capability analysis for API, data, persistence, authorization, frontend, and analytics
- Explicit Design/Frontend/Backend/QA/Analytics workstream decisions with rationale
- Professional task descriptions, task rationale, stable task IDs, and task-to-task dependencies
- Deterministic semantic planning validation and review warnings
- Review, edit, delete, add, reorder, reprioritize, and revise individual tasks with AI
- Jira project context and similar-issue discovery APIs
- Server-side Jira integration and partial-failure reporting
- Idempotent creation requests, rate limits, request IDs, and safe logging
- Mock AI/Jira providers for local development and automated tests

## Architecture

```text
Next.js UI → REST route handlers → services → AI/Jira provider interfaces
                                           ├─ OpenAI / Mock AI
                                           └─ Jira REST / Mock Jira
```

See [architecture documentation](docs/architecture.md) for the detailed design.

## Demo

```text
Requirement → AI Analysis → Capability Analysis → Delivery Plan → Human Review → Jira Creation
```

Add a short product GIF or video to [`docs/demo/`](docs/demo/) when available. The application itself is the authoritative interactive demo.

## GitHub metadata

Recommended repository description: **AI Product Planning Agent that turns product requirements into explainable, reviewable, Jira-ready delivery plans.**

Recommended topics: `ai`, `ai-agent`, `product-management`, `product-manager`, `jira`, `atlassian`, `openai`, `llm`, `nextjs`, `typescript`, `product-planning`, `developer-tools`.

These are GitHub repository settings and must be applied manually in the GitHub UI.

## Quick start

```bash
git clone https://github.com/your-org/ai-product-jira-agent.git
cd ai-product-jira-agent
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The supplied configuration uses safe mock providers.

## Configuration

| Variable           | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `AI_PROVIDER`      | `mock` (default) or `openai`                         |
| `OPENAI_API_KEY`   | Required only for `AI_PROVIDER=openai`               |
| `OPENAI_MODEL`     | OpenAI model name                                    |
| `JIRA_PROVIDER`    | `mock` (default) or `rest`                           |
| `JIRA_BASE_URL`    | Jira Cloud URL, e.g. `https://example.atlassian.net` |
| `JIRA_EMAIL`       | Jira account email                                   |
| `JIRA_API_TOKEN`   | Jira API token; server-side only                     |
| `JIRA_PROJECT_KEY` | Default project key                                  |
| `LOG_LEVEL`        | Server logging level                                 |

Configuration is validated before a selected external provider is used. No credential is sent to the browser or logged.

## Jira setup

Create an Atlassian API token, set `JIRA_PROVIDER=rest`, and provide the Jira URL, account email, token, and project key in `.env.local`. The account needs permission to browse the project and create issues. See [Jira documentation](docs/jira.md).

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run eval
npm run test:e2e
npm run build
```

## Docker

```bash
docker compose up --build
```

Environment variables are injected at runtime; do not put secrets in Docker files.

## Testing

Unit tests cover schemas, semantic planning validation, configuration, idempotency, and issue mapping. Integration tests exercise AI generation and targeted task revision. Playwright covers requirement entry through mock Jira creation. `npm run eval` runs deterministic planning scenarios to guard backend decisions, dependencies, requirement leakage, and task relevance.

## Security

Review [SECURITY.md](SECURITY.md) and [security documentation](docs/security.md). Credentials are server-side, validation occurs at all API boundaries, and generated content is treated as untrusted input.

## Roadmap

- Persisted configuration and shared idempotency storage
- Jira hierarchy and component selection UI
- Jira OAuth and project-specific issue type mapping
- Organization authentication and audit history

## Contributing

Contributions are welcome; read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and the [development guide](docs/development.md).

<img width="1226" height="916" alt="Screen1" src="https://github.com/user-attachments/assets/aef001b8-9673-4bfe-a589-0a85a62ab7ec" />

