import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { jiraSearchSchema } from "@/lib/validation/schemas";
import { JiraService } from "@/server/services/jira/jira-service";
export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    enforceRateLimit(`jira-search:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const input = jiraSearchSchema.parse(await request.json());
    return ok(await new JiraService().searchIssues(input.projectKey, input.query));
  } catch (error) {
    return apiError(error, requestId);
  }
}
