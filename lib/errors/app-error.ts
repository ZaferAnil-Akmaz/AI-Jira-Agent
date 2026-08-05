export type ErrorCode =
  | "VALIDATION_ERROR"
  | "CONFIGURATION_ERROR"
  | "AI_PROVIDER_ERROR"
  | "AI_OUTPUT_INVALID"
  | "JIRA_AUTHENTICATION_FAILED"
  | "JIRA_PERMISSION_DENIED"
  | "JIRA_ISSUE_CREATION_FAILED"
  | "EXTERNAL_SERVICE_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number = 500,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
  }
}
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super("CONFIGURATION_ERROR", message, 500);
  }
}
export class AIProviderError extends AppError {
  constructor(message: string, cause?: unknown) {
    super("AI_PROVIDER_ERROR", message, 502, cause);
  }
}
export class JiraAuthenticationError extends AppError {
  constructor(message = "Unable to authenticate with Jira.") {
    super("JIRA_AUTHENTICATION_FAILED", message, 401);
  }
}
export class JiraPermissionError extends AppError {
  constructor(message = "Your Jira account does not have permission for this operation.") {
    super("JIRA_PERMISSION_DENIED", message, 403);
  }
}
export class JiraIssueCreationError extends AppError {
  constructor(message: string, cause?: unknown) {
    super("JIRA_ISSUE_CREATION_FAILED", message, 502, cause);
  }
}
export class ExternalServiceError extends AppError {
  constructor(message: string, cause?: unknown) {
    super("EXTERNAL_SERVICE_ERROR", message, 502, cause);
  }
}
