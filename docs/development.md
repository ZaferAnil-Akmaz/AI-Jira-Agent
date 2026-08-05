# Development

Use Node 20.9 or newer. Copy `.env.example` to `.env.local`, install dependencies, and run `npm run dev`. Mock providers are the default and make no network calls.

Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` before opening a pull request. `npm run test:e2e` starts the local development server through Playwright. Docker uses a multi-stage standalone Next build and accepts the same environment variables.
