"use client";

import { useEffect } from "react";

type ThankYouConversionProps = {
  leadId?: string;
  brand: string;
  requirement: string;
  qty: string;
  city: string;
  timeline: string;
};

const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();
const adsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim();

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function ThankYouConversion({
  leadId,
  brand,
  requirement,
  qty,
  city,
  timeline
}: ThankYouConversionProps) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    const transactionId = leadId || `RFQ-${Date.now()}`;
    const commonPayload = {
      lead_id: transactionId,
      brand,
      requirement,
      quantity: qty,
      city,
      timeline
    };

    if (adsId && adsConversionLabel) {
      window.gtag("event", "conversion", {
        send_to: `${adsId}/${adsConversionLabel}`,
        ...commonPayload,
        value: 1,
        currency: "INR",
        transaction_id: transactionId
      });
    }
  }, [brand, city, leadId, qty, requirement, timeline]);

  return null;
}
