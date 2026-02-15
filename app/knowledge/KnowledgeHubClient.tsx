"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/app/components/Card";
import type { KnowledgeArticle, KnowledgeCategory } from "@/lib/knowledge-data";

type KnowledgeHubClientProps = {
  articles: KnowledgeArticle[];
  categories: KnowledgeCategory[];
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function KnowledgeHubClient({ articles, categories }: KnowledgeHubClientProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory | "all">("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    const needle = normalize(debouncedQuery);
    return articles.filter((article) => {
      const categoryOk = category === "all" || article.category === category;
      if (!categoryOk) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const line = `${article.title} ${article.description} ${article.tags.join(" ")}`.toLowerCase();
      return line.includes(needle);
    });
  }, [articles, category, debouncedQuery]);

  const featured = filtered.slice(0, 3);
  const remaining = filtered.slice(3);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Search articles
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search licensing, compliance, renewals..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-page-bg)] px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as KnowledgeCategory | "all")}
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
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Featured articles</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {featured.map((article) => (
              <Link key={article.slug} href={`/knowledge/${article.slug}`}>
                <Card className="space-y-2 p-4 transition hover:-translate-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                    {article.category}
                  </p>
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{article.title}</h3>
                  <p className="text-sm">{article.description}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Last verified: {article.lastVerified}</p>
                  <p className="text-xs font-semibold text-[var(--color-primary)]">Request Quote →</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">All articles</h2>
        {remaining.length === 0 && featured.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">No articles found for current filter.</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {remaining.map((article) => (
              <Link key={article.slug} href={`/knowledge/${article.slug}`}>
                <Card className="space-y-2 p-4 transition hover:-translate-y-0.5">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{article.title}</h3>
                  <p className="text-sm">{article.description}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{article.tags.join(" • ")}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Last verified: {article.lastVerified}</p>
                  <p className="text-xs font-semibold text-[var(--color-primary)]">Request Quote →</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
