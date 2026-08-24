import type { PlanningWarning, WorkBreakdown } from "@/types/domain";

function warning(code: PlanningWarning["code"], message: string, taskId?: string): PlanningWarning {
  return { code, message, ...(taskId ? { taskId } : {}) };
}

export function validatePlanningSemantics(plan: WorkBreakdown): PlanningWarning[] {
  const warnings: PlanningWarning[] = [];
  const taskIds = new Set(plan.tasks.map((task) => task.id));
  const backendCapability = plan.capabilityAnalysis.find((item) =>
    /api|backend|persistence|data source|veri kaynağı/i.test(item.capability),
  );
  const backendTask = plan.tasks.find((task) => task.type === "backend");

  for (const task of plan.tasks) {
    for (const dependency of task.dependsOn) {
      if (!taskIds.has(dependency)) {
        warnings.push(
          warning(
            "INVALID_DEPENDENCY",
            `Task dependency "${dependency}" does not reference a task in this plan.`,
            task.id,
          ),
        );
      }
    }
    if (!task.rationale.trim()) {
      warnings.push(
        warning("MISSING_TASK_RATIONALE", "This task has no planning rationale.", task.id),
      );
    }
  }

  if (backendTask && backendCapability?.status === "existing") {
    warnings.push(
      warning(
        "BACKEND_CAPABILITY_CONFLICT",
        "A backend implementation task exists although the supplied capability context indicates an existing backend capability.",
        backendTask.id,
      ),
    );
  }
  if (plan.tasks.some((task) => task.type === "frontend") && !plan.analysis.scope.length) {
    warnings.push(
      warning(
        "FRONTEND_SCOPE_CONFLICT",
        "A frontend task exists but the analysis does not define user-facing scope.",
      ),
    );
  }
  if (plan.tasks.some((task) => task.type === "analytics") && !plan.analysis.businessGoal.trim()) {
    warnings.push(
      warning(
        "ANALYTICS_SCOPE_CONFLICT",
        "An analytics task exists without an identifiable product goal or measurable behavior.",
      ),
    );
  }
  if (
    plan.tasks.some((task) => ["frontend", "backend", "design"].includes(task.type)) &&
    !plan.tasks.some((task) => task.type === "qa")
  ) {
    warnings.push(warning("QA_COVERAGE", "Delivery work exists but the plan has no QA task."));
  }
  for (let index = 0; index < plan.tasks.length; index += 1) {
    const current = plan.tasks[index];
    const duplicate = plan.tasks
      .slice(index + 1)
      .find(
        (candidate) =>
          candidate.title.trim().toLowerCase() === current.title.trim().toLowerCase() ||
          candidate.description.trim().toLowerCase() === current.description.trim().toLowerCase(),
      );
    if (duplicate) {
      warnings.push(
        warning(
          "DUPLICATE_SCOPE",
          `Tasks "${current.id}" and "${duplicate.id}" appear to have duplicate scope.`,
          current.id,
        ),
      );
    }
  }
  if (
    plan.capabilityAnalysis.some(
      (item) => item.status === "unknown" || item.status === "requires_validation",
    )
  ) {
    warnings.push(
      warning(
        "UNKNOWN_ARCHITECTURE",
        "Some capability decisions rely on unknown or unvalidated system context. Review assumptions before Jira creation.",
      ),
    );
  }
  return warnings;
}
