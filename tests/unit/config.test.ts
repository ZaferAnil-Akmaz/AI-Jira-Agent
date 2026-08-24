import { describe, expect, it } from "vitest";
import { getAIConfig, getConfig, getGeminiConfig, getJiraConfig } from "@/server/config/env";

describe("configuration", () => {
  it("uses mock integrations by default", () => expect(getConfig({}).AI_PROVIDER).toBe("mock"));
  it("requires an OpenAI key when selected", () =>
    expect(() => getAIConfig({ AI_PROVIDER: "openai" })).toThrow("OPENAI_API_KEY"));
  it("requires a Gemini key when selected as the main provider", () =>
    expect(() => getAIConfig({ AI_PROVIDER: "gemini" })).toThrow("GEMINI_API_KEY"));
  it("requires a Gemini key for Gemini ticket generation", () =>
    expect(() => getGeminiConfig({})).toThrow("GEMINI_API_KEY"));
  it("accepts a supported Gemini model", () =>
    expect(
      getGeminiConfig({ GEMINI_API_KEY: "test-key", GEMINI_MODEL: "gemini-2.5-pro" }).GEMINI_MODEL,
    ).toBe("gemini-2.5-pro"));
  it("does not require Jira settings for AI-only work", () =>
    expect(() => getAIConfig({ JIRA_PROVIDER: "rest" })).not.toThrow());
  it("treats empty optional environment values as unset", () =>
    expect(() =>
      getAIConfig({ JIRA_BASE_URL: "", JIRA_EMAIL: "", JIRA_API_TOKEN: "" }),
    ).not.toThrow());
  it("requires Jira settings only when Jira is used", () =>
    expect(() => getJiraConfig({ JIRA_PROVIDER: "rest" })).toThrow("JIRA_BASE_URL"));
});
