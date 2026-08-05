# Jira integration

The REST provider supports Jira Cloud-style Basic authentication with an Atlassian account email and API token. Generate a token in the Atlassian account security settings, then set the Jira variables in `.env.local`. Never use a password.

Settings validates the entered project key against Jira while it tests the account. The approved Base URL, email, token, and project key remain only in the server process memory until changed or until the app restarts. A Jira user may have access to multiple projects, so the project is intentionally confirmed once in Settings instead of inferred from credentials.

The provider dynamically reads project metadata, issue types, priorities, and components. Jira calls are server-side only. Search treats similar issues as optional context, never as source material to copy.

Creation reports each successful key and URL while preserving failures. Send an `Idempotency-Key` per user-approved submission to avoid retries blindly duplicating an already-completed request. Parent relationship and component fields are present in the domain input for future hierarchy/UI support.

Jira MCP is intentionally not required. A future MCP-backed provider can implement `JiraProvider` without changing services or UI.
