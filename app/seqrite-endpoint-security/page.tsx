import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SeqriteRoiLandingPage from "@/app/components/SeqriteRoiLandingPage";
import { getSeqriteRoiPage } from "@/lib/seqrite-roi-data";
import { buildMetadata } from "@/lib/seo";

const slug = "seqrite-endpoint-security";
const page = getSeqriteRoiPage(slug);

export const metadata: Metadata = page
  ? buildMetadata({
      title: page.title,
      description: page.description,
      path: `/${slug}`
    })
  : {};

export default function SeqriteEndpointSecurityPage() {
  if (!page) {
    notFound();
  }
  return <SeqriteRoiLandingPage page={page} />;
}
