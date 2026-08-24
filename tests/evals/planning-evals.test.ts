import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MockAIProvider } from "@/server/providers/ai/mock-ai-provider";
import { AIService } from "@/server/services/ai/ai-service";
import type { OutputLanguage, TaskType } from "@/types/domain";

type Scenario = {
  requirement: string;
  context: string;
  language: OutputLanguage;
  expected: {
    requiredWorkstreams: TaskType[];
    backendRequired: boolean;
    expectedDependencies: string[];
  };
};
const evalDirectory = join(process.cwd(), "evals");
const scenarios = readdirSync(evalDirectory)
  .filter((file) => file.endsWith(".json"))
  .map(
    (file) =>
      [file, JSON.parse(readFileSync(join(evalDirectory, file), "utf8")) as Scenario] as const,
  );

describe("AI Product Planning Evaluation", () => {
  for (const [file, scenario] of scenarios) {
    it(`meets planning expectations for ${file}`, async () => {
      const output = await new AIService(new MockAIProvider()).generateWorkBreakdown(scenario);
      const workstreams = output.tasks.map((task) => task.type);
      expect(workstreams).toEqual(scenario.expected.requiredWorkstreams);
      expect(workstreams.includes("backend")).toBe(scenario.expected.backendRequired);
      expect(output.tasks.find((task) => task.type === "qa")?.dependsOn).toEqual(
        scenario.expected.expectedDependencies,
      );
      expect(output.tasks.every((task) => task.rationale.length > 10)).toBe(true);
      expect(
        output.tasks.every(
          (task) =>
            task.title !== scenario.requirement && task.description !== scenario.requirement,
        ),
      ).toBe(true);
      expect(output.warnings.some((warning) => warning.code === "INVALID_DEPENDENCY")).toBe(false);
    });
  }
});
