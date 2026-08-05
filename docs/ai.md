# AI design

The AI layer is provider-agnostic. `AIService` depends on `AIProvider`; OpenAI calls only exist in `OpenAIProvider`. Prompts live under `server/services/ai/prompts` rather than API routes.

OpenAI responses are requested as JSON and validated against the strict Zod `workBreakdownSchema` before being returned. If parsing or validation fails, the endpoint returns a typed error and the raw response is not exposed. Prompts tell the model not to invent requirements; ambiguity should produce no assumptions rather than confident fabrication.

`MockAIProvider` provides deterministic local development and test behavior. A future Anthropic or local provider can implement the same interface.
