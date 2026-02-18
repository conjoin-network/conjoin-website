import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LocalSeoLandingPage from "@/app/components/LocalSeoLandingPage";
import { getLocalSeoLandingPage } from "@/lib/local-seo-landing-data";
import { buildMetadata } from "@/lib/seo";

const SLUG = "endpoint-security-panchkula";
const page = getLocalSeoLandingPage(SLUG);

export const metadata: Metadata = page
  ? buildMetadata({
      title: page.title,
      description: page.description,
      path: `/${SLUG}`
    })
  : {};

export default function EndpointSecurityPanchkulaPage() {
  if (!page) {
    notFound();
  }

  return <LocalSeoLandingPage page={page} />;
}
