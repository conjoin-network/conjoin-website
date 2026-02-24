"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, PRIMARY_NAV_LINKS } from "@/lib/nav-links";

export default function MainNav({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "/";

  return (
    <nav className={`flex flex-nowrap items-center gap-1 text-sm text-[var(--color-text-secondary)] lg:gap-1.5 ${className}`.trim()}>
      {PRIMARY_NAV_LINKS.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`interactive-link whitespace-nowrap rounded-lg px-2 py-1.5 transition lg:px-2.5 ${
              active
                ? "nav-link-active bg-[color:color-mix(in_srgb,var(--color-primary)_14%,var(--color-alt-bg))] text-[var(--color-text-primary)]"
                : "hover:bg-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-alt-bg))] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
