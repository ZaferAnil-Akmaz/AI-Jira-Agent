"use client";

export default function GlobalError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            fontFamily: "Arial, sans-serif",
            margin: "10vh auto",
            maxWidth: 640,
            padding: 24,
          }}
        >
          <h1>AI Product Jira Agent could not load.</h1>
          <p>Please try again or restart the local development server.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
