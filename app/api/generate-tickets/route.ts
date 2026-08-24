import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api/response";
import { ConfigurationError, ValidationError } from "@/lib/errors/app-error";
import { withRequest } from "@/lib/http/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateTicketsRequestSchema } from "@/lib/validation/gemini-tickets";
import { getGeminiConfig } from "@/server/config/env";
import { GeminiProvider } from "@/services/ai/geminiProvider";

export async function POST(request: NextRequest) {
  try {
    return await withRequest(request, "ai.generate-tickets", async () => {
      enforceRateLimit(`gemini:${request.headers.get("x-forwarded-for") ?? "local"}`);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new ValidationError("Request body must be valid JSON.");
      }

      const { requirement } = generateTicketsRequestSchema.parse(body);
      const config = getGeminiConfig();

      if (!config.GEMINI_API_KEY) {
        throw new ConfigurationError("GEMINI_API_KEY is required.");
      }

      const provider = new GeminiProvider(config.GEMINI_API_KEY, config.GEMINI_MODEL);
      const epic = await provider.generateEpic(requirement);
      return ok(epic);
    });
  } catch (error) {
    return apiError(error, request.headers.get("x-request-id") ?? crypto.randomUUID());
  }
}
