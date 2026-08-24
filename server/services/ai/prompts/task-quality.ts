export const TASK_QUALITY_INSTRUCTIONS = `Task quality:
- Produce only independent, meaningful work items that are actually required by workstreamDecisions.
- Every task needs a stable, descriptive id, rationale, dependsOn task IDs, professional description, and testable acceptanceCriteria.
- Use Objective, Scope, Implementation Notes, Edge Cases, or Test Scope only where useful.
- Dependencies must reference task IDs, never workstream labels. Do not create circular dependencies.
- Do not copy or lightly paraphrase the raw requirement in task titles or descriptions.`;
