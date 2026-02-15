import type { ReactNode } from "react";

type ServiceLinesSectionProps = {
  title: string;
  children: ReactNode;
};

export function ServiceLinesSection({ title, children }: ServiceLinesSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="type-h2 text-[var(--color-text-primary)]">{title}</h2>
      {children}
    </section>
  );
}
