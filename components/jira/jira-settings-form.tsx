"use client";

import { FormEvent, useState } from "react";

type ConnectionResult = {
  success: boolean;
  data?: { accountId: string; displayName: string; project: { key: string; name: string } };
  error?: { message: string };
};

export function JiraSettingsForm() {
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function testAndSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    setStatus(undefined);
    try {
      const response = await fetch("/api/jira/connection/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, email, apiToken, projectKey }),
      });
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Settings endpoint returned HTTP ${response.status} instead of JSON. Restart the development server and try again.`,
        );
      }
      const result = (await response.json()) as ConnectionResult;
      if (!result.success || !result.data)
        throw new Error(result.error?.message ?? "Connection failed.");
      setApiToken("");
      setStatus(
        `Connected as ${result.data.displayName}. ${result.data.project.name} (${result.data.project.key}) will be used until you change these settings or restart the app.`,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Connection failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={testAndSave} className="settings-form">
      <label htmlFor="jira-base-url">
        Jira base URL
        <input
          id="jira-base-url"
          type="url"
          required
          placeholder="https://your-company.atlassian.net"
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
        />
      </label>
      <label htmlFor="jira-email">
        Jira account email
        <input
          id="jira-email"
          type="email"
          required
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label htmlFor="jira-api-token">
        Jira API token
        <input
          id="jira-api-token"
          type="password"
          required
          autoComplete="off"
          placeholder="Atlassian API token"
          value={apiToken}
          onChange={(event) => setApiToken(event.target.value)}
        />
      </label>
      <label htmlFor="jira-project-key">
        Jira project key
        <input
          id="jira-project-key"
          required
          pattern="[A-Za-z][A-Za-z0-9_]{1,19}"
          placeholder="SCRUM"
          value={projectKey}
          onChange={(event) => setProjectKey(event.target.value.toUpperCase())}
        />
      </label>
      <button className="primary" disabled={saving} type="submit">
        {saving ? "Testing connection…" : "Test & save for this session"}
      </button>
      {status && (
        <p className="success" role="status">
          {status}
        </p>
      )}
      {error && (
        <p className="failure" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
