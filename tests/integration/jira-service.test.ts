import { describe, expect, it } from "vitest";
import { MockJiraProvider } from "@/server/providers/jira/mock-jira-provider";
import { JiraService } from "@/server/services/jira/jira-service";

describe("Jira service", () => {
  it("lists projects through the provider", async () => {
    const projects = await new JiraService(new MockJiraProvider()).listProjects();
    expect(projects).toEqual([{ key: "PROD", name: "Example Product (mock)" }]);
  });

  it("creates an issue through a provider", async () => {
    const issue = await new JiraService(new MockJiraProvider()).createIssue({
      projectKey: "PROD",
      summary: "A task",
      description: "A description",
      issueType: "Task",
      priority: "medium",
    });
    expect(issue.key).toMatch(/^PROD-/);
  });
});
