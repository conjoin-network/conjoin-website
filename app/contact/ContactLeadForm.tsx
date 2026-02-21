"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  requirement: string;
  users: string;
  city: string;
  timeline: string;
  message: string;
  website: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
};

const initialState: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  requirement: "",
  users: "",
  city: "",
  timeline: "This Week",
  message: "",
  website: ""
};

const trackingKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"] as const;
type TrackingKey = (typeof trackingKeys)[number];

type ContactLeadFormProps = {
  mode?: "default" | "minimal";
};

export default function ContactLeadForm({ mode = "default" }: ContactLeadFormProps) {
  const pathname = usePathname() ?? "/contact";
  const router = useRouter();
  const isMinimal = mode === "minimal";
  const [state, setState] = useState<FormState>(initialState);
  // capture utm/gclid from query string on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const updates: Partial<Pick<FormState, TrackingKey>> = {};
    trackingKeys.forEach((k) => {
      const v = params.get(k);
      if (v) updates[k] = v;
    });
    if (Object.keys(updates).length) setState((s) => ({ ...s, ...updates }));
  }, []);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");
  const fieldClass =
    "form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/35";

  function patch(values: Partial<FormState>) {
    if (status === "error") {
      setStatus("idle");
      setNotice("");
    }
    setState((current) => ({ ...current, ...values }));
  }

  function resolveFormSource(path: string) {
    if (path.includes("microsoft-365-chandigarh")) {
      return "m365";
    }
    if (path.includes("seqrite-chandigarh")) {
      return "seqrite";
    }
    if (path.startsWith("/request-quote")) {
      return "request-quote";
    }
    return "contact";
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setNotice("");

    let response: Response;
    try {
      response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          company: state.company,
          email: state.email,
          phone: state.phone,
          requirement: state.requirement,
          usersDevices: state.users ? Number(state.users) : undefined,
          city: state.city,
          timeline: state.timeline,
          notes: state.message,
          website: state.website,
          utm_source: state.utm_source,
          utm_medium: state.utm_medium,
          utm_campaign: state.utm_campaign,
          utm_term: state.utm_term,
          utm_content: state.utm_content,
          gclid: state.gclid,
          gbraid: state.gbraid,
          wbraid: state.wbraid,
          source: pathname || "/contact",
          pageUrl: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : pathname || "/contact",
          landing_page: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : pathname || "/contact",
          referrer: typeof document !== "undefined" ? document.referrer : ""
        })
      });
    } catch {
      setStatus("error");
      setNotice("Service temporarily unavailable. Please try again shortly.");
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      message?: string;
      error?: string;
      leadId?: string;
      rfqId?: string;
    };

    if (response.ok) {
      setStatus("success");
      setNotice("Thank you. Our team will contact you shortly.");
      setState(initialState);

      const formSource = resolveFormSource(pathname);
      const leadId = payload.leadId || payload.rfqId;
      const queryParams = new URLSearchParams();
      queryParams.set("formSource", formSource);
      if (leadId) {
        queryParams.set("leadId", leadId);
      }
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      window.setTimeout(() => {
        router.push(`/thank-you${query}`);
      }, 350);
      return;
    }

    setStatus("error");
    setNotice(payload.error || payload.message || `Unable to submit request (HTTP ${response.status}).`);
  }

  return (
    <form onSubmit={submit} className="surface-card space-y-4 p-5 md:p-6">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Send Enquiry</h2>
      {isMinimal ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Share only the essentials now. We collect implementation details during follow-up.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
          Name
          <input
            required
            value={state.name}
            onChange={(event) => patch({ name: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
          Company
          <input
            required={!isMinimal}
            value={state.company}
            onChange={(event) => patch({ company: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
          Email
          <input
            type="email"
            value={state.email}
            onChange={(event) => patch({ email: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
          Phone
          <input
            type="tel"
            required={isMinimal}
            value={state.phone}
            onChange={(event) => patch({ phone: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
          Requirement
          <input
            required
            value={state.requirement}
            onChange={(event) => patch({ requirement: event.target.value })}
            placeholder="Microsoft licensing, Seqrite renewal, etc."
            className={fieldClass}
          />
        </label>
        {!isMinimal ? (
          <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
            Users / Devices
            <input
              type="number"
              min={1}
              value={state.users}
              onChange={(event) => patch({ users: event.target.value })}
              className={fieldClass}
            />
          </label>
        ) : null}
        <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
          City
          <input
            value={state.city}
            onChange={(event) => patch({ city: event.target.value })}
            className={fieldClass}
          />
        </label>
        {!isMinimal ? (
          <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
            Timeline
            <select
              value={state.timeline}
              onChange={(event) => patch({ timeline: event.target.value })}
              className={fieldClass}
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </label>
        ) : null}
      </div>

      {!isMinimal ? (
        <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
          Notes
          <textarea
            rows={4}
            value={state.message}
            onChange={(event) => patch({ message: event.target.value })}
            className={fieldClass}
          />
        </label>
      ) : null}

      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={state.website}
            onChange={(event) => patch({ website: event.target.value })}
          />
        </label>
      </div>

      {notice ? (
        <p className={`rounded-xl border px-3 py-2 text-sm ${status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {notice}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit Enquiry"}
      </button>
    </form>
  );
}
