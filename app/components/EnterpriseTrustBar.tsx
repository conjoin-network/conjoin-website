"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/app/components/Container";

const TRUST_POINTS = [
  "SLA Support",
  "OEM-aligned Procurement",
  "GST Invoice + Compliance",
  "Chandigarh Tricity Coverage",
  "Response < 30 mins"
];

const PARTNER_STRIP = ["Microsoft", "Seqrite", "Cisco", "HP", "Dell"];

export default function EnterpriseTrustBar() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/admin") || pathname.startsWith("/crm") || pathname.startsWith("/api")) {
    return null;
  }

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-alt-bg)]/70">
      <Container className="space-y-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {TRUST_POINTS.map((item) => (
            <span
              key={item}
              className="inline-flex min-h-8 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-secondary)]"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="grid gap-2 text-xs text-[var(--color-text-secondary)] md:grid-cols-3">
          <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <span className="font-semibold text-[var(--color-text-primary)]">Procurement Ready:</span> Formal quote pack, commercial notes, and
            compliance-first procurement support.
          </p>
          <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <span className="font-semibold text-[var(--color-text-primary)]">Partner Network:</span> Microsoft, Seqrite, Cisco and other OEM-aligned
            sourcing channels.
          </p>
          <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
            <span className="font-semibold text-[var(--color-text-primary)]">Governance:</span> Discovery, approval, deployment and audit handover in
            a single operating flow.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
            <span>Trusted By</span>
            {PARTNER_STRIP.map((partner) => (
              <span key={partner} className="rounded-full border border-[var(--color-border)] px-2 py-1">
                {partner}
              </span>
            ))}
          </div>
          <Link
            href="/request-quote"
            className="inline-flex min-h-9 items-center rounded-lg border border-[var(--color-primary)]/35 bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary)]"
          >
            Request formal quote
          </Link>
        </div>
      </Container>
    </section>
  );
}

