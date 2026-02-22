"use client";

import { useEffect, useState } from "react";
import { ADS_ID, GA_MEASUREMENT_ID, type TrackingEventPayload } from "@/lib/ads";

type EventRow = {
  name: string;
  time: string;
};

function nowLabel(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

export default function TrackingDebugPanel() {
  const enabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";
  const [events, setEvents] = useState<EventRow[]>([]);
  const gaPresent = typeof window !== "undefined" && typeof window.gtag === "function";
  const dataLayerPresent = typeof window !== "undefined" && Array.isArray(window.dataLayer);
  const adsTagPresent =
    (typeof window !== "undefined" &&
      Array.from(document.querySelectorAll("script[src]")).some((script) =>
        script.getAttribute("src")?.includes("googletagmanager.com/gtag/js?id=AW-")
      )) ||
    Boolean(ADS_ID);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onEvent = (event: Event) => {
      const custom = event as CustomEvent<TrackingEventPayload>;
      const detail = custom.detail;
      if (!detail?.name) {
        return;
      }
      setEvents((current) => [
        { name: detail.name, time: nowLabel(detail.timestamp ?? Date.now()) },
        ...current
      ].slice(0, 6));
    };

    window.addEventListener("conjoin:tracking-event", onEvent as EventListener);
    return () => {
      window.removeEventListener("conjoin:tracking-event", onEvent as EventListener);
    };
  }, [enabled]);

  const attributionText = (() => {
    if (typeof window === "undefined") {
      return [];
    }
    const searchParams = new URLSearchParams(window.location.search);
    const keys = ["gclid", "utm_source", "utm_campaign", "utm_medium", "utm_term", "utm_content"] as const;
    return keys
      .map((key) => [key, searchParams.get(key) ?? ""] as const)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${key}=${value}`);
  })();

  if (!enabled) {
    return null;
  }

  return (
    <aside className="fixed bottom-3 left-3 z-[75] w-[min(92vw,320px)] rounded-xl border border-slate-500/50 bg-slate-950/95 p-3 text-[11px] leading-relaxed text-slate-100 shadow-2xl backdrop-blur">
      <p className="font-semibold uppercase tracking-[0.12em] text-slate-300">Tracking Debug</p>
      <p>GA4 ID: {GA_MEASUREMENT_ID || "missing"}</p>
      <p>Ads ID: {ADS_ID || "missing"}</p>
      <p>gtag: {gaPresent ? "present" : "missing"}</p>
      <p>dataLayer: {dataLayerPresent ? "present" : "missing"}</p>
      <p>adsTag: {adsTagPresent ? "present" : "missing"}</p>
      <p className="mt-1 text-slate-300">Attribution:</p>
      <p className="break-all text-slate-200">{attributionText.length ? attributionText.join(" | ") : "none in URL"}</p>
      <p className="mt-1 text-slate-300">Recent events:</p>
      <ul className="space-y-0.5 text-slate-200">
        {events.length ? (
          events.map((event, index) => (
            <li key={`${event.name}-${event.time}-${index}`}>
              {event.time} - {event.name}
            </li>
          ))
        ) : (
          <li>No tracked events yet.</li>
        )}
      </ul>
    </aside>
  );
}
