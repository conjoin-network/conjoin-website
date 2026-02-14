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
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white px-6 py-16 text-[#1d1d1f]">
        <main className="mx-auto max-w-xl space-y-4 rounded-2xl border border-[#d2d2d7] bg-[#fbfbfd] p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-[#6e6e73]">
            The page failed to render. Please retry, or refresh the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#0071e3] px-4 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
