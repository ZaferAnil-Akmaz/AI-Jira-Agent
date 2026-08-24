import OpenAI from "openai";
import type { GenerateRequest, ReviseTaskRequest } from "@/lib/validation/schemas";
import {
  workBreakdownJsonSchema,
  workBreakdownSchema,
  workTaskSchema,
} from "@/lib/validation/schemas";
import { AIProviderError, AppError } from "@/lib/errors/app-error";
import type { AIProvider } from "@/server/providers/ai/types";
import type { WorkBreakdown, WorkTask } from "@/types/domain";
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

  async reviseTask(input: ReviseTaskRequest): Promise<WorkTask> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are an experienced Product Manager. Revise only the provided Jira task. Preserve its id, type, and dependsOn IDs unless the request explicitly requires a dependency change. Return JSON only, matching the task object fields.",
          },
          {
            role: "user",
            content: `Language: ${input.language}\nRevision request: ${input.instruction}\nTask:\n${JSON.stringify(input.task)}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });
      const content = completion.choices[0]?.message.content;
      if (!content) throw new AIProviderError("The AI provider returned an empty task revision.");
      const validation = workTaskSchema.safeParse(JSON.parse(content));
      if (!validation.success)
        throw new AppError(
          "AI_OUTPUT_INVALID",
          "The AI task revision did not match the expected task format.",
          502,
          validation.error,
        );
      return validation.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AIProviderError("Unable to revise the selected task.", error);
    }
  }
}
