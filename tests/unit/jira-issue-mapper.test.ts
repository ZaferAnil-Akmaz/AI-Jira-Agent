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
        desiredOutcome: "Download a report",
        scope: ["Report export"],
        explicitRequirements: ["Monthly export"],
        implicitRequirements: [],
        functionalRequirements: [],
        nonFunctionalRequirements: [],
        risks: [],
        ambiguities: [],
      },
      language: "en",
      featureType: "new_feature",
      capabilityAnalysis: [
        { capability: "Export API", status: "missing", rationale: "An export endpoint is needed." },
      ],
      workstreamDecisions: [
        { workstream: "design", status: "not_applicable", rationale: "No design work." },
        { workstream: "frontend", status: "required", rationale: "A user action is needed." },
        { workstream: "backend", status: "required", rationale: "Export data is needed." },
        { workstream: "qa", status: "required", rationale: "The flow must be tested." },
        { workstream: "analytics", status: "not_applicable", rationale: "No metric requested." },
      ],
      warnings: [],
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
          rationale: "Users need an export entry point.",
          dependsOn: [],
        },
      ],
    });
    expect(issues).toHaveLength(2);
    expect(issues[0].issueType).toBe("Story");
    expect(issues[1].labels).toContain("frontend");
  });
});
