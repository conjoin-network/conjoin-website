"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackAdsConversion } from "@/lib/ads";

type AdsTrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName?: "phone_click" | "whatsapp_click";
  eventValue?: number;
};

export default function AdsTrackedLink({
  eventName,
  eventValue = 1,
  onClick,
  href,
  ...props
}: AdsTrackedLinkProps) {
  return (
    <a
      {...props}
      href={href}
      data-ads-tracked="1"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !eventName) {
          return;
        }

        const pagePath =
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : undefined;

        trackAdsConversion(eventName, {
          value: eventValue,
          link_url: href,
          page_path: pagePath
        });
      }}
    />
  );
}
