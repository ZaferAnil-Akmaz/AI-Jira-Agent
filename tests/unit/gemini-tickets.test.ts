import { describe, expect, it } from "vitest";
import { epicSchema, generateTicketsRequestSchema } from "@/lib/validation/gemini-tickets";

const task = (type: "Frontend" | "Backend" | "QA" | "Design") => ({
  title: `${type} implementation`,
  description: `Detailed ${type} task description.`,
  acceptanceCriteria: ["The expected behavior is verifiably implemented."],
  type,
  labels: [type.toLowerCase()],
  estimatedStoryPoints: 3,
});

describe("Gemini ticket validation", () => {
  it("accepts an Epic containing the required workstreams", () => {
    const result = epicSchema.safeParse({
      title: "Activity export",
      description: "Allow administrators to export workspace activity.",
      tasks: [task("Frontend"), task("Backend"), task("QA")],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an Epic without QA coverage", () => {
    const result = epicSchema.safeParse({
      title: "Activity export",
      description: "Allow administrators to export workspace activity.",
      tasks: [task("Frontend"), task("Backend"), task("Design")],
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown request fields", () => {
    expect(
      generateTicketsRequestSchema.safeParse({
        requirement: "Allow users to export their activity report.",
        apiKey: "must-not-be-accepted-from-the-client",
      }).success,
    ).toBe(false);
  });
});
