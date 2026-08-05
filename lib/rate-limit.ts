import { AppError } from "@/lib/errors/app-error";

const buckets = new Map<string, { count: number; resetsAt: number }>();
export function enforceRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    return;
  }
  if (bucket.count >= limit)
    throw new AppError("RATE_LIMITED", "Too many requests. Please try again shortly.", 429);
  bucket.count += 1;
}
