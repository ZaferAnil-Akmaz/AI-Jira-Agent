import type { GenerateRequest } from "@/lib/validation/schemas";
import { buildCapabilityAnalysisInstructions } from "@/server/services/ai/prompts/capability-analysis";
import { buildRequirementAnalysisInstructions } from "@/server/services/ai/prompts/requirement-analysis";
import { TASK_QUALITY_INSTRUCTIONS } from "@/server/services/ai/prompts/task-quality";

export function buildWorkBreakdownPrompt(input: GenerateRequest): string {
  const language = input.language === "tr" ? "Turkish" : "English";
  return `Analyze and plan the following product requirement. All human-readable Jira content must be written in ${language}.

Requirement (business intent; it is not a Jira task):
${input.requirement}

Additional product context:
${input.context || "None provided."}

${buildRequirementAnalysisInstructions()}

${buildCapabilityAnalysisInstructions(input)}

${TASK_QUALITY_INSTRUCTIONS}

Classify as new_feature, enhancement, bug, technical_task, or maintenance. Recommend an Epic only for a new_feature. Return all schema fields, including capabilityAnalysis, workstreamDecisions, warnings, task rationale, and task dependsOn IDs. Labels must be lowercase kebab-case.`;
}
