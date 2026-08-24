import { describe, expect, it } from "vitest";
import { AIService } from "@/server/services/ai/ai-service";
import { MockAIProvider } from "@/server/providers/ai/mock-ai-provider";

describe("AI service", () => {
  it("creates a requirement- and context-specific Turkish tracking-page plan", async () => {
    const output = await new AIService(new MockAIProvider()).generateWorkBreakdown({
      requirement:
        "Kullanıcıların beslenme ve antreman takipleri için yeni bir sayfa geliştirmeyi istiyorum.",
      context: "Sayfada ana tema kırmızı ve beyaz olmalı.",
      language: "tr",
    });
    expect(output.featureType).toBe("new_feature");
    expect(output.epicRecommendation?.title).toBe("Beslenme ve Antrenman Takip Sayfası");
    expect(output.tasks.map((task) => task.type)).toEqual(["design", "frontend", "qa"]);
    expect(output.tasks.find((task) => task.type === "design")?.description).toContain(
      "Kırmızı ve beyaz",
    );
    expect(output.tasks.find((task) => task.type === "frontend")?.description).toContain(
      "Kırmızı ve beyaz",
    );
    expect(output.tasks.some((task) => task.title.includes("onaylı feature"))).toBe(false);
  });

  it("never uses the raw product requirement as a generated task field", async () => {
    const requirement = "Workspace yöneticileri aylık aktivite raporlarını dışa aktarabilsin.";
    const output = await new AIService(new MockAIProvider()).generateWorkBreakdown({
      requirement,
      context: "",
      language: "tr",
    });
    expect(
      output.tasks.every((task) => task.title !== requirement && task.description !== requirement),
    ).toBe(true);
  });

  it("creates a PM-level workout plan with an explicit backend capability assessment", async () => {
    const requirement = "Kullanıcılar antrenman takibi için sayfaya sahip olmalı.";
    const output = await new AIService(new MockAIProvider()).generateWorkBreakdown({
      requirement,
      context: "",
      language: "tr",
    });

    expect(output.epicRecommendation?.title).toBe("Antrenman Takip Sayfası");
    expect(output.tasks.map((task) => task.type)).toEqual(["design", "frontend", "backend", "qa"]);
    expect(output.analysis.ambiguities).toHaveLength(1);
    expect(output.assumptions[0].toLocaleLowerCase("tr")).toContain("ilk sürüm");

    const backend = output.tasks.find((task) => task.type === "backend");
    expect(backend?.title).toContain("Veri Altyapısının Değerlendirilmesi");
    expect(backend?.description).toContain("persistence");
    expect(backend?.description).toContain("authorization");
    expect(backend?.description).toContain("Yalnızca eksik capability varsa");

    expect(
      output.tasks.every((task) => task.title !== requirement && task.description !== requirement),
    ).toBe(true);
  });

  it("revises only the requested task through the provider boundary", async () => {
    const service = new AIService(new MockAIProvider());
    const plan = await service.generateWorkBreakdown({
      requirement: "Users should have a page where they can track their workouts.",
      context: "",
      language: "en",
    });
    const task = plan.tasks.find((item) => item.type === "frontend")!;
    const revised = await service.reviseTask({
      task,
      language: "en",
      instruction: "Make the acceptance criteria more specific.",
    });
    expect(revised.id).toBe(task.id);
    expect(revised.dependsOn).toEqual(task.dependsOn);
    expect(revised.acceptanceCriteria).toHaveLength(task.acceptanceCriteria.length + 1);
  });
});
