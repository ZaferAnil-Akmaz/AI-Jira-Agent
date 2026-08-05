import type { GenerateRequest } from "@/lib/validation/schemas";
import type { WorkBreakdown } from "@/types/domain";

export interface AIProvider {
  generateWorkBreakdown(input: GenerateRequest): Promise<WorkBreakdown>;
}
