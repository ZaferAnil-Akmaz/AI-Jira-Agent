import { z } from "zod";
import { ConfigurationError } from "@/lib/errors/app-error";

const optionalString = (schema: z.ZodString) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AI_PROVIDER: z.enum(["mock", "openai", "gemini"]).default("mock"),
  OPENAI_API_KEY: optionalString(z.string()),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  GEMINI_API_KEY: optionalString(z.string()),
  GEMINI_MODEL: z.enum(["gemini-2.5-flash", "gemini-2.5-pro"]).default("gemini-2.5-pro"),
  JIRA_PROVIDER: z.enum(["mock", "rest"]).default("mock"),
  JIRA_BASE_URL: optionalString(z.string().url()),
  JIRA_EMAIL: optionalString(z.string().email()),
  JIRA_API_TOKEN: optionalString(z.string()),
  JIRA_PROJECT_KEY: z.string().default("PROD"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type AppConfig = z.infer<typeof envSchema>;
export function getConfig(input: Partial<NodeJS.ProcessEnv> = process.env): AppConfig {
  const parsed = envSchema.safeParse(input);
  if (!parsed.success)
    throw new ConfigurationError(
      `Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  const config = parsed.data;
  return config;
}

export function getAIConfig(input: Partial<NodeJS.ProcessEnv> = process.env): AppConfig {
  const config = getConfig(input);
  if (config.AI_PROVIDER === "openai" && !config.OPENAI_API_KEY)
    throw new ConfigurationError("OPENAI_API_KEY is required when AI_PROVIDER=openai.");
  if (config.AI_PROVIDER === "gemini" && !config.GEMINI_API_KEY)
    throw new ConfigurationError("GEMINI_API_KEY is required when AI_PROVIDER=gemini.");
  return config;
}

export function getGeminiConfig(input: Partial<NodeJS.ProcessEnv> = process.env): AppConfig {
  const config = getConfig(input);
  if (!config.GEMINI_API_KEY)
    throw new ConfigurationError("GEMINI_API_KEY is required for Gemini ticket generation.");
  return config;
}

export function getJiraConfig(input: Partial<NodeJS.ProcessEnv> = process.env): AppConfig {
  const config = getConfig(input);
  if (
    config.JIRA_PROVIDER === "rest" &&
    (!config.JIRA_BASE_URL || !config.JIRA_EMAIL || !config.JIRA_API_TOKEN)
  )
    throw new ConfigurationError(
      "JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN are required when JIRA_PROVIDER=rest.",
    );
  return config;
}
