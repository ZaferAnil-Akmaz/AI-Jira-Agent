export const taskTypes = ["frontend", "backend", "qa", "analytics", "design"] as const;
export type TaskType = (typeof taskTypes)[number];
export const priorities = ["low", "medium", "high"] as const;
export type Priority = (typeof priorities)[number];
export const outputLanguages = ["tr", "en"] as const;
export type OutputLanguage = (typeof outputLanguages)[number];
export const featureTypes = [
  "new_feature",
  "enhancement",
  "bug",
  "technical_task",
  "maintenance",
] as const;
export type FeatureType = (typeof featureTypes)[number];

export interface WorkTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: Priority;
  dependencies?: string[];
}

export interface WorkBreakdown {
  summary: string;
  problemStatement: string;
  userStory: { title: string; description: string };
  assumptions: string[];
  acceptanceCriteria: string[];
  dependencies: string[];
  tasks: WorkTask[];
  analysis: {
    userProblem: string;
    businessGoal: string;
    actor: string;
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    risks: string[];
    ambiguities: string[];
  };
  language: OutputLanguage;
  featureType: FeatureType;
  epicRecommendation: {
    recommended: boolean;
    title: string;
    description: string;
    acceptanceCriteria: string[];
  } | null;
  labels: string[];
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  url: string;
  issueType: string;
  status: string;
}

export interface JiraProject {
  key: string;
  name: string;
  issueTypes: Array<{ id: string; name: string; subtask: boolean }>;
  priorities: Array<{ id: string; name: string }>;
  components: Array<{ id: string; name: string }>;
}

export interface JiraProjectSummary {
  key: string;
  name: string;
}

export interface CreateIssueInput {
  projectKey: string;
  summary: string;
  description: string;
  issueType: string;
  priority: Priority;
  labels?: string[];
  componentIds?: string[];
  parentKey?: string;
}

export interface CreatedJiraIssue {
  key: string;
  url: string;
}
