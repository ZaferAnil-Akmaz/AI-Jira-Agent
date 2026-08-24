import type { GenerateRequest, ReviseTaskRequest } from "@/lib/validation/schemas";
import type { WorkBreakdown, WorkTask } from "@/types/domain";

export interface AIProvider {
  generateWorkBreakdown(input: GenerateRequest): Promise<WorkBreakdown>;
  reviseTask(input: ReviseTaskRequest): Promise<WorkTask>;
}
