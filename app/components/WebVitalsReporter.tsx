"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

type Payload = {
  id: string;
  name: "CLS" | "INP" | "LCP" | "FCP" | "TTFB";
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  navigationType?: string;
  path: string;
  userAgent?: string;
};

const trackedMetrics = new Set(["CLS", "INP", "LCP", "FCP", "TTFB"]);

function sendMetric(payload: Payload) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/rum", blob)) {
      return;
    }
  }

  void fetch("/api/rum", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    keepalive: true
  }).catch(() => {
    // Do not throw in the client path.
  });
}

export default function WebVitalsReporter() {
  const pathname = usePathname() || "/";
  const routeRef = useRef(pathname);

  useEffect(() => {
    routeRef.current = pathname;
  }, [pathname]);

  useReportWebVitals((metric) => {
    if (!trackedMetrics.has(metric.name)) {
      return;
    }

    sendMetric({
      id: metric.id,
      name: metric.name as Payload["name"],
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      path: routeRef.current,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined
    });
  });

  return null;
}
