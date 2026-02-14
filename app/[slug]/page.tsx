import { notFound, permanentRedirect } from "next/navigation";
import { getBrandBySlug } from "@/lib/brands-data";

export default async function BrandAliasRedirectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) {
    notFound();
  }

  permanentRedirect(`/brands/${brand.slug}`);
}
