import { describe, expect, it } from "vitest";
import {
  readIdempotentResult,
  saveIdempotentResult,
} from "@/server/services/jira/idempotency-store";

describe("idempotency store", () => {
  it("returns the same completed operation result for a retry key", () => {
    const key = `operation-${crypto.randomUUID()}`;
    const result = { created: [{ key: "PROD-1", url: "https://example.test/PROD-1" }], failed: [] };
    saveIdempotentResult(key, result);
    expect(readIdempotentResult(key)).toEqual(result);
  });
});
