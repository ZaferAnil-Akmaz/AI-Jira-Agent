import { describe, expect, it } from "vitest";
import { generateRequestSchema, workBreakdownSchema } from "@/lib/validation/schemas";

describe("request and AI schemas", () => {
  it("accepts a valid generation request", () =>
    expect(
      generateRequestSchema.parse({
        requirement: "Allow account owners to export a monthly activity report.",
        context: "",
        language: "en",
      }).language,
    ).toBe("en"));
  it("rejects malformed AI output", () =>
    expect(() => workBreakdownSchema.parse({ summary: "short" })).toThrow());
});
