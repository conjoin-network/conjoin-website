"use client";

import { useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  appendAttributionToQuery,
  resolveLeadContext
} from "@/lib/lead-flow";

const serviceOptions = ["Microsoft 365", "Seqrite", "Networking", "Surveillance", "Other"] as const;
const cityOptions = ["Chandigarh", "Panchkula", "Mohali", "Punjab", "Haryana", "Himachal Pradesh", "Uttarakhand", "J&K", "Other"] as const;

type MicroLeadFormProps = {
  sourceContext: string;
  presetService?: string;
  planName?: string;
  usersLabel?: string;
  title?: string;
  showServiceSelect?: boolean;
  showCity?: boolean;
  showWhatsAppAfterSuccess?: boolean;
};

function parseApiResponse(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as {
    ok?: boolean;
    queued?: boolean;
    error?: string;
    message?: string;
    leadId?: string;
    rfqId?: string;
  };
}

function getAttributionParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_term: params.get("utm_term") ?? undefined,
    utm_content: params.get("utm_content") ?? undefined,
    gclid: params.get("gclid") ?? undefined,
    gbraid: params.get("gbraid") ?? undefined,
    wbraid: params.get("wbraid") ?? undefined
  };
}

export default function MicroLeadForm(props: MicroLeadFormProps) {
  const {
    sourceContext,
    presetService,
    planName,
    usersLabel = "Users / Devices",
    title = "Request Quote",
    showServiceSelect = true,
    showCity = true
  } = props;
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [step, setStep] = useState<1 | 2>(1);
  const [service, setService] = useState(presetService || "Microsoft 365");
  const [users, setUsers] = useState("25");
  const [city, setCity] = useState("Chandigarh");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");

  const serviceValue = presetService || service;
  const quantityValue = Number.parseInt(users, 10);
  const scopeChips = useMemo(() => {
    const chips = ["GST invoice + compliance-ready quote", "Typical rollout: 24-72 hrs"];
    if (serviceValue === "Microsoft 365") {
      chips.push("License activation + onboarding support");
    } else if (serviceValue === "Seqrite") {
      chips.push("Endpoint policy + renewal governance");
    } else {
      chips.push("Scope estimate aligned to requirement");
    }
    return chips;
  }, [serviceValue]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }

    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    if (!normalizedName || !normalizedPhone || !quantityValue) {
      setStatus("error");
      setNotice("Please complete Name, Phone, and quantity.");
      return;
    }

    setStatus("submitting");
    setNotice("");

    const pagePath = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : pathname;
    const attribution = typeof window !== "undefined" ? getAttributionParams(window.location.search) : {};
    const requirement = planName ? `${serviceValue} - ${planName}` : serviceValue;
    const context = resolveLeadContext({
      pathname,
      sourceContext,
      requirement,
      category: serviceValue
    });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          phone: normalizedPhone,
          email: email.trim() || undefined,
          requirement,
          usersDevices: quantityValue,
          city: showCity ? city : undefined,
          source: sourceContext,
          pageUrl: pagePath,
          landing_page: pagePath,
          referrer: typeof document !== "undefined" ? document.referrer : "",
          notes: [
            notes.trim(),
            planName ? `plan_name:${planName}` : "",
            `users_count:${quantityValue}`,
            `service:${serviceValue}`
          ]
            .filter(Boolean)
            .join(" | "),
          ...attribution
        })
      });

      const payload = parseApiResponse(await response.json().catch(() => ({})));
      if (!response.ok) {
        setStatus("error");
        setNotice(payload.error || payload.message || `Unable to submit request (HTTP ${response.status}).`);
        return;
      }

      const leadId = payload.leadId || payload.rfqId;
      const isSuccess = response.ok && payload.ok !== false;
      if (!isSuccess) {
        setStatus("error");
        setNotice(payload.error || payload.message || `Unable to submit request (HTTP ${response.status}).`);
        return;
      }

      setStatus("success");
      setNotice("Thank you. Our team will contact you shortly.");
      const query = new URLSearchParams({
        formSource: sourceContext,
        landingPath: pagePath,
        brand: context.brand,
        city: showCity ? city : "Chandigarh",
        category: context.category,
        requirement
      });
      if (leadId) {
        query.set("leadId", leadId);
      }
      appendAttributionToQuery(query, attribution);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "conjoin_submit_success",
          JSON.stringify({
            formSource: sourceContext,
            leadId: leadId || null,
            timestamp: Date.now()
          })
        );
      }
      router.replace(`/thank-you?${query.toString()}`);
    } catch (error) {
      setStatus("error");
      setNotice(
        error instanceof Error && error.message
          ? `Unable to submit request: ${error.message}`
          : "Service temporarily unavailable. Please try again shortly."
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-card space-y-4 p-5 md:p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] md:text-xl">{title}</h2>

      {step === 1 ? (
        <div className="space-y-3">
          {showServiceSelect ? (
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              Service
              <select
                value={serviceValue}
                onChange={(event) => setService(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
              >
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              {usersLabel}
              <input
                type="number"
                min={1}
                value={users}
                onChange={(event) => setUsers(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
              />
            </label>

            {showCity ? (
              <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
                City
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
                >
                  {cityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {scopeChips.map((chip) => (
              <span key={chip} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-secondary)]">
                {chip}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
          >
            Get Instant Estimate
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              Name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
                autoFocus
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              Phone
              <input
                required
                type="tel"
                minLength={10}
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
            Email (optional)
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
            Notes (optional)
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-primary)]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting..." : "Request Quote"}
            </button>
          </div>
        </div>
      )}

      {notice ? (
        <p
          className={`rounded-xl border px-3 py-2 text-sm ${
            status === "success"
              ? "border-emerald-300/70 bg-emerald-600 text-white"
              : "border-rose-300/70 bg-rose-700/20 text-rose-200"
          }`}
        >
          {notice}
        </p>
      ) : null}
    </form>
  );
}
