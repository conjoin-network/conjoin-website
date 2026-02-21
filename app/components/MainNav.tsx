"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, PRIMARY_NAV_LINKS } from "@/lib/nav-links";

export default function MainNav({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "/";

  return (
    <nav className={`flex flex-nowrap items-center gap-1 text-xs text-[var(--color-text-secondary)] lg:gap-1.5 lg:text-sm ${className}`.trim()}>
      {PRIMARY_NAV_LINKS.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`interactive-link whitespace-nowrap rounded-lg px-1.5 py-1 transition lg:px-2 ${
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
