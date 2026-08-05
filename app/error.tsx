"use client";

export default function RootError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main className="error-page">
      <p className="eyebrow">Application error</p>
      <h1>Something went wrong.</h1>
      <p>Please try loading the page again. If the problem persists, check the server logs.</p>
      <button className="primary" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
