export const geminiTaskTypes = ["Frontend", "Backend", "QA", "Design"] as const;

export type GeminiTaskType = (typeof geminiTaskTypes)[number];

export interface Task {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  type: GeminiTaskType;
  labels: string[];
  estimatedStoryPoints: number;
}

export interface Epic {
  title: string;
  description: string;
  tasks: Task[];
}
