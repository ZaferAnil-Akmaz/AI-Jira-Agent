import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as health } from "@/app/api/health/route";
import { GET as publicConfig } from "@/app/api/config/route";
import { POST as generate } from "@/app/api/ai/generate/route";

describe("API routes", () => {
  it("returns the standard health response", async () => {
    const response = await health();
    await expect(response.json()).resolves.toEqual({ success: true, data: { status: "ok" } });
  });

  it("returns only safe browser configuration", async () => {
    const response = await publicConfig();
    const body = (await response.json()) as { success: boolean; data: { jiraProjectKey: string } };
    expect(body.success).toBe(true);
    expect(body.data.jiraProjectKey).toBeTruthy();
    expect(JSON.stringify(body)).not.toContain("JIRA_API_TOKEN");
  });

  it("generates a work breakdown using the mock provider", async () => {
    const request = new NextRequest("http://localhost/api/ai/generate", {
      method: "POST",
      body: JSON.stringify({
        requirement: "Let workspace administrators export an activity report as a CSV file.",
        context: "",
        language: "en",
      }),
    });
    const response = await generate(request);
    const body = (await response.json()) as { success: boolean; data: { tasks: unknown[] } };
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.tasks.length).toBeGreaterThan(1);
  });
});
