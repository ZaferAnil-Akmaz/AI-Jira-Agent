import { describe, expect, it } from "vitest";
import { mapWorkBreakdownToJiraIssues } from "@/server/services/jira/jira-issue-mapper";

describe("Jira issue mapper", () => {
  it("creates one story and one task issue for each work task", () => {
    const issues = mapWorkBreakdownToJiraIssues("PROD", {
      summary: "Export",
      problemStatement: "Need export",
      userStory: { title: "Export report", description: "As a user" },
      assumptions: [],
      acceptanceCriteria: ["Works"],
      dependencies: [],
      analysis: {
        userProblem: "Need export",
        businessGoal: "Export",
        actor: "User",
        functionalRequirements: [],
        nonFunctionalRequirements: [],
        risks: [],
        ambiguities: [],
      },
      language: "en",
      featureType: "new_feature",
      epicRecommendation: null,
      labels: ["export"],
      tasks: [
        {
          id: "fe-1",
          type: "frontend",
          title: "Export UI",
          description: "Build it",
          acceptanceCriteria: ["Button works"],
          priority: "high",
        },
      ],
    });
    expect(issues).toHaveLength(2);
    expect(issues[0].issueType).toBe("Story");
    expect(issues[1].labels).toContain("frontend");
  });
});
