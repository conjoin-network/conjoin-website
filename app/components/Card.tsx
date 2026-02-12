import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const baseClass =
  "interactive-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_12px_28px_-24px_rgb(22,35,56)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--color-primary)]/35 hover:shadow-[0_16px_32px_-24px_rgba(0,113,227,0.35)] focus-within:-translate-y-0.5 focus-within:border-[color:var(--color-primary)]/40 focus-within:shadow-[0_16px_32px_-24px_rgba(0,113,227,0.35)] md:p-7";

export default function Card({ children, className }: CardProps) {
  return <div className={className ? `${baseClass} ${className}` : baseClass}>{children}</div>;
}
