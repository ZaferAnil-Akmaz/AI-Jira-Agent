import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api/response";
import { withRequest } from "@/lib/http/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateRequestSchema } from "@/lib/validation/schemas";
import { AIService } from "@/server/services/ai/ai-service";
import { analytics } from "@/server/services/analytics/analytics";

export async function POST(request: NextRequest) {
  try {
    return await withRequest(request, "ai.generate", async () => {
      enforceRateLimit(`ai:${request.headers.get("x-forwarded-for") ?? "local"}`);
      const input = generateRequestSchema.parse(await request.json());
      analytics.track("requirement_submitted");
      analytics.track("ai_generation_started");
      const data = await new AIService().generateWorkBreakdown(input);
      analytics.track("ai_generation_completed");
      return ok(data);
    });
  } catch (error) {
    analytics.track("ai_generation_failed");
    return apiError(error, request.headers.get("x-request-id") ?? crypto.randomUUID());
  }
}
