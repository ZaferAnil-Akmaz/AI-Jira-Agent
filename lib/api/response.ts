import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(error: unknown, requestId: string) {
  const appError =
    error instanceof ZodError
      ? new ValidationError(error.issues.map((issue) => issue.message).join(", "))
      : error instanceof AppError
        ? error
        : new AppError("INTERNAL_ERROR", "An unexpected error occurred.");
  logger.error({
    requestId,
    operation: "api.error",
    errorCode: appError.code,
    status: appError.status,
    err: error instanceof Error ? error.message : "Unknown error",
  });
  return NextResponse.json(
    { success: false, error: { code: appError.code, message: appError.message }, requestId },
    { status: appError.status },
  );
}
