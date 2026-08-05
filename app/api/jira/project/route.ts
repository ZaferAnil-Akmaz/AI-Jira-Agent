import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api/response";
import { JiraService } from "@/server/services/jira/jira-service";
export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    const projectKey =
      request.nextUrl.searchParams.get("projectKey") ?? process.env.JIRA_PROJECT_KEY ?? "PROD";
    return ok(await new JiraService().getProject(projectKey));
  } catch (error) {
    return apiError(error, requestId);
  }
}
