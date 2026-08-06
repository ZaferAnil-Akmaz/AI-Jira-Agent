# AI Product Jira Agent

Turn product requirements into reviewable, Jira-ready work items—with a human approving every creation.

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

## Overview

AI Product Jira Agent is an open-source product-management copilot. It turns a plain-language requirement into a structured user story, acceptance criteria, and FE/BE/QA/analytics/design tasks. The result is always editable and is never sent to Jira until a person explicitly approves it.

## Why?

Turning an approved product idea into consistently scoped delivery work is repetitive and error-prone. This tool accelerates the first draft while keeping product judgment and Jira writes under human control.

## Features

- Structured requirement analysis and validated AI output
- User stories, acceptance criteria, and workstream decomposition
- Review, edit, delete, add, reprioritize, and reorder tasks
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

_A product walkthrough video/GIF will be added in a future release._

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
npm run test:e2e
npm run build
```

## Docker

```bash
docker compose up --build
```

Environment variables are injected at runtime; do not put secrets in Docker files.

## Testing

Unit tests cover schemas, configuration, and issue mapping. Integration tests exercise the service boundaries with mock providers. The Playwright flow covers requirement entry through mock Jira creation.

## Security

Review [SECURITY.md](SECURITY.md) and [security documentation](docs/security.md). Credentials are server-side, validation occurs at all API boundaries, and generated content is treated as untrusted input.

## Roadmap

- Persisted configuration and idempotency storage
- Jira hierarchy and component selection UI
- Additional AI providers and Jira MCP provider
- Organization authentication and audit history

## Contributing

Contributions are welcome; read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and the [development guide](docs/development.md).
