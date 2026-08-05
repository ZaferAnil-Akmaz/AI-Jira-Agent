import OpenAI from "openai";
import type { GenerateRequest } from "@/lib/validation/schemas";
import { workBreakdownJsonSchema, workBreakdownSchema } from "@/lib/validation/schemas";
import { AIProviderError, AppError } from "@/lib/errors/app-error";
import type { AIProvider } from "@/server/providers/ai/types";
import type { WorkBreakdown } from "@/types/domain";
import { WORK_BREAKDOWN_SYSTEM_PROMPT } from "@/server/services/ai/prompts/system";
import { buildWorkBreakdownPrompt } from "@/server/services/ai/prompts/work-breakdown";

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;
  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new OpenAI({ apiKey });
  }
  async generateWorkBreakdown(input: GenerateRequest): Promise<WorkBreakdown> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: WORK_BREAKDOWN_SYSTEM_PROMPT },
          { role: "user", content: buildWorkBreakdownPrompt(input) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "work_breakdown",
            strict: true,
            schema: workBreakdownJsonSchema,
          },
        },
        temperature: 0.2,
      });
      const content = completion.choices[0]?.message.content;
      if (!content) throw new AIProviderError("The AI provider returned an empty response.");
      const parsed: unknown = JSON.parse(content);
      const validation = workBreakdownSchema.safeParse(parsed);
      if (!validation.success)
        throw new AppError(
          "AI_OUTPUT_INVALID",
          "The AI response did not match the expected work-breakdown format.",
          502,
          validation.error,
        );
      return validation.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AIProviderError("Unable to generate a work breakdown.", error);
    }
  }
}
