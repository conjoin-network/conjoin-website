"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton({ redirectTo = "/admin/login" }: { redirectTo?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin"
      });
    } finally {
      router.replace(redirectTo);
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-text-primary)]"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
