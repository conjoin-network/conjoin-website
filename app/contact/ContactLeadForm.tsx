"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { pushDataLayerEvent, trackAdsConversion } from "@/lib/ads";
import { event as trackGaEvent } from "@/lib/ga";

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

export default function ContactLeadForm() {
  const pathname = usePathname() ?? "/contact";
  const [state, setState] = useState<FormState>(initialState);
  // capture utm/gclid from query string on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const updates: Partial<FormState> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"].forEach((k) => {
      const v = params.get(k);
      if (v) (updates as any)[k] = v;
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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setNotice("");

    try {
      // Submit to canonical /api/leads endpoint
      const response = await fetch("/api/leads", {
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
          utm_source: (state as any).utm_source,
          utm_medium: (state as any).utm_medium,
          utm_campaign: (state as any).utm_campaign,
          utm_term: (state as any).utm_term,
          utm_content: (state as any).utm_content,
          gclid: (state as any).gclid,
          source: "/contact",
          pageUrl: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/contact",
          referrer: typeof document !== "undefined" ? document.referrer : ""
        })
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string };
      const isSuccessStatus = response.ok; // accepts 200–299 (incl 201)
      const isSuccess = isSuccessStatus && payload.ok !== false;

      if (!isSuccess) {
        setStatus("error");
        setNotice(payload.error || payload.message || `Unable to submit request (HTTP ${response.status}).`);
        return;
      }

      setStatus("success");
      setNotice("");
      setNotice(payload.message || "Request received. We will contact you shortly.");
      trackGaEvent("generate_lead", {
        form_name: "contact_lead_form",
        lead_type: "contact",
        city: state.city || undefined,
        value: 1,
        currency: "INR",
        method: "form",
        page_path: pathname
      });
      trackAdsConversion("lead_submit", {
        value: 1,
        method: "form",
        page_path: pathname
      });
      pushDataLayerEvent("lead_submit_success", {
        form_name: "contact_lead_form",
        lead_type: "contact",
        page_path: pathname,
        city: state.city || undefined,
        value: 1,
        currency: "INR"
      });
      setState(initialState);
    } catch {
      setStatus("error");
      setNotice("Service temporarily unavailable. Please try again shortly.");
    }
  }

  return (
    <form onSubmit={submit} className="surface-card space-y-4 p-5 md:p-6">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Send Enquiry</h2>

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
            required
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
        <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
          City
          <input
            value={state.city}
            onChange={(event) => patch({ city: event.target.value })}
            className={fieldClass}
          />
        </label>
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
      </div>

      <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
        Notes
        <textarea
          rows={4}
          value={state.message}
          onChange={(event) => patch({ message: event.target.value })}
          className={fieldClass}
        />
      </label>

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
