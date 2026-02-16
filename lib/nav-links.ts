export type PrimaryNavLink = {
  href: string;
  label: string;
  matchPrefix: string;
};

export const PRIMARY_NAV_LINKS: PrimaryNavLink[] = [
  {
    href: "/solutions",
    label: "Solutions",
    matchPrefix: "/solutions"
  },
  {
    href: "/microsoft-365-chandigarh",
    label: "Microsoft 365",
    matchPrefix: "/microsoft-365-chandigarh"
  },
  {
    href: "/seqrite-chandigarh",
    label: "Seqrite",
    matchPrefix: "/seqrite-chandigarh"
  },
  {
    href: "/brands",
    label: "Brands",
    matchPrefix: "/brands"
  },
  {
    href: "/knowledge",
    label: "Knowledge",
    matchPrefix: "/knowledge"
  },
  {
    href: "/contact",
    label: "Contact",
    matchPrefix: "/contact"
  }
];

export function isNavActive(pathname: string, link: PrimaryNavLink) {
  return pathname.startsWith(link.matchPrefix);
}
