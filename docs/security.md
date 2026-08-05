# Security model

Secrets stay in environment variables on the server. `.env.local` is ignored, APIs never echo tokens, and the structured logger removes fields whose names imply credentials. External request bodies and all AI results use Zod validation.

This MVP uses in-memory rate limiting and idempotency, which are per-process and reset on deploy. Put the app behind an authenticated gateway and replace these with shared infrastructure before multi-instance production use. Treat generated Jira content as untrusted user-visible content and review it before approval.
