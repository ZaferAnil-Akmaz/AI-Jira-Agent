import { ok } from "@/lib/api/response";
import { getConfig } from "@/server/config/env";
import { getRuntimeJiraSettings } from "@/server/services/jira/runtime-settings";

/** Safe, non-secret configuration required by the browser workflow. */
export async function GET() {
  const config = getConfig();
  const runtimeSettings = getRuntimeJiraSettings();
  return ok({
    jiraProvider: runtimeSettings ? "rest" : config.JIRA_PROVIDER,
    jiraProjectKey: runtimeSettings?.projectKey ?? config.JIRA_PROJECT_KEY,
  });
}
