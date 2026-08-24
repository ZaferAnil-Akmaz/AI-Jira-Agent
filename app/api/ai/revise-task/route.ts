import type { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api/response";
import { withRequest } from "@/lib/http/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { reviseTaskRequestSchema } from "@/lib/validation/schemas";
import { AIService } from "@/server/services/ai/ai-service";

export async function POST(request: NextRequest) {
  try {
    return await withRequest(request, "ai.revise_task", async () => {
      enforceRateLimit(`ai-revision:${request.headers.get("x-forwarded-for") ?? "local"}`);
      const input = reviseTaskRequestSchema.parse(await request.json());
      return ok(await new AIService().reviseTask(input));
    });
  } catch (error) {
    return apiError(error, request.headers.get("x-request-id") ?? crypto.randomUUID());
  }
}
