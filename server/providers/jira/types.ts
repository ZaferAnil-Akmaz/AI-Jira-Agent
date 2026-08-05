import type {
  CreateIssueInput,
  CreatedJiraIssue,
  JiraIssue,
  JiraProject,
  JiraProjectSummary,
} from "@/types/domain";
export interface JiraProvider {
  testConnection(): Promise<{ accountId: string; displayName: string }>;
  getProject(projectKey: string): Promise<JiraProject>;
  listProjects(): Promise<JiraProjectSummary[]>;
  searchIssues(projectKey: string, query: string): Promise<JiraIssue[]>;
  createIssue(input: CreateIssueInput): Promise<CreatedJiraIssue>;
}
