import { ok, apiError } from "@/lib/api/response";
import { getAIConfig, getJiraConfig } from "@/server/config/env";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const aiConfig = getAIConfig();
    const jiraConfig = getJiraConfig();
    return ok({
      status: "ready",
      aiProvider: aiConfig.AI_PROVIDER,
      jiraProvider: jiraConfig.JIRA_PROVIDER,
    });
  } catch (error) {
    return apiError(error, crypto.randomUUID());
  }
}
