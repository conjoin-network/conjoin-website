import Link from "next/link";

type RelatedLink = {
  href: string;
  title: string;
  description?: string;
};

export default function RelatedLinks({
  title = "Related pages",
  links
}: {
  title?: string;
  links: RelatedLink[];
}) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-[var(--color-border)] bg-white p-4 transition hover:border-[var(--color-primary)]/40"
          >
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{link.title}</p>
            {link.description ? <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{link.description}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
