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
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !eventName) {
          return;
        }

        trackAdsConversion(eventName, {
          value: eventValue,
          link_url: href
        });
      }}
    />
  );
}
