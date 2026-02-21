"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackLeadConversion } from "@/lib/ads";

type ThankYouTrackingProps = {
  leadId?: string;
  formSource: string;
};

export default function ThankYouTracking({ leadId, formSource }: ThankYouTrackingProps) {
  const pathname = usePathname() ?? "/thank-you";
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) {
      return;
    }

    const dedupeKey = leadId ? `lead:${leadId}` : `path:${pathname}:${formSource}`;
    if (typeof window !== "undefined") {
      const existing = window.sessionStorage.getItem("conjoin_generate_lead_key");
      if (existing === dedupeKey) {
        return;
      }
      window.sessionStorage.setItem("conjoin_generate_lead_key", dedupeKey);
    }

    firedRef.current = true;
    trackLeadConversion({
      leadId,
      pagePath: pathname,
      formSource
    });
  }, [formSource, leadId, pathname]);

  return null;
}
