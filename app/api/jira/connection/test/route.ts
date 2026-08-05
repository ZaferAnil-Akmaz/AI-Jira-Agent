import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api/response";
import { jiraConnectionSchema } from "@/lib/validation/schemas";
import { JiraRestProvider } from "@/server/providers/jira/jira-rest-provider";
import { saveRuntimeJiraSettings } from "@/server/services/jira/runtime-settings";
export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const input = jiraConnectionSchema.parse(await request.json());
    const settings = {
      baseUrl: input.baseUrl,
      email: input.email,
      apiToken: input.apiToken,
      projectKey: input.projectKey,
    };
    const provider = new JiraRestProvider(settings);
    const [account, project] = await Promise.all([
      provider.testConnection(),
      provider.getProject(input.projectKey),
    ]);
    saveRuntimeJiraSettings(settings);
    return ok({ ...account, project: { key: project.key, name: project.name } });
  } catch (error) {
    return apiError(error, requestId);
  }
}
