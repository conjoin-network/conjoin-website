import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

const baseClass =
  "inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-alt-bg)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]";

export default function Badge({ children, className }: BadgeProps) {
  return <span className={className ? `${baseClass} ${className}` : baseClass}>{children}</span>;
}
