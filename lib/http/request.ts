import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logging/logger";

export async function withRequest<T>(
  request: NextRequest,
  operation: string,
  handler: (requestId: string) => Promise<T>,
): Promise<T> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const startedAt = performance.now();
  try {
    const response = await handler(requestId);
    logger.info({
      requestId,
      operation,
      durationMs: Math.round(performance.now() - startedAt),
      success: true,
    });
    return response;
  } catch (error) {
    logger.error({
      requestId,
      operation,
      durationMs: Math.round(performance.now() - startedAt),
      success: false,
      err: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
