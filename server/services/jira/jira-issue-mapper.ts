import type { CreateIssueInput, WorkBreakdown, WorkTask } from "@/types/domain";
import { resolveJiraIssueType } from "@/server/services/jira/issue-type-mapping";

function formatDescription(task: WorkTask): string {
  return `${task.description}\n\nWhy this task exists:\n${task.rationale}\n\nDepends on:\n${task.dependsOn.length ? task.dependsOn.map((item) => `- ${item}`).join("\n") : "- None"}\n\nAcceptance criteria:\n${task.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}`;
}
export function mapWorkBreakdownToJiraIssues(
  projectKey: string,
  breakdown: WorkBreakdown,
): CreateIssueInput[] {
  const story: CreateIssueInput = {
    projectKey,
    summary: breakdown.userStory.title,
    description: `${breakdown.userStory.description}\n\nAcceptance criteria:\n${breakdown.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}`,
    issueType: "Story",
    priority: "high",
    labels: ["ai-product-jira-agent"],
  };
  return [
    story,
    ...breakdown.tasks.map((task) => ({
      projectKey,
      summary: task.title,
      description: formatDescription(task),
      issueType: resolveJiraIssueType(task.type, "Task"),
      priority: task.priority,
      labels: ["ai-product-jira-agent", task.type],
    })),
  ];
}
