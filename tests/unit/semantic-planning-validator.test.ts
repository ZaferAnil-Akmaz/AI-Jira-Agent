import { describe, expect, it } from "vitest";
import { MockAIProvider } from "@/server/providers/ai/mock-ai-provider";
import { validatePlanningSemantics } from "@/server/services/ai/semantic-planning-validator";

describe("semantic planning validation", () => {
  it("flags invalid task IDs and backend work that conflicts with supplied capability", async () => {
    const plan = await new MockAIProvider().generateWorkBreakdown({
      requirement: "Users should have a page where they can track their workouts.",
      context: "",
      language: "en",
    });
    const backend = plan.tasks.find((task) => task.type === "backend")!;
    const output = validatePlanningSemantics({
      ...plan,
      capabilityAnalysis: plan.capabilityAnalysis.map((item) =>
        item.capability === "Workout API / data source"
          ? { ...item, status: "existing" as const }
          : item,
      ),
      tasks: plan.tasks.map((task) =>
        task.id === backend.id ? { ...task, dependsOn: ["not-in-plan"] } : task,
      ),
    });
    expect(output.map((item) => item.code)).toContain("INVALID_DEPENDENCY");
    expect(output.map((item) => item.code)).toContain("BACKEND_CAPABILITY_CONFLICT");
  });
});
