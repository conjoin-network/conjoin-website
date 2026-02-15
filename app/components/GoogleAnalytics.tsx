"use client";

import Script from "next/script";
import { GA_ID } from "@/lib/ga";

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "";

export default function GoogleAnalytics() {
  if (!GA_ID) {
    return null;
  }

  const gtagInitLines = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "window.gtag = gtag;",
    "gtag('js', new Date());",
    `gtag('config', '${GA_ID}', { send_page_view: false, anonymize_ip: true });`,
    ADS_ID ? `gtag('config', '${ADS_ID}');` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <Script
        id="gtag-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gtagInitLines }} />
    </>
  );
}
