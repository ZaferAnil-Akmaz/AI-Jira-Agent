import { z } from "zod";
import {
  capabilityStatuses,
  featureTypes,
  outputLanguages,
  priorities,
  taskTypes,
  workstreamStatuses,
} from "@/types/domain";

export const workTaskSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(taskTypes),
  title: z.string().min(3).max(255),
  description: z.string().min(1).max(10_000),
  acceptanceCriteria: z.array(z.string().min(1).max(1_000)).max(30),
  priority: z.enum(priorities),
  rationale: z.string().min(1).max(3_000),
  dependsOn: z.array(z.string().min(1).max(100)).max(10),
  assumptions: z.array(z.string().min(1).max(1_000)).max(10).optional(),
  risks: z.array(z.string().min(1).max(1_000)).max(10).optional(),
});

export const repositoryContextSchema = z
  .object({
    apiInventory: z.array(z.string().min(1).max(1_000)).max(100).optional(),
    dataModels: z.array(z.string().min(1).max(1_000)).max(100).optional(),
    services: z.array(z.string().min(1).max(1_000)).max(100).optional(),
    frontendRoutes: z.array(z.string().min(1).max(1_000)).max(100).optional(),
    components: z.array(z.string().min(1).max(1_000)).max(100).optional(),
    analyticsEvents: z.array(z.string().min(1).max(1_000)).max(100).optional(),
    authentication: z.string().min(1).max(2_000).optional(),
    notes: z.string().min(1).max(5_000).optional(),
  })
  .strict();

const planningWarningSchema = z.object({
  code: z.enum([
    "BACKEND_CAPABILITY_CONFLICT",
    "FRONTEND_SCOPE_CONFLICT",
    "ANALYTICS_SCOPE_CONFLICT",
    "QA_COVERAGE",
    "DUPLICATE_SCOPE",
    "INVALID_DEPENDENCY",
    "MISSING_TASK_RATIONALE",
    "UNKNOWN_ARCHITECTURE",
  ]),
  message: z.string().min(1).max(2_000),
  taskId: z.string().min(1).max(100).optional(),
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
    desiredOutcome: z.string().min(1).max(3_000),
    scope: z.array(z.string().min(1).max(1_000)).max(20),
    explicitRequirements: z.array(z.string().min(1).max(1_000)).max(20),
    implicitRequirements: z.array(z.string().min(1).max(1_000)).max(20),
    functionalRequirements: z.array(z.string().min(1).max(1_000)).max(20),
    nonFunctionalRequirements: z.array(z.string().min(1).max(1_000)).max(20),
    risks: z.array(z.string().min(1).max(1_000)).max(20),
    ambiguities: z.array(z.string().min(1).max(1_000)).max(10),
  }),
  repositoryContext: repositoryContextSchema.optional(),
  capabilityAnalysis: z
    .array(
      z.object({
        capability: z.string().min(1).max(500),
        status: z.enum(capabilityStatuses),
        rationale: z.string().min(1).max(2_000),
        evidence: z.string().min(1).max(2_000).optional(),
      }),
    )
    .min(1)
    .max(30),
  workstreamDecisions: z
    .array(
      z.object({
        workstream: z.enum(taskTypes),
        status: z.enum(workstreamStatuses),
        rationale: z.string().min(1).max(2_000),
      }),
    )
    .length(taskTypes.length),
  warnings: z.array(planningWarningSchema).max(30),
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
    "capabilityAnalysis",
    "workstreamDecisions",
    "warnings",
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
        required: [
          "id",
          "type",
          "title",
          "description",
          "acceptanceCriteria",
          "priority",
          "rationale",
          "dependsOn",
        ],
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: taskTypes },
          title: { type: "string" },
          description: { type: "string" },
          acceptanceCriteria: { type: "array", items: { type: "string" } },
          priority: { type: "string", enum: priorities },
          rationale: { type: "string" },
          dependsOn: { type: "array", items: { type: "string" } },
          assumptions: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
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
        "desiredOutcome",
        "scope",
        "explicitRequirements",
        "implicitRequirements",
        "functionalRequirements",
        "nonFunctionalRequirements",
        "risks",
        "ambiguities",
      ],
      properties: {
        userProblem: { type: "string" },
        businessGoal: { type: "string" },
        actor: { type: "string" },
        desiredOutcome: { type: "string" },
        scope: { type: "array", items: { type: "string" } },
        explicitRequirements: { type: "array", items: { type: "string" } },
        implicitRequirements: { type: "array", items: { type: "string" } },
        functionalRequirements: { type: "array", items: { type: "string" } },
        nonFunctionalRequirements: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } },
        ambiguities: { type: "array", items: { type: "string" } },
      },
    },
    capabilityAnalysis: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["capability", "status", "rationale"],
        properties: {
          capability: { type: "string" },
          status: { type: "string", enum: capabilityStatuses },
          rationale: { type: "string" },
          evidence: { type: "string" },
        },
      },
    },
    workstreamDecisions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["workstream", "status", "rationale"],
        properties: {
          workstream: { type: "string", enum: taskTypes },
          status: { type: "string", enum: workstreamStatuses },
          rationale: { type: "string" },
        },
      },
    },
    warnings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "message"],
        properties: {
          code: {
            type: "string",
            enum: [
              "BACKEND_CAPABILITY_CONFLICT",
              "FRONTEND_SCOPE_CONFLICT",
              "ANALYTICS_SCOPE_CONFLICT",
              "QA_COVERAGE",
              "DUPLICATE_SCOPE",
              "INVALID_DEPENDENCY",
              "MISSING_TASK_RATIONALE",
              "UNKNOWN_ARCHITECTURE",
            ],
          },
          message: { type: "string" },
          taskId: { type: "string" },
        },
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
  repositoryContext: repositoryContextSchema.optional(),
});

export const reviseTaskRequestSchema = z.object({
  task: workTaskSchema,
  instruction: z.string().trim().min(5).max(2_000),
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
        workstream: z.enum(taskTypes).optional(),
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
export type ReviseTaskRequest = z.infer<typeof reviseTaskRequestSchema>;
export type CreateIssuesRequest = z.infer<typeof createIssuesSchema>;
