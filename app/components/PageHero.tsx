import type { ReactNode } from "react";
import { ButtonLink } from "@/app/components/Button";

type HeroCta = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type PageHeroProps = {
  title: string;
  subtitle: string;
  ctas: [HeroCta, HeroCta?];
  bullets?: string[];
  microcopy?: ReactNode;
  className?: string;
};

export default function PageHero({
  title,
  subtitle,
  ctas,
  bullets = [],
  microcopy,
  className
}: PageHeroProps) {
  return (
    <header className={`hero-panel rounded-3xl p-7 md:p-10 ${className ?? ""}`.trim()}>
      <div className="max-w-4xl space-y-5">
        <p className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_86%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
          Procurement-ready delivery
        </p>
        <h1 className="type-h1 text-balance text-[var(--color-text-primary)]">
          {title}
        </h1>
        <p className="type-body text-balance">{subtitle}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <ButtonLink href={ctas[0].href} variant={ctas[0].variant ?? "primary"}>
            {ctas[0].label}
          </ButtonLink>
          {ctas[1] ? (
            <ButtonLink href={ctas[1].href} variant={ctas[1].variant ?? "secondary"}>
              {ctas[1].label}
            </ButtonLink>
          ) : null}
        </div>
        {microcopy ? <p className="type-muted">{microcopy}</p> : null}
        {bullets.length > 0 ? (
          <ul className="grid gap-2 text-sm text-[var(--color-text-secondary)] md:grid-cols-3">
            {bullets.slice(0, 3).map((bullet, index) => (
              <li key={`${bullet}-${index}`} className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </header>
  );
}
