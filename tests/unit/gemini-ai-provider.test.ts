import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockAIProvider } from "@/server/providers/ai/mock-ai-provider";
import { GeminiAIProvider } from "@/server/providers/ai/gemini-provider";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

describe("Gemini AI provider", () => {
  beforeEach(() => generateContent.mockReset());

  it("uses the Senior PM instruction and structured WorkBreakdown schema", async () => {
    const input = {
      requirement:
        "Yeni bir kullanıcı mesajlaşma özelliği geliştirmek istiyorum. Backend, Frontend ve QA taskleri ile epic lazım.",
      context: "",
      language: "tr" as const,
    };
    const validPlan = await new MockAIProvider().generateWorkBreakdown(input);
    generateContent.mockResolvedValueOnce({ text: JSON.stringify(validPlan) });

    const result = await new GeminiAIProvider("test-key", "gemini-2.5-flash").generateWorkBreakdown(
      input,
    );

    expect(result).toEqual(validPlan);
    expect(generateContent).toHaveBeenCalledOnce();
    const call = generateContent.mock.calls[0][0];
    expect(call.model).toBe("gemini-2.5-flash");
    expect(call.config.responseMimeType).toBe("application/json");
    expect(call.config.responseJsonSchema).toBeDefined();
    expect(call.config.systemInstruction).toContain("Senior Agile Product Manager");
    expect(call.config.systemInstruction).toContain("Frontend");
    expect(call.config.systemInstruction).toContain("Backend");
    expect(call.config.systemInstruction).toContain("QA");
    expect(call.config.systemInstruction).toContain("Kullanıcı Hikayesi");
    expect(call.config.systemInstruction).toContain("WebSocket");
  });

  it("regenerates a messaging plan when a required workstream is missing", async () => {
    const input = {
      requirement: "Mesajlaşma özelliği geliştirmek istiyorum.",
      context: "",
      language: "tr" as const,
    };
    const correctedPlan = await new MockAIProvider().generateWorkBreakdown(input);
    const incompletePlan = {
      ...correctedPlan,
      tasks: correctedPlan.tasks.filter((task) => task.type !== "frontend"),
    };
    generateContent
      .mockResolvedValueOnce({ text: JSON.stringify(incompletePlan) })
      .mockResolvedValueOnce({ text: JSON.stringify(correctedPlan) });

    const result = await new GeminiAIProvider("test-key", "gemini-2.5-pro").generateWorkBreakdown(
      input,
    );

    expect(result.tasks.map((task) => task.type)).toContain("frontend");
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(generateContent.mock.calls[1][0].contents).toContain("Eksik zorunlu workstream");
  });
});
