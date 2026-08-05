import { JiraSettingsForm } from "@/components/jira/jira-settings-form";

export default function SettingsPage() {
  return (
    <main className="dashboard">
      <section className="panel">
        <p className="eyebrow">Configuration</p>
        <h1>Settings</h1>
        <p>
          Test a Jira Cloud connection below. The token is sent only to the server, never returned
          to the browser, and cleared when the app restarts.
        </p>
        <JiraSettingsForm />
        <p>
          For a durable deployment, configure credentials through <code>.env.local</code> or a
          secret manager. Use mock providers for a safe local walkthrough.
        </p>
        <dl className="settings-list">
          <dt>AI provider</dt>
          <dd>
            <code>AI_PROVIDER=mock | openai</code>
          </dd>
          <dt>Jira provider</dt>
          <dd>
            <code>JIRA_PROVIDER=mock | rest</code>
          </dd>
        </dl>
      </section>
    </main>
  );
}
