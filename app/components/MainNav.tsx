"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/app/components/Button";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/microsoft",
    label: "Microsoft",
    match: (pathname) => pathname.startsWith("/microsoft")
  },
  {
    href: "/seqrite",
    label: "Seqrite",
    match: (pathname) => pathname.startsWith("/seqrite")
  },
  {
    href: "/brands",
    label: "Brands",
    match: (pathname) => pathname.startsWith("/brands")
  },
  {
    href: "/locations/chandigarh",
    label: "Locations",
    match: (pathname) => pathname.startsWith("/locations")
  },
  {
    href: "/knowledge",
    label: "Knowledge",
    match: (pathname) => pathname.startsWith("/knowledge")
  },
  {
    href: "/search",
    label: "Search",
    match: (pathname) => pathname.startsWith("/search")
  }
];

export default function MainNav() {
  const pathname = usePathname() ?? "/";
  const quoteActive = pathname.startsWith("/request-quote");

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2 text-sm text-[var(--color-text-secondary)]">
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`interactive-link rounded-lg px-2 py-1 transition ${
              active
                ? "bg-[var(--color-alt-bg)] text-[var(--color-text-primary)] shadow-[inset_0_-2px_0_0_var(--color-primary)]"
                : "hover:bg-[var(--color-alt-bg)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <ButtonLink href="/request-quote" variant="primary" className={quoteActive ? "ring-2 ring-[var(--color-primary)]/25" : ""}>
        Request Quote
      </ButtonLink>
    </nav>
  );
}
