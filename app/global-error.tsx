"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GlobalError:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 720, width: "100%", border: "1px solid #3333", borderRadius: 16, padding: 20 }}>
            <h1 style={{ margin: 0, fontSize: 22 }}>Something went wrong</h1>
            <p style={{ opacity: 0.8, marginTop: 10 }}>
              The app hit an unexpected error. Click retry, or refresh the page.
            </p>
            <pre style={{ whiteSpace: "pre-wrap", opacity: 0.8 }}>
{String(error?.message || error)}
            </pre>
            <button
              onClick={() => reset?.()}
              style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, border: "1px solid #3333", cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
