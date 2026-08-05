import type { CreatedJiraIssue } from "@/types/domain";

const records = new Map<string, { expiresAt: number; result: CreationResult }>();
export interface CreationResult {
  created: CreatedJiraIssue[];
  failed: Array<{ index: number; message: string }>;
}
export function readIdempotentResult(key: string): CreationResult | undefined {
  const record = records.get(key);
  if (!record) return undefined;
  if (record.expiresAt < Date.now()) {
    records.delete(key);
    return undefined;
  }
  return record.result;
}
export function saveIdempotentResult(key: string, result: CreationResult) {
  records.set(key, { result, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
}
