"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import Section from "@/app/components/Section";
import { BRAND_TILES } from "@/lib/brands-data";
import { CATEGORY_PAGES } from "@/lib/categories-data";
import { SITE_INDEX } from "@/lib/site-index";

type SearchGroup = "Brands" | "Products" | "Locations" | "Knowledge";

type SearchEntry = {
  id: string;
  title: string;
  description: string;
  url: string;
  group: SearchGroup;
};

const GROUP_ORDER: readonly SearchGroup[] = ["Brands", "Products", "Locations", "Knowledge"];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function buildSearchIndex() {
  const unique = new Set<string>();
  const entries: SearchEntry[] = [];

  function push(entry: Omit<SearchEntry, "id">) {
    const normalizedKey = `${entry.group}:${normalize(entry.title)}:${entry.url}`;
    if (unique.has(normalizedKey)) {
      return;
    }

    unique.add(normalizedKey);
    entries.push({
      ...entry,
      id: normalizedKey
    });
  }

  BRAND_TILES.forEach((brand) => {
    push({
      group: "Brands",
      title: brand.name,
      description: "Open RFQ with brand preselected",
      url: `/request-quote?brand=${encodeURIComponent(brand.name)}&source=/search`
    });
  });

  CATEGORY_PAGES.forEach((category) => {
    push({
      group: "Products",
      title: category.name,
      description: "Open RFQ with category preselected",
      url: `/request-quote?category=${encodeURIComponent(category.name)}&source=/search`
    });
  });

  SITE_INDEX.filter((entry) => !entry.url.startsWith("/brands/") && !entry.url.startsWith("/categories/")).forEach((entry) => {
    let group: SearchGroup = "Knowledge";

      if (entry.url.startsWith("/locations") || entry.category === "Locations") {
        group = "Locations";
      } else if (
        entry.category === "Products" ||
        entry.url.startsWith("/solutions") ||
        entry.url.startsWith("/commercial") ||
        entry.url.startsWith("/products") ||
        entry.url.startsWith("/microsoft") ||
        entry.url.startsWith("/seqrite") ||
      entry.url.startsWith("/cisco") ||
      entry.url.startsWith("/campaigns")
    ) {
      group = "Products";
    } else if (entry.url.startsWith("/knowledge")) {
      group = "Knowledge";
    }

    push({
      group,
      title: entry.title,
      description: entry.description,
      url: entry.url
    });
  });

  return entries;
}

const SEARCH_INDEX = buildSearchIndex();

export default function SearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 100);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = document.getElementById("search-prompt") as HTMLInputElement | null;
        input?.focus();
        input?.select();
      }
    }

    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const filtered = useMemo(() => {
    const keyword = normalize(debounced);
    if (!keyword) {
      return SEARCH_INDEX.slice(0, 40);
    }

    return SEARCH_INDEX.filter((entry) =>
      normalize(`${entry.title} ${entry.description} ${entry.group}`).includes(keyword)
    );
  }, [debounced]);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      items: filtered.filter((entry) => entry.group === group)
    })).filter((section) => section.items.length > 0);
  }, [filtered]);

  const flatResults = useMemo(() => grouped.flatMap((section) => section.items), [grouped]);
  const flatIndexMap = useMemo(
    () => new Map(flatResults.map((entry, index) => [entry.id, index])),
    [flatResults]
  );
  const isSearching = normalize(query) !== normalize(debounced);

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, flatResults.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && flatResults[activeIndex]) {
      event.preventDefault();
      router.push(flatResults[activeIndex].url);
      return;
    }

    if (event.key === "Enter" && flatResults[0]) {
      event.preventDefault();
      router.push(flatResults[0].url);
    }
  }

  return (
    <Section tone="alt" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-5xl">Search</h1>
          <p className="text-sm md:text-base">
            Search brands, products, locations and knowledge, then jump straight to the right page or prefilled RFQ.
          </p>
        </header>

        <Card className="sticky top-[4.75rem] z-20 space-y-3 p-4 md:top-[5.5rem] md:p-5">
          <label htmlFor="search-prompt" className="sr-only">
            Search brands or categories
          </label>
          <input
            id="search-prompt"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search brands or categories"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-base text-[var(--color-text-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] focus:outline-none md:text-sm"
          />
          <p className="text-xs text-[var(--color-text-secondary)]">
            Tip: use <kbd className="rounded border px-1 py-0.5">⌘K</kbd> / <kbd className="rounded border px-1 py-0.5">Ctrl+K</kbd>
          </p>
        </Card>

        <div className="space-y-4">
          {isSearching ? (
            <Card className="space-y-3 p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-border)]" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={`search-skeleton-${index}`} className="h-10 animate-pulse rounded-lg bg-[var(--color-alt-bg)]" />
                ))}
              </div>
            </Card>
          ) : grouped.length === 0 ? (
            <Card className="p-4">
              <p className="text-sm text-[var(--color-text-secondary)]">No results found. Try another brand or category keyword.</p>
            </Card>
          ) : (
            grouped.map((section) => (
              <Card key={section.group} className="space-y-2 p-3">
                <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">{section.group}</h2>
                <ul className="space-y-1">
                  {section.items.map((entry) => {
                    const globalIndex = flatIndexMap.get(entry.id) ?? -1;
                    const active = globalIndex === activeIndex;
                    return (
                      <li key={entry.id}>
                        <Link
                          href={entry.url}
                          className={`block rounded-lg px-3 py-2 text-sm transition ${
                            active
                              ? "bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]"
                              : "text-[var(--color-text-primary)] hover:bg-[var(--color-alt-bg)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-text-secondary)]/70" aria-hidden />
                            <p className="font-medium">{entry.title}</p>
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)]">{entry.description}</p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ))
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold text-[var(--color-primary)]">
          <Link href="/request-quote" className="hover:underline">
            Request Quote
          </Link>
          <Link href="/brands" className="hover:underline">
            Browse Brands
          </Link>
          <Link href="/knowledge" className="hover:underline">
            Knowledge Hub
          </Link>
        </div>
      </div>
    </Section>
  );
}
