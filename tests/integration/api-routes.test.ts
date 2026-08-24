import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as health } from "@/app/api/health/route";
import { GET as publicConfig } from "@/app/api/config/route";
import { POST as generate } from "@/app/api/ai/generate/route";
import { POST as generateTickets } from "@/app/api/generate-tickets/route";

describe("API routes", () => {
  it("returns the standard health response", async () => {
    const response = await health();
    await expect(response.json()).resolves.toEqual({ success: true, data: { status: "ok" } });
  });

  it("returns only safe browser configuration", async () => {
    const response = await publicConfig();
    const body = (await response.json()) as {
      success: boolean;
      data: { aiProvider: string; jiraProjectKey: string };
    };
    expect(body.success).toBe(true);
    expect(body.data.aiProvider).toBe("mock");
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

  it("rejects malformed ticket-generation JSON", async () => {
    const request = new NextRequest("http://localhost/api/generate-tickets", {
      method: "POST",
      body: "{",
    });
    const response = await generateTickets(request);
    const body = (await response.json()) as { success: boolean; error: { code: string } };
    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("does not call Gemini without a server-side API key", async () => {
    const previousKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const request = new NextRequest("http://localhost/api/generate-tickets", {
        method: "POST",
        body: JSON.stringify({
          requirement: "Allow administrators to export an activity report as CSV.",
        }),
      });
      const response = await generateTickets(request);
      const body = (await response.json()) as { success: boolean; error: { code: string } };
      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CONFIGURATION_ERROR");
    } finally {
      if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
      else process.env.GEMINI_API_KEY = previousKey;
    }
  });
});
