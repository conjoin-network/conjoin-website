import type { ReactNode } from "react";

type HowItWorksSectionProps = {
  title?: string;
  children: ReactNode;
};

export function HowItWorksSection({ title = "How it works", children }: HowItWorksSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="type-h2 text-[var(--color-text-primary)]">{title}</h2>
      {children}
    </section>
  );
}
