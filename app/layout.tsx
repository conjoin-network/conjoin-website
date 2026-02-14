import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import Container from "@/app/components/Container";
import { ButtonLink } from "@/app/components/Button";
import FloatingWhatsApp from "@/app/components/FloatingWhatsApp";
import MainNav from "@/app/components/MainNav";
import MobileNavMenu from "@/app/components/MobileNavMenu";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ConjoinNetwork | Procurement-Ready IT Licensing & Security",
    template: "%s | ConjoinNetwork"
  },
  description: "Procurement-focused Microsoft, Seqrite and OEM solution advisory for North India businesses.",
  alternates: {
    canonical: absoluteUrl("/")
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
  const footerWhatsApp = getWhatsAppLink(
    buildQuoteMessage({ brand: "Microsoft or Seqrite", city: "Chandigarh", requirement: "Licensing and security quote" })
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--color-page-bg)] text-[var(--color-text-primary)] min-h-screen`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,transparent)] backdrop-blur">
            <Container className="min-h-[68px] py-2.5 md:min-h-[82px] md:py-4">
              <div className="hidden grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 md:grid">
                <Link
                  href="/"
                  aria-label="ConjoinNetwork Home"
                  className="brand-link group inline-flex items-center gap-3 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)]"
                >
                  <span className="brand-mark" aria-hidden>
                    <Image
                      src="/brand/conjoin-logo.png"
                      alt=""
                      width={36}
                      height={36}
                      className="brand-image"
                      priority
                    />
                  </span>
                  <span className="max-w-[18rem] text-[10px] font-medium tracking-[0.04em] text-[var(--color-text-secondary)]">
                    Procurement Advisory
                  </span>
                </Link>
                <div className="flex min-w-0 justify-center">
                  <MainNav />
                </div>
                <div className="flex items-center justify-end gap-2 lg:gap-3">
                  <Link
                    href="/search"
                    aria-label="Search"
                    className="header-icon-btn inline-flex h-10 w-10 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
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
                  <ButtonLink href="/request-quote" variant="primary" className="min-h-[42px] whitespace-nowrap">
                    Request Quote
                  </ButtonLink>
                </div>
              </div>

              <div className="md:hidden">
                <div className="flex items-center justify-between gap-2">
                <Link
                  href="/"
                  aria-label="ConjoinNetwork Home"
                  className="brand-link group inline-flex items-center gap-2 rounded-xl px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)]"
                >
                    <span className="brand-mark" aria-hidden>
                      <Image
                        src="/brand/conjoin-logo.png"
                        alt=""
                        width={40}
                        height={40}
                        className="brand-image"
                        priority
                      />
                    </span>
                    <span className="hidden max-w-[10rem] text-[10px] font-medium tracking-[0.04em] text-[var(--color-text-secondary)] min-[390px]:inline">
                      Procurement Advisory
                    </span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/search"
                      aria-label="Search"
                      className="header-icon-btn inline-flex h-10 w-10 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
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
                    <ButtonLink href="/request-quote" variant="primary" className="min-h-[42px] px-3 text-xs whitespace-nowrap max-[360px]:px-2">
                      Request Quote
                    </ButtonLink>
                    <MobileNavMenu />
                  </div>
                </div>
              </div>
            </Container>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-alt-bg)]">
            <Container className="space-y-6 py-10 text-sm text-[var(--color-text-secondary)]">
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
                  <div className="flex flex-col gap-1">
                    <Link href="/products" className="hover:underline">
                      Products
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
              <p className="text-xs">© {year} Conjoin Network Pvt Ltd. All rights reserved.</p>
            </Container>
          </footer>
        </div>
        <FloatingWhatsApp />
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
