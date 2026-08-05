import type { GenerateRequest } from "@/lib/validation/schemas";

export function buildWorkBreakdownPrompt(input: GenerateRequest): string {
  const language = input.language === "tr" ? "Turkish" : "English";
  return `Analyze and plan the following product requirement. All human-readable Jira content must be written in ${language}.

Requirement (business intent; it is not a Jira task):
${input.requirement}

Additional product context:
${input.context || "None provided."}

Work in this order:
1. Identify actor, user problem, desired outcome, explicit scope, risks, and ambiguity. Preserve unknowns in analysis. Do not infer product facts that are not present in the requirement/context.
2. Assess data needs: data source, model, persistence, user ownership, business logic, API/data contract, authorization, validation, aggregation/calculation, and integrations.
3. Decide backend work from that assessment. Reuse a known existing capability; create no backend task when it is sufficient. If capability is unknown, state the assumption/ambiguity and create an assessment-and-implementation task only when the page cannot be delivered without resolving it.
4. Classify as new_feature, enhancement, bug, technical_task, or maintenance. For a new_feature recommend a professional Epic.
5. Decompose only genuinely required independent deliverables across design, frontend, backend, qa, analytics. Define dependencies by team type.

Every generated task title must be short, action-oriented, feature-specific, and different from the raw requirement. Never paste or lightly paraphrase the raw requirement as a title or description. Write team-specific descriptions using only helpful sections such as Objective, Scope, Implementation Notes, Edge Cases, or Test Scope. Include testable acceptance criteria. Do not use generic placeholders such as "approved feature" or "feature delivery". Labels must be lowercase kebab-case.`;
}
