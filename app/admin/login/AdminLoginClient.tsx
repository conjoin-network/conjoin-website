"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AdminLoginClientProps = {
  defaultRedirect?: string;
};

const ALLOWED_NEXT_PREFIXES = ["/admin", "/crm"];

export default function AdminLoginClient({ defaultRedirect = "/admin/leads" }: AdminLoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password })
      });

      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.message ?? "Unable to sign in.");
        return;
      }

      const nextPath = searchParams.get("next");
      const redirectTo =
        nextPath && ALLOWED_NEXT_PREFIXES.some((prefix) => nextPath.startsWith(prefix))
          ? nextPath
          : defaultRedirect;
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Unable to sign in.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Admin Login</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Enter admin password to access lead operations.</p>
      </div>

      <label className="block space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
        Username
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
          autoComplete="username"
          required
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
          autoComplete="current-password"
          required
        />
      </label>

      {status === "error" ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>
      ) : null}

      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white disabled:opacity-60"
        disabled={status === "loading" || !username.trim() || !password.trim()}
      >
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
