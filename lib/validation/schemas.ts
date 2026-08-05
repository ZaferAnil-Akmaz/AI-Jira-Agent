import { z } from "zod";
import { featureTypes, outputLanguages, priorities, taskTypes } from "@/types/domain";

export const workTaskSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(taskTypes),
  title: z.string().min(3).max(255),
  description: z.string().min(1).max(10_000),
  acceptanceCriteria: z.array(z.string().min(1).max(1_000)).max(30),
  priority: z.enum(priorities),
  dependencies: z.array(z.string().min(1).max(100)).max(10).optional(),
});

export const workBreakdownSchema = z.object({
  summary: z.string().min(3).max(255),
  problemStatement: z.string().min(1).max(5_000),
  userStory: z.object({
    title: z.string().min(3).max(255),
    description: z.string().min(1).max(5_000),
  }),
  assumptions: z.array(z.string().min(1).max(1_000)).max(30),
  acceptanceCriteria: z.array(z.string().min(1).max(1_000)).min(1).max(50),
  dependencies: z.array(z.string().min(1).max(1_000)).max(30),
  tasks: z.array(workTaskSchema).min(1).max(30),
  analysis: z.object({
    userProblem: z.string().min(1).max(3_000),
    businessGoal: z.string().min(1).max(3_000),
    actor: z.string().min(1).max(500),
    functionalRequirements: z.array(z.string().min(1).max(1_000)).max(20),
    nonFunctionalRequirements: z.array(z.string().min(1).max(1_000)).max(20),
    risks: z.array(z.string().min(1).max(1_000)).max(20),
    ambiguities: z.array(z.string().min(1).max(1_000)).max(10),
  }),
  language: z.enum(outputLanguages),
  featureType: z.enum(featureTypes),
  epicRecommendation: z
    .object({
      recommended: z.boolean(),
      title: z.string().min(3).max(255),
      description: z.string().min(1).max(5_000),
      acceptanceCriteria: z.array(z.string().min(1).max(1_000)).max(20),
    })
    .nullable(),
  labels: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(10),
});

/** OpenAI Structured Outputs schema; Zod remains the runtime trust boundary. */
export const workBreakdownJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "problemStatement",
    "userStory",
    "assumptions",
    "acceptanceCriteria",
    "dependencies",
    "tasks",
    "analysis",
    "language",
    "featureType",
    "epicRecommendation",
    "labels",
  ],
  properties: {
    summary: { type: "string" },
    problemStatement: { type: "string" },
    userStory: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description"],
      properties: { title: { type: "string" }, description: { type: "string" } },
    },
    assumptions: { type: "array", items: { type: "string" } },
    acceptanceCriteria: { type: "array", items: { type: "string" } },
    dependencies: { type: "array", items: { type: "string" } },
    tasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "title", "description", "acceptanceCriteria", "priority"],
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: taskTypes },
          title: { type: "string" },
          description: { type: "string" },
          acceptanceCriteria: { type: "array", items: { type: "string" } },
          priority: { type: "string", enum: priorities },
        },
      },
    },
    analysis: {
      type: "object",
      additionalProperties: false,
      required: [
        "userProblem",
        "businessGoal",
        "actor",
        "functionalRequirements",
        "nonFunctionalRequirements",
        "risks",
        "ambiguities",
      ],
      properties: {
        userProblem: { type: "string" },
        businessGoal: { type: "string" },
        actor: { type: "string" },
        functionalRequirements: { type: "array", items: { type: "string" } },
        nonFunctionalRequirements: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } },
        ambiguities: { type: "array", items: { type: "string" } },
      },
    },
    language: { type: "string", enum: outputLanguages },
    featureType: { type: "string", enum: featureTypes },
    epicRecommendation: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["recommended", "title", "description", "acceptanceCriteria"],
          properties: {
            recommended: { type: "boolean" },
            title: { type: "string" },
            description: { type: "string" },
            acceptanceCriteria: { type: "array", items: { type: "string" } },
          },
        },
      ],
    },
    labels: { type: "array", items: { type: "string" } },
  },
} as const;

export const generateRequestSchema = z.object({
  requirement: z
    .string()
    .trim()
    .min(20, "Requirement must contain at least 20 characters.")
    .max(20_000),
  context: z.string().trim().max(10_000).default(""),
  language: z.enum(outputLanguages),
});

export const jiraConnectionSchema = z.object({
  baseUrl: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), "A HTTPS URL is required."),
  email: z.string().email(),
  apiToken: z.string().min(1).max(1_000),
  projectKey: z
    .string()
    .trim()
    .regex(/^[A-Z][A-Z0-9_]{1,19}$/),
});

export const jiraSearchSchema = z.object({
  query: z.string().trim().min(2).max(500),
  projectKey: z
    .string()
    .trim()
    .regex(/^[A-Z][A-Z0-9_]{1,19}$/),
});

export const createIssuesSchema = z.object({
  projectKey: z
    .string()
    .trim()
    .regex(/^[A-Z][A-Z0-9_]{1,19}$/),
  epic: z
    .object({
      summary: z.string().trim().min(3).max(255),
      description: z.string().max(20_000),
      priority: z.enum(priorities),
      labels: z
        .array(
          z
            .string()
            .trim()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        )
        .max(20),
    })
    .optional(),
  issues: z
    .array(
      z.object({
        summary: z.string().trim().min(3).max(255),
        description: z.string().max(20_000),
        issueType: z.string().trim().min(1).max(100),
        priority: z.enum(priorities),
        labels: z
          .array(
            z
              .string()
              .trim()
              .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          )
          .max(20)
          .optional(),
        componentIds: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
        parentKey: z.string().trim().max(100).optional(),
      }),
    )
    .min(1)
    .max(30),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type CreateIssuesRequest = z.infer<typeof createIssuesSchema>;
