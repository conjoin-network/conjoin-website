type EventPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(event: string, payload: EventPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    // Dev-only analytics stub to keep event contracts explicit without third-party lock-in.
    console.info("ANALYTICS_EVENT", event, payload);
  }
}
