"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackAdsConversionOncePerSession } from "@/lib/ads";

type AdsTrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName?: "phone_click" | "call_click" | "whatsapp_click" | "request_quote_click";
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

        trackAdsConversionOncePerSession(
          eventName,
          {
            value: eventValue,
            link_url: href,
            page_path: pagePath
          },
          eventName
        );
      }}
    />
  );
}
