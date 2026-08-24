export function buildRequirementAnalysisInstructions(): string {
  return `Requirement analysis:
- Treat the requirement as business intent, never as a Jira task.
- Populate analysis.userProblem, businessGoal, actor, desiredOutcome, scope, explicitRequirements, implicitRequirements, ambiguities, assumptions, and risks.
- Do not invent product facts. If a decision changes implementation, preserve it as an ambiguity and state a low-risk assumption where possible.`;
}
