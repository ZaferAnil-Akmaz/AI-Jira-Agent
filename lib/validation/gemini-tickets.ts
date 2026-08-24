import { z } from "zod";
import { geminiTaskTypes } from "@/types/gemini";

export const generateTicketsRequestSchema = z
  .object({
    requirement: z.string().trim().min(10).max(20_000),
  })
  .strict();

export const geminiTaskSchema = z.object({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().min(10).max(10_000),
  acceptanceCriteria: z.array(z.string().trim().min(3).max(1_000)).min(1).max(30),
  type: z.enum(geminiTaskTypes),
  labels: z.array(z.string().trim().min(1).max(100)).min(1).max(10),
  estimatedStoryPoints: z.number().int().min(1).max(13),
});

export const epicSchema = z
  .object({
    title: z.string().trim().min(3).max(255),
    description: z.string().trim().min(10).max(10_000),
    tasks: z.array(geminiTaskSchema).min(3).max(30),
  })
  .superRefine((epic, context) => {
    for (const requiredType of ["Frontend", "Backend", "QA"] as const) {
      if (!epic.tasks.some((task) => task.type === requiredType)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tasks"],
          message: `At least one ${requiredType} task is required.`,
        });
      }
    }
  });
