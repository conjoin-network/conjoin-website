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
    href: "/microsoft",
    label: "Microsoft",
    matchPrefix: "/microsoft"
  },
  {
    href: "/seqrite",
    label: "Seqrite",
    matchPrefix: "/seqrite"
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
  }
];

export function isNavActive(pathname: string, link: PrimaryNavLink) {
  return pathname.startsWith(link.matchPrefix);
}
