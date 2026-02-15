import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Container from "@/app/components/Container";
import { ButtonLink } from "@/app/components/Button";
import FloatingWhatsApp from "@/app/components/FloatingWhatsApp";
import AnalyticsPageView from "@/app/components/AnalyticsPageView";
import HeaderScrollState from "@/app/components/HeaderScrollState";
import MainNav from "@/app/components/MainNav";
import MobileNavMenu from "@/app/components/MobileNavMenu";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import WebVitalsReporter from "@/app/components/WebVitalsReporter";
import JsonLd from "@/app/components/JsonLd";
import {
  ORG_OFFICE_BLOCK,
  COVERAGE,
  ORG_AREA_SERVED,
  ORG_NAME,
  ORG_POSTAL_ADDRESS,
  SALES_EMAIL,
  SALES_PHONE_LANDLINE,
  SALES_PHONE_MOBILE,
  SUPPORT_EMAIL,
  getOrgContactPoints,
  getOrgEmails,
  getOrgPhones,
  mailto,
  tel
} from "@/lib/contact";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://conjoinnetwork.com"),
  title: {
    default: "ConjoinNetwork | Procurement-Ready IT Licensing & Security",
    template: "%s | ConjoinNetwork"
  },
  description: "Procurement-focused Microsoft, Seqrite and OEM solution advisory for North India businesses.",
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png"
  },
  openGraph: {
    title: "ConjoinNetwork | Procurement-Ready IT Licensing & Security",
    description: "Licensing, migration, security, renewals and support with compliance-ready commercial proposals.",
    url: absoluteUrl("/"),
    siteName: "ConjoinNetwork",
    type: "website",
    images: [
      {
        url: absoluteUrl("/brand/conjoin-logo.png"),
        alt: "ConjoinNetwork"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ConjoinNetwork | Procurement-Ready IT Licensing & Security",
    description: "Licensing, migration, security, renewals and support with compliance-ready commercial proposals.",
    images: [absoluteUrl("/brand/conjoin-logo.png")]
  }
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  colorScheme: "dark"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() ?? "";
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() ?? "";
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() ?? "";
  const analyticsScriptId = ga4Id || googleAdsId;
  const gtagInit = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "window.gtag = gtag;",
    "gtag('js', new Date());",
    ga4Id ? `gtag('config', '${ga4Id}', { anonymize_ip: true });` : "",
    googleAdsId ? `gtag('config', '${googleAdsId}');` : ""
  ]
    .filter(Boolean)
    .join("\n");
  const year = new Date().getFullYear();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: SITE_URL,
    foundingDate: "2014",
    areaServed: ORG_AREA_SERVED,
    address: ORG_POSTAL_ADDRESS,
    telephone: getOrgPhones(),
    email: getOrgEmails(),
    contactPoint: getOrgContactPoints()
  };
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: ORG_NAME,
    url: SITE_URL,
    image: absoluteUrl("/brand/conjoin-logo.png"),
    telephone: getOrgPhones(),
    email: getOrgEmails(),
    address: ORG_POSTAL_ADDRESS,
    areaServed: ORG_AREA_SERVED,
    contactPoint: getOrgContactPoints()
  };
  const footerWhatsApp = getWhatsAppLink(
    buildQuoteMessage({ brand: "Microsoft or Seqrite", city: "Chandigarh", requirement: "Licensing and security quote" })
  );

  return (
    <html lang="en" suppressHydrationWarning data-theme="dark" style={{ backgroundColor: "#0b1220", color: "#e7edf8" }}>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--color-page-bg)] text-[var(--color-text-primary)] min-h-screen`}
        style={{ backgroundColor: "#0b1220", color: "#e7edf8" }}
      >
        <HeaderScrollState />
        <div className="flex min-h-screen flex-col bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
          <header className="site-header sticky top-0 z-50 border-b bg-[var(--color-surface)]">
            <Container className="min-h-[80px] py-3 md:min-h-[96px] md:py-4">
              <div className="hidden grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 md:grid">
                <Link
                  href="/"
                  aria-label="ConjoinNetwork Home"
                  className="brand-link group inline-flex items-center gap-3 rounded-xl px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)]"
                >
                  <span className="brand-mark" aria-hidden>
                    <Image
                      src="/brand/conjoin-logo.png"
                      alt=""
                      width={258}
                      height={113}
                      className="brand-image"
                      priority
                    />
                  </span>
                  <span className="max-w-[21rem] text-xs font-medium tracking-[0.02em] text-[var(--color-text-secondary)]">
                    Procurement-led IT. Delivered with clarity.
                  </span>
                </Link>
                <div className="flex min-w-0 justify-center">
                  <MainNav />
                </div>
                <div className="flex items-center justify-end gap-2 lg:gap-3">
                  <Link
                    href="/search"
                    aria-label="Search"
                    className="header-icon-btn inline-flex h-11 w-11 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                      <path
                        d="M9 15a6 6 0 1 1 4.243-1.757L17 17"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <ButtonLink href="/request-quote" variant="primary" className="min-h-11 whitespace-nowrap">
                    Request Quote
                  </ButtonLink>
                </div>
              </div>

              <div className="md:hidden">
                <div className="flex items-center justify-between gap-2">
                <Link
                  href="/"
                  aria-label="ConjoinNetwork Home"
                  className="brand-link group inline-flex items-center gap-2 rounded-xl px-1.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)]"
                >
                    <span className="brand-mark" aria-hidden>
                      <Image
                        src="/brand/conjoin-logo.png"
                        alt=""
                        width={258}
                        height={113}
                        className="brand-image"
                        priority
                      />
                    </span>
                    <span className="hidden max-w-[12.5rem] text-[10px] font-medium tracking-[0.02em] text-[var(--color-text-secondary)] md:inline">
                      Procurement-led IT. Delivered with clarity.
                    </span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/search"
                      aria-label="Search"
                      className="header-icon-btn inline-flex h-11 w-11 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                        <path
                          d="M9 15a6 6 0 1 1 4.243-1.757L17 17"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                    <ButtonLink href="/request-quote" variant="primary" className="min-h-11 px-3 text-xs whitespace-nowrap max-[360px]:px-2">
                      Request Quote
                    </ButtonLink>
                    <MobileNavMenu />
                  </div>
                </div>
              </div>
            </Container>
          </header>
          <main className="flex-1 bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">{children}</main>
          <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-alt-bg)]">
            <Container className="space-y-6 pb-24 pt-10 text-sm text-[var(--color-text-secondary)] md:py-10">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="font-semibold text-[var(--color-text-primary)]">{ORG_NAME}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em]">{ORG_OFFICE_BLOCK.title}</p>
                  {ORG_OFFICE_BLOCK.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p>
                    Sales:{" "}
                    <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                      {SALES_EMAIL}
                    </a>
                  </p>
                  <p>
                    Support:{" "}
                    <a href={mailto(SUPPORT_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                  <p>
                    Phone:{" "}
                    <a href={tel(SALES_PHONE_LANDLINE)} className="font-semibold text-[var(--color-primary)] hover:underline">
                      {SALES_PHONE_LANDLINE}
                    </a>
                    {" • "}
                    <a href={tel(SALES_PHONE_MOBILE)} className="font-semibold text-[var(--color-primary)] hover:underline">
                      {SALES_PHONE_MOBILE}
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                    <p className="font-semibold text-[var(--color-text-primary)]">Site links</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 lg:grid-cols-3">
                    <Link href="/products" className="hover:underline">
                      Products
                    </Link>
                    <Link href="/solutions" className="hover:underline">
                      Solutions
                    </Link>
                    <Link href="/commercial" className="hover:underline">
                      Commercial
                    </Link>
                    <Link href="/categories" className="hover:underline">
                      Categories
                    </Link>
                    <Link href="/compare/microsoft-365-vs-google-workspace" className="hover:underline">
                      Compare
                    </Link>
                    <Link href="/" className="hover:underline">
                      Home
                    </Link>
                    <Link href="/microsoft" className="hover:underline">
                      Microsoft
                    </Link>
                    <Link href="/seqrite" className="hover:underline">
                      Seqrite
                    </Link>
                    <Link href="/brands" className="hover:underline">
                      Brands
                    </Link>
                    <Link href="/locations/chandigarh" className="hover:underline">
                      Locations
                    </Link>
                    <Link href="/knowledge" className="hover:underline">
                      Knowledge
                    </Link>
                    <Link href="/request-quote" className="hover:underline">
                      Request Quote
                    </Link>
                    <Link href="/contact" className="hover:underline">
                      Contact
                    </Link>
                    <Link href="/privacy-policy" className="hover:underline">
                      Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:underline">
                      Terms
                    </Link>
                    <Link href="/refund-policy" className="hover:underline">
                      Refund Policy
                    </Link>
                    <Link href="/sitemap.xml" className="hover:underline">
                      Sitemap
                    </Link>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-[var(--color-text-primary)]">Coverage</p>
                  <p>{COVERAGE.join(" • ")}</p>
                  <a
                    href={footerWhatsApp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--brand-whatsapp)] px-4 text-sm font-semibold text-white"
                  >
                    WhatsApp Sales
                  </a>
                </div>
              </div>
              <p className="text-xs">
                Working closely with leading OEM ecosystems to deliver the right-fit solution and pricing.
              </p>
              <PartnerDisclaimer />
              <p className="text-xs">© {year} Conjoin Network Pvt. Ltd. All rights reserved.</p>
            </Container>
          </footer>
        </div>
        <FloatingWhatsApp />
        {analyticsScriptId ? (
          <>
            <Script
              id="gtag-loader"
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsScriptId)}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gtagInit }} />
            <AnalyticsPageView ga4Id={ga4Id || undefined} adsId={googleAdsId || undefined} />
          </>
        ) : null}
        {clarityProjectId ? (
          <Script
            id="clarity-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityProjectId}");`
            }}
          />
        ) : null}
        <JsonLd id="organization-jsonld" data={orgJsonLd} />
        <JsonLd id="localbusiness-jsonld" data={localBusinessJsonLd} />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
