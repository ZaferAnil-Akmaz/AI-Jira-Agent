import type { TaskType } from "@/types/domain";

/**
 * Safe Jira Cloud defaults. Project/workspace settings can supply overrides later
 * without coupling the planning model to Jira-specific issue types.
 */
export type JiraIssueTypeMapping = Record<TaskType, string>;
export const defaultJiraIssueTypeMapping: JiraIssueTypeMapping = {
  design: "Task",
  frontend: "Task",
  backend: "Task",
  qa: "Task",
  analytics: "Task",
};

export function resolveJiraIssueType(
  workstream: TaskType | undefined,
  fallback: string,
  overrides: Partial<JiraIssueTypeMapping> = {},
): string {
  return workstream ? (overrides[workstream] ?? defaultJiraIssueTypeMapping[workstream]) : fallback;
}
