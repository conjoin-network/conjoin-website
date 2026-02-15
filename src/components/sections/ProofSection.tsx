import type { ReactNode } from "react";

type ProofSectionProps = {
  title?: string;
  children: ReactNode;
};

export function ProofSection({ title = "Proof and trust", children }: ProofSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="type-h2 text-[var(--color-text-primary)]">{title}</h2>
      {children}
    </section>
  );
}
