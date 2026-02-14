"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isNavActive, PRIMARY_NAV_LINKS } from "@/lib/nav-links";

export default function MobileNavMenu() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.body.classList.toggle("menu-open-lock", open);
    return () => {
      document.body.classList.remove("menu-open-lock");
    };
  }, [open]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnRouteChange = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(closeOnRouteChange);
  }, [open, pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        "a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex='-1'])"
      );
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [open]);

  return (
    <div className="relative z-[65]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label="Toggle navigation menu"
        className="header-icon-btn inline-flex h-10 w-10 items-center justify-center text-[var(--color-text-primary)]"
      >
        <span aria-hidden className="text-lg leading-none">
          ☰
        </span>
      </button>

      {open ? (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="mobile-nav-overlay fixed inset-0 z-[70] bg-slate-900/30 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        >
          <div
            ref={drawerRef}
            className="mobile-nav-sheet absolute inset-x-0 top-0 h-[100dvh] w-full translate-x-0 bg-[var(--color-surface)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-4 shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Menu</p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)]/40"
              >
                <span aria-hidden className="text-xl leading-none">×</span>
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <nav className="mt-4 flex max-h-[calc(100dvh-8rem)] flex-col gap-1 overflow-y-auto pr-1">
              {PRIMARY_NAV_LINKS.map((link) => {
                const active = isNavActive(pathname, link);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-3 text-base font-medium transition ${
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
                className={`rounded-lg px-3 py-3 text-base font-medium transition ${
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
                className={`rounded-lg px-3 py-3 text-base font-medium transition ${
                  pathname.startsWith("/search")
                    ? "bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-alt-bg)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                Search
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
