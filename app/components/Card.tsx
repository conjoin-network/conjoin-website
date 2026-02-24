import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

const baseClass =
  "surface-card interactive-card p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--color-primary)]/42 hover:shadow-[0_26px_45px_-30px_rgba(19,65,145,0.48)] focus-within:-translate-y-1 focus-within:border-[color:var(--color-primary)]/42 focus-within:shadow-[0_26px_45px_-30px_rgba(19,65,145,0.48)] md:p-7";

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={className ? `${baseClass} ${className}` : baseClass} {...props}>
      {children}
    </div>
  );
}
