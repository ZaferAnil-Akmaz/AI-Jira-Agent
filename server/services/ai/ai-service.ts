import type { GenerateRequest } from "@/lib/validation/schemas";
import type { WorkBreakdown } from "@/types/domain";
import { getAIConfig } from "@/server/config/env";
import { MockAIProvider } from "@/server/providers/ai/mock-ai-provider";
import { OpenAIProvider } from "@/server/providers/ai/openai-provider";
import type { AIProvider } from "@/server/providers/ai/types";

export function getAIProvider(): AIProvider {
  const config = getAIConfig();
  return config.AI_PROVIDER === "openai"
    ? new OpenAIProvider(config.OPENAI_API_KEY!, config.OPENAI_MODEL)
    : new MockAIProvider();
}
export class AIService {
  constructor(private readonly provider: AIProvider = getAIProvider()) {}
  generateWorkBreakdown(input: GenerateRequest): Promise<WorkBreakdown> {
    return this.provider.generateWorkBreakdown(input);
  }
}
