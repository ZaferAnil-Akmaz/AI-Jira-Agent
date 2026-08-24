import type { GenerateRequest } from "@/lib/validation/schemas";

export function buildCapabilityAnalysisInstructions(input: GenerateRequest): string {
  const context = input.repositoryContext
    ? JSON.stringify(input.repositoryContext, null, 2)
    : "No repository capability context was supplied.";
  return `Capability analysis:
- Populate capabilityAnalysis with API, data source/model, persistence, authorization/user ownership, frontend, design-system, and analytics capability where relevant.
- Use existing only when supported by supplied evidence. Otherwise use unknown or requires_validation; never claim an API, model, or service exists without evidence.
- For every design/frontend/backend/qa/analytics workstream, populate workstreamDecisions with a status and a concrete rationale.
- Backend decisions must consider data source, data model, persistence, business logic, API contract, authorization, validation, aggregation/calculation, and integrations.

Supplied repository context:
${context}`;
}
