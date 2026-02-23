import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import Container from "@/app/components/Container";
import AdsTrackedLink from "@/app/components/AdsTrackedLink";
import AnalyticsRouteTracker from "@/app/components/AnalyticsRouteTracker";
import { ButtonLink } from "@/app/components/Button";
import FloatingWhatsApp from "@/app/components/FloatingWhatsApp";
import FloatingCallButton from "@/app/components/FloatingCallButton";
import MobileBottomCtaBar from "@/app/components/MobileBottomCtaBar";
import HeaderScrollState from "@/app/components/HeaderScrollState";
import MainNav from "@/app/components/MainNav";
import MobileNavMenu from "@/app/components/MobileNavMenu";
import OutboundClickTracker from "@/app/components/OutboundClickTracker";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import TrackingDebugPanel from "@/app/components/TrackingDebugPanel";
import WebVitalsReporter from "@/app/components/WebVitalsReporter";
import JsonLd from "@/app/components/JsonLd";
import EnterpriseTrustBar from "@/app/components/EnterpriseTrustBar";
import EstimatorBar from "@/app/components/EstimatorBar";
import { ADS_ID } from "@/lib/ads";
import { GA_ID, isGAEnabled } from "@/lib/ga";
import { isCrmHost } from "@/lib/server/host";
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
    canonical: SITE_URL
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Conjoin Network Pvt. Ltd. | Microsoft 365 & Enterprise IT Chandigarh",
    description: "Partner-led Microsoft 365, Endpoint Security, and Enterprise IT solutions across Chandigarh, Mohali & Panchkula.",
    url: SITE_URL,
    siteName: "Conjoin Network",
    images: [
      {
        url: absoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "Conjoin Network – Enterprise IT Partner"
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Conjoin Network | Enterprise IT Partner",
    description: "Microsoft 365, Security & IT Procurement – Chandigarh",
    images: [absoluteUrl("/og-image.png")]
  }
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  colorScheme: "dark"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const requestHost = headerStore.get("x-conjoin-host") ?? headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const requestPath = headerStore.get("x-conjoin-path") ?? "";
  const crmHost = isCrmHost(requestHost);
  const crmShellPath = requestPath.startsWith("/admin") || requestPath.startsWith("/crm");
  const showMarketingChrome = !(crmHost && crmShellPath);
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
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--color-page-bg)] text-[var(--color-text-primary)] min-h-screen`}
        style={{ backgroundColor: "#0b1220", color: "#e7edf8" }}
      >
        <HeaderScrollState />
        <div className="flex min-h-screen flex-col bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
          {showMarketingChrome ? (
            <header className="site-header sticky top-0 z-50 border-b bg-[var(--color-surface)]">
              <EstimatorBar />
              <Container className="min-h-[66px] py-2 lg:min-h-[96px] lg:py-4">
                <div className="hidden items-center justify-between gap-3 lg:flex">
                  <Link
                    href="/"
                    aria-label="ConjoinNetwork Home"
                    className="brand-link group inline-flex min-w-0 shrink items-center gap-2.5 rounded-xl px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)] md:max-w-[240px]"
                  >
                    <span className="brand-mark shrink-0" aria-hidden>
                      <Image
                        src="/brand/conjoin-logo.png"
                        alt=""
                        width={258}
                        height={113}
                        className="brand-image"
                        priority
                      />
                    </span>
                    <span className="hidden truncate text-xs font-medium tracking-[0.02em] text-[var(--color-text-secondary)] min-[1100px]:inline">
                      Procurement-led IT. Delivered with clarity.
                    </span>
                  </Link>
                  <div className="flex min-w-0 flex-1 justify-center px-2">
                    <MainNav className="justify-center flex-nowrap text-xs lg:text-sm" />
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-1.5 lg:gap-3">
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
                    <ButtonLink href="/request-quote" variant="primary" className="min-h-11 whitespace-nowrap px-4 text-xs lg:px-5 lg:text-sm">
                      Request Quote
                    </ButtonLink>
                  </div>
                </div>

                <div className="lg:hidden">
                  <div className="flex flex-nowrap items-center justify-between gap-2">
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
                    </Link>
                    <div className="flex min-w-0 items-center justify-end gap-2">
                      <ButtonLink href="/request-quote?source=mobile-header" variant="primary" className="min-h-10 px-3 text-[11px] whitespace-nowrap max-[360px]:px-2">
                        Request Quote
                      </ButtonLink>
                      <MobileNavMenu />
                    </div>
                  </div>
                </div>
              </Container>
            </header>
          ) : null}
          {showMarketingChrome ? <EnterpriseTrustBar /> : null}
          <main className={`flex-1 bg-[var(--color-page-bg)] text-[var(--color-text-primary)] ${showMarketingChrome ? "pb-[calc(env(safe-area-inset-bottom,0px)+5rem)] lg:pb-0" : "pb-0"}`}>{children}</main>
          {showMarketingChrome ? (
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
                    <Link href="/seqrite" aria-label="Seqrite products portfolio" className="hover:underline">
                      Seqrite Products
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
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/20 bg-[var(--brand-whatsapp)] px-4 text-sm font-semibold text-white hover:bg-[#0b4b45] focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-alt-bg)]"
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
          ) : null}
        </div>
        {showMarketingChrome ? <MobileBottomCtaBar /> : null}
        {showMarketingChrome ? <FloatingCallButton /> : null}
        {showMarketingChrome ? <FloatingWhatsApp /> : null}
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
        <TrackingDebugPanel />
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
