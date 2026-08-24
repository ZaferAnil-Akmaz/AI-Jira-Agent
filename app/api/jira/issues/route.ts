import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createIssuesSchema } from "@/lib/validation/schemas";
import { JiraService } from "@/server/services/jira/jira-service";
import {
  readIdempotentResult,
  saveIdempotentResult,
} from "@/server/services/jira/idempotency-store";
import { analytics } from "@/server/services/analytics/analytics";
import { getConfig } from "@/server/config/env";
import { getRuntimeJiraSettings } from "@/server/services/jira/runtime-settings";
import { resolveJiraIssueType } from "@/server/services/jira/issue-type-mapping";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  try {
    enforceRateLimit(`jira-create:${request.headers.get("x-forwarded-for") ?? "local"}`, 5);
    const idempotencyKey = request.headers.get("idempotency-key");
    if (idempotencyKey && idempotencyKey.length > 200) throw new Error("Invalid idempotency key.");
    const runtimeSettings = getRuntimeJiraSettings();
    const config = getConfig();
    const jiraProvider = runtimeSettings ? "rest" : config.JIRA_PROVIDER;
    const cached = idempotencyKey ? readIdempotentResult(idempotencyKey) : undefined;
    const input = createIssuesSchema.parse(await request.json());
    // The server-selected project is authoritative; never trust a stale browser value.
    const projectKey = runtimeSettings?.projectKey ?? config.JIRA_PROJECT_KEY;
    if (cached) return ok({ ...cached, idempotent: true, jiraProvider, projectKey });
    analytics.track("jira_creation_started");
    const service = new JiraService();
    let epic: { key: string; url: string } | undefined;
    const failed: Array<{ index: number; message: string; stage: "epic" | "task" }> = [];
    if (input.epic) {
      try {
        epic = await service.createIssue({ ...input.epic, projectKey, issueType: "Epic" });
      } catch {
        failed.push({ index: -1, stage: "epic", message: "Jira could not create the Epic." });
      }
    }
    const settled =
      epic || !input.epic
        ? await Promise.allSettled(
            input.issues.map((issue) =>
              service.createIssue({
                ...issue,
                issueType: resolveJiraIssueType(issue.workstream, issue.issueType),
                projectKey,
                parentKey: epic?.key,
              }),
            ),
          )
        : [];
    const result = {
      epic,
      created: settled.flatMap((entry) => (entry.status === "fulfilled" ? [entry.value] : [])),
      failed: [
        ...failed,
        ...settled.flatMap((entry, index) =>
          entry.status === "rejected"
            ? [{ index, stage: "task" as const, message: "Jira could not create this issue." }]
            : [],
        ),
      ],
      linkedToEpic: epic
        ? settled.flatMap((entry) => (entry.status === "fulfilled" ? [entry.value.key] : []))
        : [],
    };
    result.created.forEach(() => analytics.track("jira_issue_created"));
    result.failed.forEach(() => analytics.track("jira_issue_creation_failed"));
    analytics.track("jira_creation_completed", {
      created: result.created.length,
      failed: result.failed.length,
    });
    if (idempotencyKey) saveIdempotentResult(idempotencyKey, result);
    return ok({ ...result, idempotent: false, jiraProvider, projectKey });
  } catch (error) {
    return apiError(error, requestId);
  }
}
