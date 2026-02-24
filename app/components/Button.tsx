import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost";

type CommonProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

const baseClass =
  "interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold tracking-[0.01em] transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)]";

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-blue-600/28 bg-gradient-to-r from-[#2b6fff] via-[#2a62ef] to-[#1d47bc] text-white shadow-[0_16px_30px_-20px_rgba(33,91,230,0.95)] hover:-translate-y-0.5 hover:from-[#2a63f0] hover:to-[#1c3fa8]",
  secondary:
    "border border-slate-300/90 bg-slate-950/85 text-white shadow-[0_10px_22px_-16px_rgba(15,23,42,0.7)] hover:-translate-y-0.5 hover:border-blue-500/45 hover:bg-slate-800",
  ghost: "text-[var(--color-primary)] hover:underline",
};

const buildClassName = (variant: Variant, className?: string) =>
  className
    ? `${baseClass} ${variantClasses[variant]} ${className}`
    : `${baseClass} ${variantClasses[variant]}`;

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button className={buildClassName(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buildClassName(variant, className)} {...props}>
      {children}
    </Link>
  );
}
