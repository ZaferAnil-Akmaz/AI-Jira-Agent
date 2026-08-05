import { describe, expect, it } from "vitest";
import { getAIConfig, getConfig, getJiraConfig } from "@/server/config/env";

describe("configuration", () => {
  it("uses mock integrations by default", () => expect(getConfig({}).AI_PROVIDER).toBe("mock"));
  it("requires an OpenAI key when selected", () =>
    expect(() => getAIConfig({ AI_PROVIDER: "openai" })).toThrow("OPENAI_API_KEY"));
  it("does not require Jira settings for AI-only work", () =>
    expect(() => getAIConfig({ JIRA_PROVIDER: "rest" })).not.toThrow());
  it("treats empty optional environment values as unset", () =>
    expect(() =>
      getAIConfig({ JIRA_BASE_URL: "", JIRA_EMAIL: "", JIRA_API_TOKEN: "" }),
    ).not.toThrow());
  it("requires Jira settings only when Jira is used", () =>
    expect(() => getJiraConfig({ JIRA_PROVIDER: "rest" })).toThrow("JIRA_BASE_URL"));
});
