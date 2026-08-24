"use client";

import { useEffect, useState } from "react";
import type { OutputLanguage, TaskType, WorkBreakdown, WorkTask } from "@/types/domain";

type Api<T> = { success: true; data: T } | { success: false; error: { message: string } };
type PublicConfig = {
  aiProvider: "mock" | "openai" | "gemini";
  jiraProvider: "mock" | "rest";
  jiraProjectKey: string;
};
type CreationResult = {
  epic?: { key: string; url: string };
  created: Array<{ key: string; url: string }>;
  failed: Array<{ index: number; stage: string; message: string }>;
  linkedToEpic: string[];
  projectKey: string;
  jiraProvider: "mock" | "rest";
};
const taskTypes: TaskType[] = ["design", "frontend", "backend", "qa", "analytics"];
const typeLabel: Record<TaskType, string> = {
  design: "Design",
  frontend: "Frontend",
  backend: "Backend",
  qa: "QA",
  analytics: "Analytics",
};
const initialTaskOrder: Record<TaskType, number> = {
  backend: 0,
  frontend: 1,
  qa: 2,
  design: 3,
  analytics: 4,
};

function sortTasksForInitialReview(tasks: WorkTask[]): WorkTask[] {
  return [...tasks].sort(
    (left, right) => initialTaskOrder[left.type] - initialTaskOrder[right.type],
  );
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const payload = (await response.json()) as Api<T>;
  if (!payload.success) throw new Error(payload.error.message);
  return payload.data;
}
const id = () => crypto.randomUUID();

function TaskCard({
  task,
  onChange,
  onDelete,
  onMove,
  onImprove,
}: {
  task: WorkTask;
  onChange: (next: WorkTask) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  onImprove: (instruction: string) => void;
}) {
  const [revisionInstruction, setRevisionInstruction] = useState("");
  return (
    <article className="task-card">
      <div className="task-card__top">
        <span className={`badge badge--${task.type}`}>{typeLabel[task.type]}</span>
        <button className="danger" type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
      <label>
        Title
        <input
          value={task.title}
          onChange={(event) => onChange({ ...task, title: event.target.value })}
        />
      </label>
      <label>
        Description
        <textarea
          className="task-card__description"
          rows={7}
          value={task.description}
          onChange={(event) => onChange({ ...task, description: event.target.value })}
        />
      </label>
      <div className="task-card__controls">
        <label>
          Team
          <select
            value={task.type}
            onChange={(event) => onChange({ ...task, type: event.target.value as TaskType })}
          >
            {taskTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabel[type]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select
            value={task.priority}
            onChange={(event) =>
              onChange({ ...task, priority: event.target.value as WorkTask["priority"] })
            }
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>
      <label>
        Why this task exists
        <textarea
          rows={2}
          value={task.rationale}
          onChange={(event) => onChange({ ...task, rationale: event.target.value })}
        />
      </label>
      <label>
        Acceptance criteria
        <textarea
          rows={3}
          value={task.acceptanceCriteria.join("\n")}
          onChange={(event) =>
            onChange({
              ...task,
              acceptanceCriteria: event.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </label>
      <div className="inline-form task-actions">
        <button className="secondary" type="button" onClick={() => onMove("up")}>
          Move up
        </button>
        <button className="secondary" type="button" onClick={() => onMove("down")}>
          Move down
        </button>
      </div>
      <div className="improve-task">
        <label>
          Ask AI to improve this task
          <input
            value={revisionInstruction}
            placeholder="e.g. Make acceptance criteria more specific"
            onChange={(event) => setRevisionInstruction(event.target.value)}
          />
        </label>
        <button
          className="secondary"
          type="button"
          disabled={revisionInstruction.trim().length < 5}
          onClick={() => {
            onImprove(revisionInstruction);
            setRevisionInstruction("");
          }}
        >
          Improve task
        </button>
      </div>
    </article>
  );
}

export function CreateWorkflow() {
  const [requirement, setRequirement] = useState("");
  const [context, setContext] = useState("");
  const [language, setLanguage] = useState<OutputLanguage>("en");
  const [plan, setPlan] = useState<WorkBreakdown>();
  const [createEpic, setCreateEpic] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<CreationResult>();
  const [creationOperationId, setCreationOperationId] = useState<string>();
  const [projectKey, setProjectKey] = useState("PROD");
  const [aiProvider, setAIProvider] = useState<PublicConfig["aiProvider"]>("mock");
  const [jiraProvider, setJiraProvider] = useState<"mock" | "rest">("mock");
  useEffect(() => {
    void request<PublicConfig>("/api/config", { method: "GET" })
      .then((config) => {
        setAIProvider(config.aiProvider);
        setProjectKey(config.jiraProjectKey);
        setJiraProvider(config.jiraProvider);
      })
      .catch(() => undefined);
  }, []);
  const updateTask = (index: number, task: WorkTask) => {
    setCreationOperationId(undefined);
    setPlan((current) =>
      current
        ? { ...current, tasks: current.tasks.map((item, i) => (i === index ? task : item)) }
        : current,
    );
  };
  const moveTask = (index: number, direction: "up" | "down") =>
    setPlan((current) => {
      if (!current) return current;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.tasks.length) return current;
      const tasks = [...current.tasks];
      [tasks[index], tasks[target]] = [tasks[target], tasks[index]];
      return { ...current, tasks };
    });
  const improveTask = async (index: number, instruction: string) => {
    const task = plan?.tasks[index];
    if (!task) return;
    setLoading(true);
    setError(undefined);
    try {
      const improved = await request<WorkTask>("/api/ai/revise-task", {
        method: "POST",
        body: JSON.stringify({ task, instruction, language }),
      });
      updateTask(index, improved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Task improvement failed.");
    } finally {
      setLoading(false);
    }
  };
  const generate = async (selectedLanguage = language) => {
    setLoading(true);
    setError(undefined);
    setResult(undefined);
    try {
      const next = await request<WorkBreakdown>("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({ requirement, context, language: selectedLanguage }),
      });
      setPlan({ ...next, tasks: sortTasksForInitialReview(next.tasks) });
      setLabels(next.labels);
      setCreateEpic(Boolean(next.epicRecommendation?.recommended));
      setCreationOperationId(id());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };
  const create = async () => {
    if (!plan) return;
    setCreating(true);
    setError(undefined);
    try {
      const epic =
        createEpic && plan.epicRecommendation
          ? {
              summary: plan.epicRecommendation.title,
              description: `${plan.epicRecommendation.description}\n\nAcceptance criteria:\n${plan.epicRecommendation.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}`,
              priority: "high" as const,
              labels,
            }
          : undefined;
      const issues = plan.tasks.map((task) => ({
        summary: task.title,
        description: `${task.description}\n\nWhy this task exists:\n${task.rationale}\n\nDepends on:\n${task.dependsOn.length ? task.dependsOn.map((item) => `- ${item}`).join("\n") : "- None"}\n\nAcceptance criteria:\n${task.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}`,
        issueType: "Task",
        workstream: task.type,
        priority: task.priority,
        labels,
      }));
      const operationId = creationOperationId ?? id();
      setCreationOperationId(operationId);
      setResult(
        await request<CreationResult>("/api/jira/issues", {
          method: "POST",
          headers: { "Idempotency-Key": operationId },
          body: JSON.stringify({ projectKey, epic, issues }),
        }),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Jira creation failed.");
    } finally {
      setCreating(false);
    }
  };
  const addLabel = () => {
    const next = labelInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (next && !labels.includes(next)) {
      setCreationOperationId(undefined);
      setLabels([...labels, next]);
    }
    setLabelInput("");
  };
  const addTask = () => {
    setCreationOperationId(undefined);
    setPlan((current) =>
      current
        ? {
            ...current,
            tasks: [
              ...current.tasks,
              {
                id: id(),
                type: "frontend",
                title: "New task",
                description: "Describe the implementation work.",
                acceptanceCriteria: ["Define expected behavior."],
                priority: "medium",
                rationale: "Custom work item added during human review.",
                dependsOn: [],
              },
            ],
          }
        : current,
    );
  };
  return (
    <>
      <div className="workflow">
        {["Language", "Analyze", "Preview", "Create"].map((name, index) => (
          <div
            key={name}
            className={
              (result ? 4 : plan ? 3 : loading ? 2 : 1) >= index + 1
                ? "workflow__step active"
                : "workflow__step"
            }
          >
            <span>0{index + 1}</span>
            {name}
          </div>
        ))}
      </div>
      <section className="intro">
        <p className="eyebrow">AI Product Manager</p>
        <h1>Plan a feature before Jira.</h1>
        <p>
          Analyze the requirement, review an editable cross-functional plan, then explicitly approve
          Jira creation.
        </p>
      </section>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / Language & requirement</p>
            <h2>What should be planned?</h2>
          </div>
          <span className="hint">No Jira issue is created during analysis</span>
        </div>
        <fieldset>
          <legend>Jira content language</legend>
          <div className="chip-group">
            <label className="chip">
              <input
                type="radio"
                name="language"
                checked={language === "tr"}
                onChange={() => {
                  setLanguage("tr");
                  if (plan) void generate("tr");
                }}
              />
              🇹🇷 Türkçe
            </label>
            <label className="chip">
              <input
                type="radio"
                name="language"
                checked={language === "en"}
                onChange={() => {
                  setLanguage("en");
                  if (plan) void generate("en");
                }}
              />
              🇬🇧 English
            </label>
          </div>
        </fieldset>
        <label>
          Product requirement
          <textarea
            rows={6}
            value={requirement}
            placeholder="Describe the user problem, outcome, and constraints…"
            onChange={(event) => setRequirement(event.target.value)}
          />
        </label>
        <label>
          Additional context <span className="optional">(optional)</span>
          <textarea rows={3} value={context} onChange={(event) => setContext(event.target.value)} />
        </label>
        {jiraProvider === "mock" ? (
          <p className="mock-notice">
            Mock Jira is enabled; previews work normally but no real Jira issue will be created
            until Settings is connected.
          </p>
        ) : null}
        {aiProvider === "mock" ? (
          <p className="mock-notice">
            Mock AI is enabled; generated plans are deterministic examples. Configure
            <code> AI_PROVIDER=gemini </code>and <code>GEMINI_API_KEY</code> for Senior PM-level
            Gemini analysis.
          </p>
        ) : null}
        <button
          className="primary"
          type="button"
          disabled={loading || requirement.trim().length < 20}
          onClick={() => void generate()}
        >
          {loading ? "Analyzing requirement…" : "Analyze & generate plan"}
        </button>
      </section>
      {error ? (
        <div className="alert" role="alert">
          {error}
        </div>
      ) : null}
      {plan ? (
        <section className="review">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / Plan preview</p>
              <h2>{plan.featureType.replaceAll("_", " ")}</h2>
            </div>
            <button className="secondary" type="button" onClick={addTask}>
              Add task
            </button>
          </div>
          {plan.warnings.length ? (
            <section className="planning-warnings" aria-label="Planning warnings">
              <p className="eyebrow">Semantic warnings</p>
              {plan.warnings.map((warning) => (
                <p key={`${warning.code}-${warning.taskId ?? "plan"}`}>⚠ {warning.message}</p>
              ))}
            </section>
          ) : null}
          {plan.epicRecommendation ? (
            <article className="summary-card epic-card">
              <div className="epic-card__header">
                <h3 className="epic-card__title">Create Epic</h3>
                <label className="toggle">
                  <span className="sr-only">Create Epic</span>
                  <input
                    aria-label="Create Epic"
                    type="checkbox"
                    checked={createEpic}
                    onChange={(event) => {
                      setCreationOperationId(undefined);
                      setCreateEpic(event.target.checked);
                    }}
                  />
                  <span className="toggle__track" aria-hidden="true" />
                </label>
              </div>
              <label>
                Epic title
                <input
                  value={plan.epicRecommendation.title}
                  disabled={!createEpic}
                  onChange={(event) => {
                    setCreationOperationId(undefined);
                    setPlan({
                      ...plan,
                      epicRecommendation: {
                        ...plan.epicRecommendation!,
                        title: event.target.value,
                      },
                    });
                  }}
                />
              </label>
              <label>
                Epic description
                <textarea
                  className="epic-card__description"
                  rows={3}
                  disabled={!createEpic}
                  value={plan.epicRecommendation.description}
                  onChange={(event) => {
                    setCreationOperationId(undefined);
                    setPlan({
                      ...plan,
                      epicRecommendation: {
                        ...plan.epicRecommendation!,
                        description: event.target.value,
                      },
                    });
                  }}
                />
              </label>
            </article>
          ) : null}
          <section className="panel labels">
            <p className="eyebrow">Labels</p>
            <div className="chip-group">
              {labels.map((label) => (
                <button
                  type="button"
                  className="chip"
                  key={label}
                  onClick={() => {
                    setCreationOperationId(undefined);
                    setLabels(labels.filter((item) => item !== label));
                  }}
                >
                  {label} ×
                </button>
              ))}
            </div>
            <div className="inline-form">
              <input
                value={labelInput}
                placeholder="new-label"
                onChange={(event) => setLabelInput(event.target.value)}
              />
              <button className="secondary" type="button" onClick={addLabel}>
                Add label
              </button>
            </div>
          </section>
          <div className="tasks">
            {plan.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onChange={(next) => updateTask(index, next)}
                onDelete={() => {
                  setCreationOperationId(undefined);
                  setPlan({ ...plan, tasks: plan.tasks.filter((_, i) => i !== index) });
                }}
                onMove={(direction) => moveTask(index, direction)}
                onImprove={(instruction) => void improveTask(index, instruction)}
              />
            ))}
          </div>
          <div className="approval">
            <div>
              <p className="eyebrow">03 / Approval</p>
              <h2>Create in Jira?</h2>
              <p>
                {createEpic
                  ? "An Epic will be created first, then every task will be linked to it."
                  : "Tasks will be created without an Epic."}{" "}
                Target project: <strong>{projectKey}</strong>.
              </p>
            </div>
            <button
              className="primary"
              type="button"
              onClick={create}
              disabled={creating || !plan.tasks.length}
            >
              {creating ? "Creating Jira issues…" : "Approve & create in Jira"}
            </button>
          </div>
        </section>
      ) : null}
      {result ? (
        <section className="panel result">
          <p className="eyebrow">Creation result</p>
          <h2>Created in {result.projectKey}</h2>
          {result.epic ? (
            <a className="issue-link" href={result.epic.url} target="_blank" rel="noreferrer">
              <span>Epic: {result.epic.key}</span>Open in Jira ↗
            </a>
          ) : null}
          {result.created.map((issue) => (
            <a
              className="issue-link"
              key={issue.key}
              href={issue.url}
              target="_blank"
              rel="noreferrer"
            >
              <span>{issue.key}</span>Open in Jira ↗
            </a>
          ))}
          {result.epic ? (
            <p>
              {result.linkedToEpic.length} task(s) linked to Epic {result.epic.key}.
            </p>
          ) : null}
          {result.failed.map((failure) => (
            <p className="failure" key={`${failure.stage}-${failure.index}`}>
              {failure.stage}: {failure.message}
            </p>
          ))}
        </section>
      ) : null}
    </>
  );
}
