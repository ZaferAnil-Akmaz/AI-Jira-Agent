import { describe, expect, it } from "vitest";
import { MockAIProvider } from "@/server/providers/ai/mock-ai-provider";
import { findPlanQualityIssues } from "@/server/services/ai/plan-quality";

describe("PM plan quality gate", () => {
  it("requires Frontend, Backend and QA for messaging", async () => {
    const input = {
      requirement: "Mesajlaşma özelliği geliştirmek istiyorum.",
      context: "",
      language: "tr" as const,
    };
    const plan = await new MockAIProvider().generateWorkBreakdown(input);

    expect(plan.tasks.map((task) => task.type)).toEqual(["backend", "frontend", "qa"]);
    expect(plan.epicRecommendation?.title).toBe("Uygulama İçi Kullanıcı Mesajlaşma Sistemi");
    expect(plan.epicRecommendation?.description).toContain("Kullanıcı Hikayesi (User Story)");
    expect(plan.epicRecommendation?.description).toContain("Hedef");
    expect(plan.tasks.find((task) => task.type === "backend")?.description).toContain("WebSocket");
    expect(plan.tasks.find((task) => task.type === "frontend")?.description).toContain(
      "Tekrar Dene",
    );
    expect(plan.tasks.find((task) => task.type === "qa")?.description).toContain("E2E");
    expect(findPlanQualityIssues(input, plan)).toEqual([]);
  });
});
