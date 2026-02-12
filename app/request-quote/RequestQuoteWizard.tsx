"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import Section from "@/app/components/Section";
import {
  ADD_ON_OPTIONS,
  BRAND_ACCENTS,
  CITY_OPTIONS,
  type LeadBrand,
  getPlans,
  getQuantityLabel,
  getStageTwoOptions
} from "@/lib/quote-catalog";

type WizardState = {
  brand: LeadBrand | "";
  otherBrand: string;
  category: string;
  plan: string;
  usersSeats: string;
  endpoints: string;
  servers: string;
  ciscoUsers: string;
  ciscoSites: string;
  budgetRange: string;
  addons: string[];
  city: string;
  sourcePage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  pagePath: string;
  referrer: string;
  timeline: string;
  contactName: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
};

const initialState: WizardState = {
  brand: "",
  otherBrand: "",
  category: "",
  plan: "",
  usersSeats: "",
  endpoints: "",
  servers: "",
  ciscoUsers: "",
  ciscoSites: "",
  budgetRange: "",
  addons: [],
  city: "",
  sourcePage: "/request-quote",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  pagePath: "/request-quote",
  referrer: "",
  timeline: "This Week",
  contactName: "",
  company: "",
  email: "",
  phone: "",
  notes: ""
};

const steps = ["Brand", "Category", "Plan", "Quantity", "Add-ons", "Contact"] as const;

function normalizeBrand(input: string | null): Pick<WizardState, "brand" | "otherBrand"> {
  const value = (input ?? "").trim();
  if (!value) {
    return { brand: "", otherBrand: "" };
  }

  const lower = value.toLowerCase();
  if (lower === "microsoft") {
    return { brand: "Microsoft", otherBrand: "" };
  }
  if (lower === "seqrite") {
    return { brand: "Seqrite", otherBrand: "" };
  }
  if (lower === "cisco") {
    return { brand: "Cisco", otherBrand: "" };
  }

  return { brand: "Other", otherBrand: value };
}

function toInt(value: string) {
  const next = Number.parseInt(value, 10);
  return Number.isFinite(next) && next > 0 ? next : 0;
}

export default function RequestQuoteWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [state, setState] = useState<WizardState>(() => {
    const params =
      typeof window === "undefined"
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search);

    const prefill = normalizeBrand(params.get("brand"));

    return {
      ...initialState,
      ...prefill,
      category: params.get("category") ?? params.get("delivery") ?? "",
      plan: params.get("plan") ?? params.get("tier") ?? "",
      city: params.get("city") ?? "",
      sourcePage: params.get("source") ?? "/request-quote",
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      pagePath:
        typeof window === "undefined" ? "/request-quote" : `${window.location.pathname}${window.location.search}`,
      referrer: typeof window === "undefined" ? "" : document.referrer
    };
  });

  const accent = state.brand ? BRAND_ACCENTS[state.brand] : "var(--color-primary)";
  const stageTwoOptions = state.brand ? getStageTwoOptions(state.brand) : [];
  const planOptions = state.brand && state.category ? getPlans(state.brand, state.category) : [];
  const quantityLabel = state.brand && state.category ? getQuantityLabel(state.brand, state.category) : "Quantity";

  const summaryRows = useMemo(() => {
    const brandLabel = state.brand === "Other" && state.otherBrand ? state.otherBrand : state.brand || "-";
    const qtyText =
      state.brand === "Microsoft"
        ? state.usersSeats || "-"
        : state.brand === "Seqrite"
          ? `${state.endpoints || "-"} endpoints / ${state.servers || "0"} servers`
          : `${state.ciscoUsers || "-"} users / ${state.ciscoSites || "1"} site(s)`;

    return [
      ["Brand", brandLabel],
      ["Category", state.category || "-"],
      ["Plan", state.plan || "-"],
      ["Quantity", qtyText],
      ["Timeline", state.timeline || "-"],
      ["Budget", state.budgetRange || "-"],
      ["Add-ons", state.addons.length > 0 ? state.addons.join(", ") : "-"],
      ["City", state.city || "-"],
      ["Source", state.sourcePage || "/request-quote"]
    ] as const;
  }, [state]);

  function patch(values: Partial<WizardState>) {
    setState((current) => ({ ...current, ...values }));
  }

  function selectBrand(brand: LeadBrand) {
    patch({
      brand,
      category: "",
      plan: "",
      usersSeats: "",
      endpoints: "",
      servers: "",
      ciscoUsers: "",
      ciscoSites: "",
      budgetRange: ""
    });
  }

  function toggleAddon(addon: string) {
    const exists = state.addons.includes(addon);
    patch({ addons: exists ? state.addons.filter((item) => item !== addon) : [...state.addons, addon] });
  }

  function canContinue(currentStep: number) {
    if (currentStep === 1) {
      if (!state.brand) {
        return false;
      }
      if (state.brand === "Other") {
        return state.otherBrand.trim().length > 0;
      }
      return true;
    }

    if (currentStep === 2) {
      return Boolean(state.category);
    }

    if (currentStep === 3) {
      return Boolean(state.plan);
    }

    if (currentStep === 4) {
      if (state.brand === "Microsoft") {
        return toInt(state.usersSeats) > 0;
      }
      if (state.brand === "Seqrite") {
        return toInt(state.endpoints) > 0;
      }
      return toInt(state.ciscoUsers) > 0;
    }

    if (currentStep === 6) {
      return Boolean(state.contactName && state.company && state.email && state.phone && state.city);
    }

    return true;
  }

  function next() {
    if (!canContinue(step)) {
      setNotice("Please complete required fields to continue.");
      return;
    }

    setNotice("");
    setStep((current) => Math.min(current + 1, steps.length));
  }

  function back() {
    setNotice("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function submit() {
    if (!canContinue(6)) {
      setNotice("Please complete required fields.");
      return;
    }

    setStatus("loading");
    setNotice("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: state.brand,
          otherBrand: state.otherBrand,
          category: state.category,
          plan: state.plan,
          usersSeats: state.usersSeats,
          endpoints: state.endpoints,
          servers: state.servers,
          ciscoUsers: state.ciscoUsers,
          ciscoSites: state.ciscoSites,
          budgetRange: state.budgetRange,
          addons: state.addons,
          city: state.city,
          source: state.sourcePage,
          sourcePage: state.sourcePage,
          utmSource: state.utmSource,
          utmMedium: state.utmMedium,
          utmCampaign: state.utmCampaign,
          pagePath: state.pagePath,
          referrer: state.referrer,
          timeline: state.timeline,
          notes: state.notes,
          contactName: state.contactName,
          company: state.company,
          email: state.email,
          phone: state.phone
        })
      });

      const data = await response.json();
      if (!data?.ok) {
        setStatus("error");
        setNotice(data?.message ?? "Unable to submit request.");
        return;
      }

      const qty =
        state.brand === "Microsoft"
          ? state.usersSeats
          : state.brand === "Seqrite"
            ? state.endpoints
            : state.ciscoUsers;

      const query = new URLSearchParams({
        leadId: data.leadId ?? "",
        brand: state.brand === "Other" ? state.otherBrand : state.brand,
        city: state.city,
        qty,
        category: state.category,
        plan: state.plan,
        timeline: state.timeline
      });

      router.push(`/thank-you?${query.toString()}`);
    } catch {
      setStatus("error");
      setNotice("Unable to submit request.");
    }
  }

  return (
    <Section tone="alt" className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-5xl">Request a Quote</h1>
          <p className="max-w-3xl text-sm md:text-base">
            Fast procurement intake for Microsoft, Seqrite and firewall/networking requirements.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/microsoft"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
            >
              View Microsoft Plans
            </Link>
            <Link
              href="/seqrite"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-primary)]"
            >
              View Seqrite Plans
            </Link>
          </div>
          <ul className="grid gap-2 text-sm md:grid-cols-3">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
              TCO-focused proposals
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
              Compliance-ready scope
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
              Renewal and SLA visibility
            </li>
          </ul>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="space-y-6 p-5 md:p-7">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                Step {step} of {steps.length}
              </p>
              <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">{steps[step - 1]}</h2>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-alt-bg)]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(step / steps.length) * 100}%`, background: accent }}
                />
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["Microsoft", "Seqrite", "Cisco", "Other"] as LeadBrand[]).map((brand) => {
                    const selected = state.brand === brand;
                    const label = brand === "Other" ? "Firewall Vendor / Other" : brand;
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => selectBrand(brand)}
                        className="rounded-2xl border px-4 py-4 text-left transition"
                        style={{
                          borderColor: selected ? BRAND_ACCENTS[brand] : "var(--color-border)",
                          boxShadow: selected ? `0 0 0 1px ${BRAND_ACCENTS[brand]}22` : "none"
                        }}
                      >
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
                      </button>
                    );
                  })}
                </div>
                {state.brand === "Other" ? (
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Brand name
                    <input
                      type="text"
                      value={state.otherBrand}
                      onChange={(event) => patch({ otherBrand: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {state.brand === "Cisco" || state.brand === "Other"
                    ? "Requirement Type"
                    : state.brand === "Seqrite"
                      ? "Deployment model"
                      : "Suite category"}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {stageTwoOptions.map((option) => {
                    const selected = option === state.category;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => patch({ category: option, plan: "" })}
                        className="rounded-2xl border px-4 py-4 text-left transition"
                        style={{
                          borderColor: selected ? accent : "var(--color-border)",
                          boxShadow: selected ? `0 0 0 1px ${accent}22` : "none"
                        }}
                      >
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{option}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {planOptions.map((option) => {
                  const selected = option === state.plan;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => patch({ plan: option })}
                      className="rounded-2xl border px-4 py-4 text-left transition"
                      style={{
                        borderColor: selected ? accent : "var(--color-border)",
                        boxShadow: selected ? `0 0 0 1px ${accent}22` : "none"
                      }}
                    >
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{option}</p>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {state.brand === "Microsoft" ? (
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                    {quantityLabel}
                    <input
                      type="number"
                      min="1"
                      value={state.usersSeats}
                      onChange={(event) => patch({ usersSeats: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                ) : null}

                {state.brand === "Seqrite" ? (
                  <>
                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                      Endpoints
                      <input
                        type="number"
                        min="1"
                        value={state.endpoints}
                        onChange={(event) => patch({ endpoints: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                      Servers (optional)
                      <input
                        type="number"
                        min="0"
                        value={state.servers}
                        onChange={(event) => patch({ servers: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                      />
                    </label>
                  </>
                ) : null}

                {state.brand === "Cisco" || state.brand === "Other" ? (
                  <>
                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                      Users
                      <input
                        type="number"
                        min="1"
                        value={state.ciscoUsers}
                        onChange={(event) => patch({ ciscoUsers: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                      Sites/Locations
                      <input
                        type="number"
                        min="1"
                        value={state.ciscoSites}
                        onChange={(event) => patch({ ciscoSites: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                      Budget range (optional)
                      <select
                        value={state.budgetRange}
                        onChange={(event) => patch({ budgetRange: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select range</option>
                        <option value="Below 2L">Below 2L</option>
                        <option value="2L to 5L">2L to 5L</option>
                        <option value="5L to 10L">5L to 10L</option>
                        <option value="10L+">10L+</option>
                      </select>
                    </label>
                  </>
                ) : null}
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Add-ons</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ADD_ON_OPTIONS.map((addon) => {
                    const checked = state.addons.includes(addon);
                    return (
                      <label
                        key={addon}
                        className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleAddon(addon)} className="h-4 w-4" />
                        {addon}
                      </label>
                    );
                  })}
                </div>
                <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                  Notes (optional)
                  <textarea
                    rows={4}
                    value={state.notes}
                    onChange={(event) => patch({ notes: event.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>
            ) : null}

            {step === 6 ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Contact name
                    <input
                      type="text"
                      value={state.contactName}
                      onChange={(event) => patch({ contactName: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Company
                    <input
                      type="text"
                      value={state.company}
                      onChange={(event) => patch({ company: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Business email
                    <input
                      type="email"
                      value={state.email}
                      onChange={(event) => patch({ email: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Phone (WhatsApp)
                    <input
                      type="tel"
                      value={state.phone}
                      onChange={(event) => patch({ phone: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                    City
                    <select
                      value={state.city}
                      onChange={(event) => patch({ city: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Select city</option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                    Preferred timeline
                    <select
                      value={state.timeline}
                      onChange={(event) => patch({ timeline: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                      <option value="Planned Window">Planned Window</option>
                    </select>
                  </label>
                </div>

                <Card className="space-y-3 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Summary</h3>
                  <dl className="grid grid-cols-[140px_1fr] gap-y-1 text-sm">
                    {summaryRows.map(([label, value]) => (
                      <div key={label} className="contents">
                        <dt className="font-medium text-[var(--color-text-primary)]">{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>

                <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm">
                  <p className="font-semibold text-[var(--color-text-primary)]">What happens next</p>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>We confirm your requirements and quantities.</li>
                    <li>We send a WhatsApp and email follow-up with proposal scope.</li>
                    <li>We align a call slot for commercial and deployment checkpoints.</li>
                  </ol>
                </div>

                <PartnerDisclaimer sourceLabel="OEM documentation" />

                <button
                  type="button"
                  onClick={submit}
                  disabled={status === "loading"}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white"
                  style={{ background: accent }}
                >
                  {status === "loading" ? "Submitting..." : "Submit Quote Request"}
                </button>
              </div>
            ) : null}

            {notice ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{notice}</p>
            ) : null}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step === 1 || status === "loading"}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-primary)] disabled:opacity-50"
              >
                Back
              </button>
              {step < steps.length ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white"
                  style={{ background: accent }}
                >
                  Continue
                </button>
              ) : null}
            </div>
          </Card>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="space-y-3 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Live summary</h3>
              <ul className="space-y-1 text-sm">
                {summaryRows.map(([label, value]) => (
                  <li key={label}>
                    <span className="font-medium text-[var(--color-text-primary)]">{label}:</span> {value}
                  </li>
                ))}
              </ul>
            </Card>
            <p className="text-xs">Commercial clarity: best price + compliance-ready proposal + renewal support.</p>
          </aside>
        </div>

        <PartnerDisclaimer sourceLabel="OEM documentation" />
      </div>
    </Section>
  );
}
