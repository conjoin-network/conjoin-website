import type { Metadata } from "next";

const SITE_URL_FALLBACK = "https://conjoinnetwork.com";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return SITE_URL_FALLBACK;
  }

  try {
    const normalized = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const url = new URL(normalized);
    url.protocol = "https:";
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.replace(/^www\./, "");
    }
    if (url.hostname.endsWith(".vercel.app")) {
      return SITE_URL_FALLBACK;
    }
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return SITE_URL_FALLBACK;
  }
}

export const SITE_URL = resolveSiteUrl();

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
