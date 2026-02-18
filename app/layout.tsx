import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Container from "@/app/components/Container";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import AnalyticsRouteTracker from "@/app/components/AnalyticsRouteTracker";
import { ButtonLink } from "@/app/components/Button";
import FloatingWhatsApp from "@/app/components/FloatingWhatsApp";
import HeaderScrollState from "@/app/components/HeaderScrollState";
import MainNav from "@/app/components/MainNav";
import MobileNavMenu from "@/app/components/MobileNavMenu";
import OutboundClickTracker from "@/app/components/OutboundClickTracker";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import WebVitalsReporter from "@/app/components/WebVitalsReporter";
import JsonLd from "@/app/components/JsonLd";
import { ADS_ID } from "@/lib/ads";
import { GA_ID, isGAEnabled } from "@/lib/ga";
import {
  ORG_OFFICE_BLOCK,
  COVERAGE,
  ORG_AREA_SERVED,
  ORG_NAME,
  ORG_POSTAL_ADDRESS,
  SALES_EMAIL,
  SALES_PHONE_DISPLAY,
  SALES_PHONE_NUMBER,
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
  const adsId = ADS_ID;
  const gaId = GA_ID;
  const primaryTagId = gaId || adsId;
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() ?? "";
  const year = new Date().getFullYear();
  const linkedInUrl = "https://www.linkedin.com/company/conjoinnetwork";
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://www.instagram.com/conjoinnetwork";
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || "https://www.facebook.com/conjoinnetwork";
  const googleReviewUrl = "https://g.page/r/CZFtT-ntygMnEBI/review";
  const googleDirectionsUrl = "https://share.google/48FxHaCAMeAvbAvDC";
  const openingHoursSpecification = [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "18:30"
    }
  ];
  const socialProfiles = [linkedInUrl, instagramUrl, facebookUrl, googleReviewUrl, googleDirectionsUrl];
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
    contactPoint: getOrgContactPoints(),
    sameAs: socialProfiles
  };
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
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
    contactPoint: getOrgContactPoints(),
    sameAs: socialProfiles,
    openingHoursSpecification
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
                    <AdsTrackedLink
                      href={tel(SALES_PHONE_NUMBER)}
                      eventName="phone_click"
                      className="font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      {SALES_PHONE_DISPLAY}
                    </AdsTrackedLink>
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
                  <AdsTrackedLink
                    href={footerWhatsApp}
                    eventName="whatsapp_click"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--brand-whatsapp)] px-4 text-sm font-semibold text-white"
                  >
                    WhatsApp Sales
                  </AdsTrackedLink>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
                      Google Business Profile
                    </p>
                    <p className="mt-1 text-xs">
                      Since 2014 • Chandigarh • Panchkula • Mohali • Enterprise IT & Cybersecurity
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={googleReviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/40"
                      >
                        Google Reviews
                      </a>
                      <a
                        href={googleDirectionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/40"
                      >
                        Get Directions
                      </a>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                      <a href={linkedInUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--color-text-primary)] hover:underline">
                        LinkedIn
                      </a>
                      <a href={instagramUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--color-text-primary)] hover:underline">
                        Instagram
                      </a>
                      <a href={facebookUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--color-text-primary)] hover:underline">
                        Facebook
                      </a>
                    </div>
                  </div>
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
        {primaryTagId ? (
          <>
            <Script
              id="google-tag-loader"
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryTagId)}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-tag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: [
                  "window.dataLayer = window.dataLayer || [];",
                  "function gtag(){dataLayer.push(arguments);}",
                  "window.gtag = gtag;",
                  "gtag('js', new Date());",
                  gaId ? `gtag('config', '${gaId}', { send_page_view: false, cookie_domain: 'conjoinnetwork.com' });` : "",
                  adsId ? `gtag('config', '${adsId}');` : ""
                ]
                  .filter(Boolean)
                  .join(" ")
              }}
            />
          </>
        ) : null}
        {isGAEnabled ? <AnalyticsRouteTracker /> : null}
        <OutboundClickTracker />
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
        <JsonLd id="website-jsonld" data={webSiteJsonLd} />
        <JsonLd id="localbusiness-jsonld" data={localBusinessJsonLd} />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
