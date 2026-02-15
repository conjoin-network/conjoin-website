"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/app/components/Card";
import type { BrandCategory, BrandTile } from "@/lib/brands-data";

type BrandsCatalogClientProps = {
  brands: BrandTile[];
  categories: BrandCategory[];
  categoryHints: Record<BrandCategory, string>;
};

const PAGE_SIZE = 12;
const topOemSet = new Set(["Microsoft", "Seqrite", "Cisco", "Fortinet", "Sophos", "Palo Alto"]);

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export default function BrandsCatalogClient({ brands, categories, categoryHints }: BrandsCatalogClientProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState<BrandCategory | "all">("all");
  const [onlyTopOems, setOnlyTopOems] = useState(false);
  const [sortOrder, setSortOrder] = useState<"az" | "za">("az");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    const needle = normalize(debouncedQuery);

    const list = brands
      .filter((brand) => (category === "all" ? true : brand.categories.includes(category)))
      .filter((brand) => (onlyTopOems ? topOemSet.has(brand.name) : true))
      .filter((brand) => {
        if (!needle) {
          return true;
        }
        const haystack = `${brand.name} ${brand.description} ${brand.categories.join(" ")}`.toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) =>
        sortOrder === "az" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );

    return list;
  }, [brands, category, debouncedQuery, onlyTopOems, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedBrands = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,180px))]">
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Search brands
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by brand or category"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Category
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as BrandCategory | "all");
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Sort
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value as "az" | "za");
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            >
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </label>

          <label className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={onlyTopOems}
              onChange={(event) => {
                setOnlyTopOems(event.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
            />
            Top OEMs only
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={`chip-${item}`}
              type="button"
              onClick={() => {
                setCategory((current) => (current === item ? "all" : item));
                setPage(1);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                category === item
                  ? "border-[var(--color-primary)] bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]"
              }`}
              title={categoryHints[item]}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pagedBrands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/request-quote?brand=${encodeURIComponent(brand.name)}&source=/brands`}
            aria-label={`Request quote for ${brand.name}`}
          >
            <Card className="space-y-3 p-4 transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{brand.name}</h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  LIVE
                </span>
              </div>
              <p className="text-xs">{brand.description}</p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">{brand.categories.join(" • ")}</p>
              <p className="text-xs font-semibold text-[var(--color-primary)]">Request quote for this brand</p>
            </Card>
          </Link>
        ))}
      </section>

      <section className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3">
        <p className="text-xs text-[var(--color-text-secondary)]">
          Showing {pagedBrands.length} of {filtered.length} brands
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs text-[var(--color-text-secondary)]">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage >= totalPages}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
