import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://conjoinnetwork.com";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

export function buildMetadata(input: { title: string; description: string; path: string }): Metadata {
  const canonical = absoluteUrl(input.path);
  const ogImage = absoluteUrl("/brand/conjoin-logo.png");

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: "Conjoin Network",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: "Conjoin Network Pvt Ltd"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage]
    }
  };
}
