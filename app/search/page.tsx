import type { Metadata } from "next";
import SearchClient from "@/app/search/SearchClient";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Search | Microsoft, Seqrite, Products, Locations and Knowledge",
  description:
    "Instant local search across Conjoin routes for products, locations, brand pages and procurement knowledge.",
  path: "/search"
});

type SearchParams = {
  q?: string;
};

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return <SearchClient initialQuery={params.q ?? ""} />;
}
