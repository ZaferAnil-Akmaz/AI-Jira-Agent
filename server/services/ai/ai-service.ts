import type { GenerateRequest, ReviseTaskRequest } from "@/lib/validation/schemas";
import type { WorkBreakdown, WorkTask } from "@/types/domain";
import { getAIConfig } from "@/server/config/env";
import { MockAIProvider } from "@/server/providers/ai/mock-ai-provider";
import { OpenAIProvider } from "@/server/providers/ai/openai-provider";
import { GeminiAIProvider } from "@/server/providers/ai/gemini-provider";
import type { AIProvider } from "@/server/providers/ai/types";
import { validatePlanningSemantics } from "@/server/services/ai/semantic-planning-validator";

export function getAIProvider(): AIProvider {
  const config = getAIConfig();
  if (config.AI_PROVIDER === "openai")
    return new OpenAIProvider(config.OPENAI_API_KEY!, config.OPENAI_MODEL);
  if (config.AI_PROVIDER === "gemini")
    return new GeminiAIProvider(config.GEMINI_API_KEY!, config.GEMINI_MODEL);
  return new MockAIProvider();
}
export class AIService {
  constructor(private readonly provider: AIProvider = getAIProvider()) {}
  async generateWorkBreakdown(input: GenerateRequest): Promise<WorkBreakdown> {
    const plan = await this.provider.generateWorkBreakdown(input);
    const warnings = validatePlanningSemantics(plan);
    const uniqueWarnings = [...plan.warnings, ...warnings].filter(
      (item, index, all) =>
        all.findIndex(
          (candidate) => candidate.code === item.code && candidate.taskId === item.taskId,
        ) === index,
    );
    return { ...plan, warnings: uniqueWarnings };
  }
  reviseTask(input: ReviseTaskRequest): Promise<WorkTask> {
    return this.provider.reviseTask(input);
  }
}
