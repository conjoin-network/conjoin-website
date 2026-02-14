import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

const baseClass =
  "surface-card interactive-card p-6 transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--color-primary)]/35 hover:shadow-[0_16px_32px_-24px_rgba(0,113,227,0.35)] focus-within:-translate-y-0.5 focus-within:border-[color:var(--color-primary)]/40 focus-within:shadow-[0_16px_32px_-24px_rgba(0,113,227,0.35)] md:p-7";

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={className ? `${baseClass} ${className}` : baseClass} {...props}>
      {children}
    </div>
  );
}
