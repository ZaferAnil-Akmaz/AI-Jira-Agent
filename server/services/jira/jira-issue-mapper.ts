import type { CreateIssueInput, WorkBreakdown, WorkTask } from "@/types/domain";

function formatDescription(task: WorkTask): string {
  return `${task.description}\n\nAcceptance criteria:\n${task.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}`;
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
      issueType: "Task",
      priority: task.priority,
      labels: ["ai-product-jira-agent", task.type],
    })),
  ];
}
