import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warn" | "error" | "info";
  className?: string;
};

const toneClass: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-[var(--color-alt-bg)] text-[var(--color-text-secondary)]",
  success: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  error: "bg-rose-50 text-rose-700",
  info: "bg-blue-50 text-blue-700"
};

export function Badge({ children, tone = "default", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${toneClass[tone]} ${className}`.trim()}>
      {children}
    </span>
  );
}
