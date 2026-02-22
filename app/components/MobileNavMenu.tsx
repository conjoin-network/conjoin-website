"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildEstimatorQuoteHref,
  defaultEstimatorService,
  ESTIMATOR_M365_PLANS,
  ESTIMATOR_SEQRITE_QTY,
  ESTIMATOR_SERVICE_OPTIONS,
  type EstimatorServiceOption
} from "@/lib/estimator";
import { isNavActive, PRIMARY_NAV_LINKS } from "@/lib/nav-links";

export default function MobileNavMenu() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [service, setService] = useState<EstimatorServiceOption>(() => defaultEstimatorService(pathname));
  const [m365Plan, setM365Plan] = useState<(typeof ESTIMATOR_M365_PLANS)[number]>("Business Standard");
  const [seqriteQty, setSeqriteQty] = useState<(typeof ESTIMATOR_SEQRITE_QTY)[number]>("50");
  const [quoteDetails, setQuoteDetails] = useState("");
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const scrollYRef = useRef(0);
  const pathnameRef = useRef(pathname);
  const requestQuoteHref = useMemo(
    () =>
      buildEstimatorQuoteHref({
        service,
        source: "mobile-menu",
        m365Plan,
        seqriteQty,
        details: quoteDetails
      }),
    [m365Plan, quoteDetails, seqriteQty, service]
  );

  useEffect(() => {
    setService(defaultEstimatorService(pathname));
  }, [pathname]);

  useEffect(() => {
    const body = document.body;
    if (!open) {
      body.classList.remove("menu-open-lock");
      return;
    }

    scrollYRef.current = window.scrollY;
    body.classList.add("menu-open-lock");
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      body.classList.remove("menu-open-lock");
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, scrollYRef.current);
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
    if (pathnameRef.current === pathname) {
      return;
    }

    const previousPath = pathnameRef.current;
    pathnameRef.current = pathname;

    if (!open || previousPath === pathname) {
      return;
    }

    const closeOnRouteChange = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(closeOnRouteChange);
  }, [pathname, open]);

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
    <div className="relative z-[100] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label="Toggle navigation menu"
        className="header-icon-btn pointer-events-auto relative z-[100] inline-flex h-11 w-11 items-center justify-center text-[var(--color-text-primary)]"
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
          className="mobile-nav-overlay fixed inset-0 z-[95] bg-slate-900/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            ref={drawerRef}
            className="mobile-nav-sheet absolute inset-x-0 top-0 h-[100dvh] w-full translate-x-0 bg-[var(--color-surface)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Menu</p>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)]/40"
              >
                <span aria-hidden className="text-xl leading-none">×</span>
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <section className="mt-4 space-y-2 rounded-xl border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-alt-bg)_88%,transparent)] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">Quick RFQ Estimator</p>
              <select
                value={service}
                onChange={(event) => setService(event.target.value as EstimatorServiceOption)}
                className="form-field-surface min-h-11 w-full rounded-lg border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-primary)]"
                aria-label="Select service"
              >
                {ESTIMATOR_SERVICE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {service === "Microsoft 365" ? (
                <select
                  value={m365Plan}
                  onChange={(event) => setM365Plan(event.target.value as (typeof ESTIMATOR_M365_PLANS)[number])}
                  className="form-field-surface min-h-11 w-full rounded-lg border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-primary)]"
                  aria-label="Select Microsoft plan"
                >
                  {ESTIMATOR_M365_PLANS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              ) : service === "Seqrite" ? (
                <select
                  value={seqriteQty}
                  onChange={(event) => setSeqriteQty(event.target.value as (typeof ESTIMATOR_SEQRITE_QTY)[number])}
                  className="form-field-surface min-h-11 w-full rounded-lg border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-primary)]"
                  aria-label="Select endpoint count"
                >
                  {ESTIMATOR_SEQRITE_QTY.map((qty) => (
                    <option key={qty} value={qty}>
                      {qty} endpoints
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={quoteDetails}
                  onChange={(event) => setQuoteDetails(event.target.value)}
                  placeholder="Quote details (optional)"
                  className="form-field-surface min-h-11 w-full rounded-lg border border-[var(--color-border)] px-3 text-sm text-[var(--color-text-primary)]"
                />
              )}
              <Link
                href={requestQuoteHref}
                onClick={() => setOpen(false)}
                className="interactive-btn inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-3 text-sm font-semibold text-white"
              >
                Continue to Request Quote
              </Link>
            </section>

            <nav
              className="mt-4 flex flex-col gap-1 overflow-y-auto pr-1"
              style={{ maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 8rem)" }}
            >
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
