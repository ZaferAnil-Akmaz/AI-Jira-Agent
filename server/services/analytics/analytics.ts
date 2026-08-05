export type AnalyticsEvent =
  | "requirement_submitted"
  | "ai_generation_started"
  | "ai_generation_completed"
  | "ai_generation_failed"
  | "task_edited"
  | "task_deleted"
  | "jira_creation_started"
  | "jira_issue_created"
  | "jira_issue_creation_failed"
  | "jira_creation_completed";
export interface AnalyticsProvider {
  track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void;
}
export class NoopAnalyticsProvider implements AnalyticsProvider {
  track(): void {}
}
export const analytics: AnalyticsProvider = new NoopAnalyticsProvider();
