"use client";

export default function DashboardError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main className="dashboard">
      <section className="panel error-page">
        <p className="eyebrow">Page error</p>
        <h1>This page could not be loaded.</h1>
        <p>Please retry. Your integration credentials remain server-side.</p>
        <button className="primary" type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
