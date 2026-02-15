"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/seo";

function segmentLabel(segment: string) {
  const normalized = segment.replace(/-/g, " ").trim();
  if (!normalized) {
    return "Home";
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function toUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export default function BreadcrumbJsonLd() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/api")) {
    return null;
  }

  const cleanPath = pathname.split("?")[0].split("#")[0];
  const rawSegments = cleanPath.split("/").filter(Boolean);

  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: toUrl("/")
    }
  ];

  let currentPath = "";
  rawSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    itemListElement.push({
      "@type": "ListItem",
      position: index + 2,
      name: segmentLabel(segment),
      item: toUrl(currentPath)
    });
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement
  };

  return <Script id="breadcrumb-jsonld-global" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
