"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { isNavActive, PRIMARY_NAV_LINKS } from "@/lib/nav-links";

export default function MobileNavMenu() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30"
      >
        <span aria-hidden className="text-lg leading-none">
          ☰
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-[var(--color-border)] bg-white p-2 shadow-[0_14px_30px_rgba(15,23,42,0.1)]">
          <nav className="flex flex-col gap-1">
            {PRIMARY_NAV_LINKS.map((link) => {
              const active = isNavActive(pathname, link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-alt-bg)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/categories"
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith("/categories")
                  ? "bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-alt-bg)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Categories
            </Link>
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith("/search")
                  ? "bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-alt-bg)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Search
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
