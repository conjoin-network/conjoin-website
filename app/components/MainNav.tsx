"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, PRIMARY_NAV_LINKS } from "@/lib/nav-links";

export default function MainNav({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "/";

  return (
    <nav className={`flex flex-wrap items-center gap-1.5 text-sm text-[var(--color-text-secondary)] ${className}`.trim()}>
      {PRIMARY_NAV_LINKS.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`interactive-link rounded-lg px-2 py-1 transition ${
              active
                ? "nav-link-active bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]"
                : "hover:bg-[var(--color-alt-bg)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
