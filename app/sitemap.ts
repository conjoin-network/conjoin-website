import type { MetadataRoute } from "next";
import { SITE_INDEX } from "@/lib/site-index";
import { absoluteUrl } from "@/lib/seo";

const STATIC_ROUTES = [
  "/",
  "/brands",
  "/categories",
  "/solutions",
  "/commercial",
  "/knowledge",
  "/locations",
  "/products",
  "/microsoft-365-chandigarh",
  "/seqrite-chandigarh",
  "/microsoft-365-reseller-chandigarh",
  "/microsoft-365-business-basic-chandigarh",
  "/microsoft-365-business-standard-chandigarh",
  "/microsoft-365-business-premium-chandigarh",
  "/endpoint-security-chandigarh",
  "/endpoint-security-panchkula",
  "/endpoint-security-mohali",
  "/it-procurement-chandigarh",
  "/request-quote",
  "/search"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const allRoutes = [...STATIC_ROUTES, ...SITE_INDEX.map((entry) => entry.url)];
  const now = new Date();

  return allRoutes
    .filter((route) => !route.startsWith("/thank-you"))
    .filter((route) => {
      if (seen.has(route)) {
        return false;
      }
      seen.add(route);
      return true;
    })
    .map((route) => ({
      url: absoluteUrl(route),
      lastModified: now
    }));
}
