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
  "interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)]";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white shadow-[0_10px_22px_-14px_rgba(37,99,235,0.9)] hover:-translate-y-0.5 hover:from-[#1d4ed8] hover:to-[#1e3a8a]",
  secondary:
    "border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:-translate-y-0.5 hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-alt-bg)]",
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
