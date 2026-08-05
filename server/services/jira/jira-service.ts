import type {
  CreateIssueInput,
  CreatedJiraIssue,
  JiraIssue,
  JiraProject,
  JiraProjectSummary,
} from "@/types/domain";
import { getJiraConfig } from "@/server/config/env";
import { MockJiraProvider } from "@/server/providers/jira/mock-jira-provider";
import { JiraRestProvider } from "@/server/providers/jira/jira-rest-provider";
import type { JiraProvider } from "@/server/providers/jira/types";
import { getRuntimeJiraSettings } from "@/server/services/jira/runtime-settings";

export function getJiraProvider(): JiraProvider {
  const runtimeSettings = getRuntimeJiraSettings();
  if (runtimeSettings) return new JiraRestProvider(runtimeSettings);
  const config = getJiraConfig();
  return config.JIRA_PROVIDER === "rest"
    ? new JiraRestProvider({
        baseUrl: config.JIRA_BASE_URL!,
        email: config.JIRA_EMAIL!,
        apiToken: config.JIRA_API_TOKEN!,
      })
    : new MockJiraProvider();
}
export class JiraService {
  constructor(private readonly provider: JiraProvider = getJiraProvider()) {}
  testConnection() {
    return this.provider.testConnection();
  }
  getProject(projectKey: string): Promise<JiraProject> {
    return this.provider.getProject(projectKey);
  }
  listProjects(): Promise<JiraProjectSummary[]> {
    return this.provider.listProjects();
  }
  searchIssues(projectKey: string, query: string): Promise<JiraIssue[]> {
    return this.provider.searchIssues(projectKey, query);
  }
  createIssue(input: CreateIssueInput): Promise<CreatedJiraIssue> {
    return this.provider.createIssue(input);
  }
}
