"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackLeadConversion } from "@/lib/ads";

type ThankYouTrackingProps = {
  leadId?: string;
  formSource: string;
  brand: string;
  category: string;
  city: string;
};

export default function ThankYouTracking({ leadId, formSource, brand, category, city }: ThankYouTrackingProps) {
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

      const markerRaw = window.sessionStorage.getItem("conjoin_submit_success");
      let marker:
        | {
            formSource?: string;
            leadId?: string | null;
            timestamp?: number;
          }
        | null = null;
      if (markerRaw) {
        try {
          marker = JSON.parse(markerRaw) as {
            formSource?: string;
            leadId?: string | null;
            timestamp?: number;
          };
        } catch {
          marker = null;
        }
      }

      const markerTimestamp = typeof marker?.timestamp === "number" ? marker.timestamp : 0;
      const markerFresh = markerTimestamp > 0 && Date.now() - markerTimestamp < 30 * 60 * 1000;
      const markerSourceMatches = !marker?.formSource || marker.formSource === formSource;
      const markerLeadMatches = !leadId || !marker?.leadId || marker.leadId === leadId;

      if (!leadId) {
        if (!markerFresh || !markerSourceMatches || !markerLeadMatches) {
          return;
        }
      } else if (markerRaw && (!markerFresh || !markerSourceMatches || !markerLeadMatches)) {
        return;
      }

      window.sessionStorage.setItem("conjoin_generate_lead_key", dedupeKey);
      if (markerRaw) {
        window.sessionStorage.removeItem("conjoin_submit_success");
      }
    }

    firedRef.current = true;
    trackLeadConversion({
      leadId,
      pagePath: pathname,
      formSource,
      brand,
      category,
      city
    });
  }, [brand, category, city, formSource, leadId, pathname]);

  return null;
}
