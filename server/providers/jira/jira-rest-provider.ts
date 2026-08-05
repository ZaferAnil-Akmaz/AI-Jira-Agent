import type {
  CreateIssueInput,
  CreatedJiraIssue,
  JiraIssue,
  JiraProject,
  JiraProjectSummary,
} from "@/types/domain";
import {
  ExternalServiceError,
  JiraAuthenticationError,
  JiraIssueCreationError,
  JiraPermissionError,
} from "@/lib/errors/app-error";
import type { JiraProvider } from "@/server/providers/jira/types";

type JiraResponse = { ok: boolean; status: number; json: () => Promise<unknown> };

function toAtlassianDocumentFormat(text: string) {
  return {
    type: "doc",
    version: 1,
    content: text.split("\n").map((line) => ({
      type: "paragraph",
      ...(line ? { content: [{ type: "text", text: line }] } : {}),
    })),
  };
}

export class JiraRestProvider implements JiraProvider {
  constructor(private readonly settings: { baseUrl: string; email: string; apiToken: string }) {}
  private async request(path: string, init?: RequestInit): Promise<unknown> {
    const authorization = `Basic ${Buffer.from(`${this.settings.email}:${this.settings.apiToken}`).toString("base64")}`;
    let response: JiraResponse;
    try {
      response = await fetch(`${this.settings.baseUrl.replace(/\/$/, "")}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          Authorization: authorization,
          "Content-Type": "application/json",
          ...init?.headers,
        },
      });
    } catch (error) {
      throw new ExternalServiceError("Unable to reach Jira.", error);
    }
    if (response.status === 401) throw new JiraAuthenticationError();
    if (response.status === 403) throw new JiraPermissionError();
    if (!response.ok) throw new ExternalServiceError("Jira returned an unexpected response.");
    return response.json();
  }
  async testConnection() {
    const data = (await this.request("/rest/api/3/myself")) as {
      accountId: string;
      displayName: string;
    };
    return { accountId: data.accountId, displayName: data.displayName };
  }
  async getProject(projectKey: string): Promise<JiraProject> {
    const [project, priorities] = await Promise.all([
      this.request(`/rest/api/3/project/${encodeURIComponent(projectKey)}`),
      this.request("/rest/api/3/priority"),
    ]);
    const value = project as {
      key: string;
      name: string;
      issueTypes?: Array<{ id: string; name: string; subtask: boolean }>;
      components?: Array<{ id: string; name: string }>;
    };
    return {
      key: value.key,
      name: value.name,
      issueTypes: value.issueTypes ?? [],
      components: value.components ?? [],
      priorities: (priorities as Array<{ id: string; name: string }>).map(({ id, name }) => ({
        id,
        name,
      })),
    };
  }
  async listProjects(): Promise<JiraProjectSummary[]> {
    const data = (await this.request("/rest/api/3/project/search?maxResults=100")) as {
      values?: Array<{ key: string; name: string }>;
    };
    return (data.values ?? []).map(({ key, name }) => ({ key, name }));
  }
  async searchIssues(projectKey: string, query: string): Promise<JiraIssue[]> {
    const jql = `project = ${projectKey} AND text ~ \"${query.replace(/[\\\"]/g, "\\$&")}\" ORDER BY created DESC`;
    const data = (await this.request(
      `/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=10`,
    )) as {
      issues?: Array<{
        id: string;
        key: string;
        fields: { summary: string; issuetype: { name: string }; status: { name: string } };
      }>;
    };
    return (data.issues ?? []).map((issue) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      issueType: issue.fields.issuetype.name,
      status: issue.fields.status.name,
      url: `${this.settings.baseUrl.replace(/\/$/, "")}/browse/${issue.key}`,
    }));
  }
  async createIssue(input: CreateIssueInput): Promise<CreatedJiraIssue> {
    try {
      const data = (await this.request("/rest/api/3/issue", {
        method: "POST",
        body: JSON.stringify({
          fields: {
            project: { key: input.projectKey },
            summary: input.summary,
            description: toAtlassianDocumentFormat(input.description),
            issuetype: { name: input.issueType },
            priority: { name: input.priority[0].toUpperCase() + input.priority.slice(1) },
            labels: input.labels,
            components: input.componentIds?.map((id) => ({ id })),
            parent: input.parentKey ? { key: input.parentKey } : undefined,
          },
        }),
      })) as { key: string };
      return {
        key: data.key,
        url: `${this.settings.baseUrl.replace(/\/$/, "")}/browse/${data.key}`,
      };
    } catch (error) {
      if (error instanceof JiraAuthenticationError || error instanceof JiraPermissionError)
        throw error;
      throw new JiraIssueCreationError("Jira could not create this issue.", error);
    }
  }
}
