import type {
  CreateIssueInput,
  CreatedJiraIssue,
  JiraIssue,
  JiraProject,
  JiraProjectSummary,
} from "@/types/domain";
import type { JiraProvider } from "@/server/providers/jira/types";

let sequence = 1000;
export class MockJiraProvider implements JiraProvider {
  async testConnection() {
    return { accountId: "mock-account", displayName: "Mock Jira User" };
  }
  async getProject(projectKey: string): Promise<JiraProject> {
    return {
      key: projectKey,
      name: "Example Product",
      issueTypes: [
        { id: "10001", name: "Story", subtask: false },
        { id: "10002", name: "Task", subtask: false },
      ],
      priorities: [
        { id: "1", name: "High" },
        { id: "3", name: "Medium" },
        { id: "4", name: "Low" },
      ],
      components: [],
    };
  }
  async listProjects(): Promise<JiraProjectSummary[]> {
    return [{ key: "PROD", name: "Example Product (mock)" }];
  }
  async searchIssues(projectKey: string, query: string): Promise<JiraIssue[]> {
    return [
      {
        id: "mock-1",
        key: `${projectKey}-42`,
        summary: `Example issue related to ${query}`,
        url: `https://example.atlassian.net/browse/${projectKey}-42`,
        issueType: "Story",
        status: "To Do",
      },
    ];
  }
  async createIssue(input: CreateIssueInput): Promise<CreatedJiraIssue> {
    const key = `${input.projectKey}-${++sequence}`;
    return { key, url: `https://example.atlassian.net/browse/${key}` };
  }
}
