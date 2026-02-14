"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";
import Section from "@/app/components/Section";
import { BRAND_TILES } from "@/lib/brands-data";
import { SALES_EMAIL, SUPPORT_EMAIL, mailto } from "@/lib/contact";
import {
  BRAND_ACCENTS,
  CITY_OPTIONS,
  type LeadBrand,
  getDeploymentOptions,
  getPlans,
  getStageTwoOptions,
  isValidSelection,
  supportsServers
} from "@/lib/quote-catalog";

type WizardState = {
  brandName: string;
  leadBrand: LeadBrand | "";
  otherBrand: string;
  category: string;
  plan: string;
  deployment: string;
  usersSeats: string;
  endpoints: string;
  servers: string;
  userBand: string;
  siteBand: string;
  budgetRange: string;
  city: string;
  sourcePage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
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
  brandName: "",
  leadBrand: "",
  otherBrand: "",
  category: "",
  plan: "",
  deployment: "",
  usersSeats: "",
  endpoints: "",
  servers: "",
  userBand: "",
  siteBand: "",
  budgetRange: "",
  city: "",
  sourcePage: "/request-quote",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  pagePath: "/request-quote",
  referrer: "",
  timeline: "This Week",
  contactName: "",
  company: "",
  email: "",
  phone: "",
  notes: ""
};

const steps = ["Brand", "Product", "Requirement", "Contact"] as const;

const brandOptions = Array.from(new Set([...BRAND_TILES.map((brand) => brand.name), "Other"]))
  .sort((a, b) => a.localeCompare(b));

const userBandOptions = ["1-25", "26-100", "101-300", "300+"] as const;
const siteBandOptions = ["1", "2-5", "6-10", "10+"] as const;
const budgetRangeOptions = ["Under ₹1L", "₹1L-₹5L", "₹5L-₹15L", "₹15L+"] as const;

function toInt(value: string) {
  const next = Number.parseInt(value, 10);
  return Number.isFinite(next) && next > 0 ? next : 0;
}

function bandToQty(value: string) {
  const map: Record<string, number> = {
    "1": 1,
    "2-5": 5,
    "6-10": 10,
    "10+": 10,
    "1-25": 25,
    "26-100": 100,
    "101-300": 300,
    "300+": 300
  };

  return map[value] ?? 0;
}

function mapBrandNameToLeadBrand(brandName: string): LeadBrand {
  const lower = brandName.trim().toLowerCase();
  if (lower === "microsoft") {
    return "Microsoft";
  }
  if (lower === "seqrite") {
    return "Seqrite";
  }
  if (lower === "cisco") {
    return "Cisco";
  }
  return "Other";
}

function findCategoryByPlan(leadBrand: LeadBrand, plan: string) {
  const lookup = plan.trim().toLowerCase();
  if (!lookup) {
    return "";
  }

  const categories = getStageTwoOptions(leadBrand);
  const match = categories.find((category) =>
    getPlans(leadBrand, category).some((candidate) => candidate.toLowerCase() === lookup)
  );

  return match ?? "";
}

function normalizeSeqriteCategoryAndDeployment(category: string, deployment: string) {
  const categoryLower = category.trim().toLowerCase();
  const deploymentLower = deployment.trim().toLowerCase();

  if (categoryLower === "cloud") {
    return { category: "Endpoint Security", deployment: "Cloud" };
  }

  if (categoryLower === "on-prem" || categoryLower === "onprem") {
    return { category: "Endpoint Security", deployment: "On-Prem" };
  }

  if (categoryLower.includes("endpoint") && categoryLower.includes("cloud")) {
    return { category: "Endpoint Security", deployment: "Cloud" };
  }

  if (categoryLower.includes("endpoint") && categoryLower.includes("on-prem")) {
    return { category: "Endpoint Security", deployment: "On-Prem" };
  }

  if (deploymentLower === "on-prem" || deploymentLower === "onprem") {
    return { category: category || "Endpoint Security", deployment: "On-Prem" };
  }

  if (deploymentLower === "cloud") {
    return { category: category || "Endpoint Security", deployment: "Cloud" };
  }

  return { category, deployment };
}

function stepHeading(step: number, state: WizardState) {
  if (step === 2) {
    if (state.leadBrand === "Microsoft") {
      return "Choose Microsoft product";
    }
    if (state.leadBrand === "Seqrite") {
      return "Choose Seqrite product";
    }
    return "Requirement category";
  }

  if (step === 3) {
    if (state.leadBrand === "Microsoft") {
      return "Users / Seats";
    }
    if (state.leadBrand === "Seqrite") {
      return "Deployment and quantity";
    }
    return "Requirement details";
  }

  if (step === 4) {
    return "Contact details";
  }

  return "Choose brand";
}

export default function RequestQuoteWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [brandQuery, setBrandQuery] = useState("");

  const [state, setState] = useState<WizardState>(() => {
    const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
    const incomingBrand = (params.get("brand") ?? "").trim();
    const brandName = incomingBrand || "";
    const leadBrand = brandName ? mapBrandNameToLeadBrand(brandName) : "";

    const incomingCategory = params.get("category") ?? params.get("delivery") ?? "";
    const incomingPlan = params.get("product") ?? params.get("plan") ?? params.get("tier") ?? "";
    const incomingDeployment = params.get("deployment") ?? "";

    let category = incomingCategory;
    let plan = incomingPlan;
    let deployment = incomingDeployment;

    if (leadBrand === "Seqrite") {
      const normalized = normalizeSeqriteCategoryAndDeployment(category, deployment);
      category = normalized.category;
      deployment = normalized.deployment;
    }

    if ((leadBrand === "Microsoft" || leadBrand === "Seqrite") && plan && !category) {
      category = findCategoryByPlan(leadBrand, plan);
    }

    if ((leadBrand === "Cisco" || leadBrand === "Other") && category && !plan) {
      plan = getPlans(leadBrand, category)[0] ?? "";
    }

    if (leadBrand && category && plan && !isValidSelection(leadBrand, category, plan, deployment)) {
      category = "";
      plan = "";
      deployment = "";
    }

    return {
      ...initialState,
      brandName,
      leadBrand,
      otherBrand: leadBrand === "Other" ? brandName : "",
      category,
      plan,
      deployment,
      city: params.get("city") ?? "",
      sourcePage: params.get("source") ?? "/request-quote",
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      utmContent: params.get("utm_content") ?? "",
      utmTerm: params.get("utm_term") ?? "",
      pagePath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/request-quote",
      referrer: typeof window !== "undefined" ? document.referrer : ""
    };
  });

  const accent = state.leadBrand ? BRAND_ACCENTS[state.leadBrand] : "var(--color-primary)";
  const categoryOptions = state.leadBrand ? getStageTwoOptions(state.leadBrand) : [];
  const planOptions = state.leadBrand && state.category ? getPlans(state.leadBrand, state.category) : [];
  const deploymentOptions = state.leadBrand && state.category ? getDeploymentOptions(state.leadBrand, state.category) : [];
  const showServers = state.leadBrand === "Seqrite" && supportsServers("Seqrite", state.category, state.deployment);

  const filteredBrands = useMemo(() => {
    const keyword = brandQuery.trim().toLowerCase();
    if (!keyword) {
      return brandOptions;
    }
    return brandOptions.filter((brand) => brand.toLowerCase().includes(keyword));
  }, [brandQuery]);

  const summaryRows = useMemo(() => {
    const quantityText =
      state.leadBrand === "Microsoft"
        ? `${state.usersSeats || "-"} users / seats`
        : state.leadBrand === "Seqrite"
          ? `${state.endpoints || "-"} endpoints${showServers && state.servers ? `, ${state.servers} servers` : ""}`
          : `${state.userBand || "-"} users, ${state.siteBand || "-"} sites`;
    const quantityLabel =
      state.leadBrand === "Microsoft"
        ? "Users / Seats"
        : state.leadBrand === "Seqrite"
          ? "Endpoints"
          : "Approx users / sites";

    const rows: Array<[string, string]> = [
      ["Brand", state.brandName || "-"],
      ["Product", state.category || "-"],
      ["Plan", state.plan || "-"],
      [quantityLabel, quantityText],
      ["City", state.city || "-"],
      ["Timeline", state.timeline || "-"]
    ];

    if (state.leadBrand === "Seqrite" && state.deployment) {
      rows.splice(3, 0, ["Deployment", state.deployment]);
    }

    if ((state.leadBrand === "Cisco" || state.leadBrand === "Other") && state.budgetRange) {
      rows.splice(rows.length - 2, 0, ["Budget", state.budgetRange]);
    }

    return rows;
  }, [showServers, state]);

  function patch(values: Partial<WizardState>) {
    setState((current) => ({ ...current, ...values }));
  }

  function selectBrand(brandName: string) {
    const leadBrand = mapBrandNameToLeadBrand(brandName);
    patch({
      brandName,
      leadBrand,
      otherBrand: leadBrand === "Other" ? brandName : "",
      category: "",
      plan: "",
      deployment: "",
      usersSeats: "",
      endpoints: "",
      servers: "",
      userBand: "",
      siteBand: "",
      budgetRange: ""
    });
  }

  function canContinue(currentStep: number) {
    if (currentStep === 1) {
      return Boolean(state.brandName && state.leadBrand);
    }

    if (currentStep === 2) {
      if (!state.leadBrand || !state.category) {
        return false;
      }

      if (state.leadBrand === "Cisco" || state.leadBrand === "Other") {
        return true;
      }

      if (!state.plan) {
        return false;
      }

      if (deploymentOptions.length > 0 && !state.deployment) {
        return false;
      }

      return isValidSelection(state.leadBrand, state.category, state.plan, state.deployment);
    }

    if (currentStep === 3) {
      if (state.leadBrand === "Microsoft") {
        return toInt(state.usersSeats) > 0;
      }

      if (state.leadBrand === "Seqrite") {
        return toInt(state.endpoints) > 0;
      }

      return Boolean(state.userBand && state.siteBand);
    }

    if (currentStep === 4) {
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
    if (!canContinue(4)) {
      setNotice("Please complete required fields.");
      return;
    }

    setStatus("loading");
    setNotice("");

    const ciscoUsers = state.leadBrand === "Cisco" || state.leadBrand === "Other" ? bandToQty(state.userBand) : 0;
    const ciscoSites = state.leadBrand === "Cisco" || state.leadBrand === "Other" ? bandToQty(state.siteBand) : 0;

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: state.leadBrand,
          otherBrand: state.leadBrand === "Other" ? state.brandName : "",
          category: state.category,
          plan: state.plan,
          deployment: state.leadBrand === "Seqrite" ? state.deployment : "",
          usersSeats: state.leadBrand === "Microsoft" ? state.usersSeats : "",
          endpoints: state.leadBrand === "Seqrite" ? state.endpoints : "",
          servers: state.leadBrand === "Seqrite" && showServers ? state.servers : "",
          ciscoUsers,
          ciscoSites,
          budgetRange: state.leadBrand === "Cisco" || state.leadBrand === "Other" ? state.budgetRange : "",
          city: state.city,
          source: state.sourcePage,
          sourcePage: state.sourcePage,
          utmSource: state.utmSource,
          utmMedium: state.utmMedium,
          utmCampaign: state.utmCampaign,
          utmContent: state.utmContent,
          utmTerm: state.utmTerm,
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
        state.leadBrand === "Microsoft"
          ? state.usersSeats
          : state.leadBrand === "Seqrite"
            ? state.endpoints
            : state.userBand;

      const query = new URLSearchParams({
        leadId: data.leadId ?? "",
        brand: state.brandName,
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
          <p className="max-w-3xl text-sm md:text-base">Procurement-ready RFQ in four quick steps. We only ask fields required for a compliance-ready proposal.</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            For urgent help:{" "}
            <a href={mailto(SALES_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
              {SALES_EMAIL}
            </a>{" "}
            • Support:{" "}
            <a href={mailto(SUPPORT_EMAIL)} className="font-semibold text-[var(--color-primary)] hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/brands"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
            >
              Browse Brands
            </Link>
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-primary)]"
            >
              Search
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="space-y-6 p-5 md:p-7">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                Step {step} of {steps.length}
              </p>
              <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">{stepHeading(step, state)}</h2>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-alt-bg)]">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(step / steps.length) * 100}%`, background: accent }} />
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                  Search brand
                </label>
                <div className="relative z-30">
                  <input
                    type="text"
                    value={brandQuery}
                    onChange={(event) => setBrandQuery(event.target.value)}
                    placeholder="Type Microsoft, Seqrite, Cisco, Fortinet..."
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                  />
                  <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.32)]">
                    {filteredBrands.map((brandName, index) => {
                      const selected = state.brandName === brandName;
                      return (
                        <button
                          key={`${brandName}-${index}`}
                          type="button"
                          onClick={() => selectBrand(brandName)}
                          className="w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition"
                          style={{
                            borderColor: selected ? accent : "var(--color-border)",
                            boxShadow: selected ? `0 0 0 1px ${accent}22` : "none"
                          }}
                        >
                          {brandName}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-72" aria-hidden />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Why we ask this: brand selection shows only valid fields and plans.</p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <p className="text-xs text-[var(--color-text-secondary)]">Why we ask this: this drives the exact commercial proposal and compliance scope.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoryOptions.map((option, index) => {
                    const selected = option === state.category;
                    const defaultPlan =
                      state.leadBrand === "Cisco" || state.leadBrand === "Other"
                        ? getPlans(state.leadBrand, option)[0] ?? ""
                        : "";
                    return (
                      <button
                        key={`${option}-${index}`}
                        type="button"
                        onClick={() => patch({ category: option, plan: defaultPlan, deployment: "" })}
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

                {deploymentOptions.length > 0 ? (
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Deployment
                    <select
                      value={state.deployment}
                      onChange={(event) => patch({ deployment: event.target.value, plan: "" })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    >
                      <option value="">Select deployment</option>
                      {deploymentOptions.map((option, index) => (
                        <option key={`${option}-${index}`} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {state.category && (state.leadBrand === "Microsoft" || state.leadBrand === "Seqrite") ? (
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    {state.leadBrand === "Microsoft" ? "Plan" : state.leadBrand === "Seqrite" ? "Product plan" : "Requirement detail"}
                    <select
                      value={state.plan}
                      onChange={(event) => patch({ plan: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                      disabled={deploymentOptions.length > 0 && !state.deployment}
                    >
                      <option value="">Select option</option>
                      {planOptions.map((plan, index) => (
                        <option key={`${plan}-${index}`} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <p className="text-xs text-[var(--color-text-secondary)]">Why we ask this: these inputs help produce a compliance-ready quote. Response in 15 minutes (business hours).</p>

                {state.leadBrand === "Microsoft" ? (
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Users / Seats
                    <input
                      type="number"
                      min="1"
                      value={state.usersSeats}
                      onChange={(event) => patch({ usersSeats: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    />
                  </label>
                ) : null}

                {state.leadBrand === "Seqrite" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                      Endpoints
                      <input
                        type="number"
                        min="1"
                        value={state.endpoints}
                        onChange={(event) => patch({ endpoints: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                      />
                    </label>
                    {showServers ? (
                      <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                        Servers (optional)
                        <input
                          type="number"
                          min="0"
                          value={state.servers}
                          onChange={(event) => patch({ servers: event.target.value })}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                        />
                      </label>
                    ) : null}
                  </div>
                ) : null}

                {state.leadBrand === "Cisco" || state.leadBrand === "Other" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                      No. of sites
                      <select
                        value={state.siteBand}
                        onChange={(event) => patch({ siteBand: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                      >
                        <option value="">Select sites</option>
                        {siteBandOptions.map((option, index) => (
                          <option key={`${option}-${index}`} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                      Approx users
                      <select
                        value={state.userBand}
                        onChange={(event) => patch({ userBand: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                      >
                        <option value="">Select users</option>
                        {userBandOptions.map((option, index) => (
                          <option key={`${option}-${index}`} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                      Budget range (optional)
                      <select
                        value={state.budgetRange}
                        onChange={(event) => patch({ budgetRange: event.target.value })}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                      >
                        <option value="">Select budget range</option>
                        {budgetRangeOptions.map((option, index) => (
                          <option key={`${option}-${index}`} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-5">
                <p className="text-xs text-[var(--color-text-secondary)]">Why we ask this: we use this to send proposal options and assign the right follow-up owner.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Contact name
                    <input
                      type="text"
                      value={state.contactName}
                      onChange={(event) => patch({ contactName: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Company
                    <input
                      type="text"
                      value={state.company}
                      onChange={(event) => patch({ company: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Business email
                    <input
                      type="email"
                      value={state.email}
                      onChange={(event) => patch({ email: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Phone (WhatsApp)
                    <input
                      type="tel"
                      value={state.phone}
                      onChange={(event) => patch({ phone: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                    City
                    <select
                      value={state.city}
                      onChange={(event) => patch({ city: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    >
                      <option value="">Select city</option>
                      {CITY_OPTIONS.map((city, index) => (
                        <option key={`${city}-${index}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                    Timeline
                    <select
                      value={state.timeline}
                      onChange={(event) => patch({ timeline: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                      <option value="Planned Window">Planned Window</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                    Notes (optional)
                    <textarea
                      rows={4}
                      value={state.notes}
                      onChange={(event) => patch({ notes: event.target.value })}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {notice ? (
              <p className={`rounded-xl border px-3 py-2 text-sm ${status === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                {notice}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={back}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold"
                disabled={step === 1 || status === "loading"}
              >
                Back
              </button>
              {step < steps.length ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Submitting..." : "Submit RFQ"}
                </button>
              )}
            </div>
          </Card>

          <Card className="h-fit space-y-3 p-5 lg:sticky lg:top-24">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Summary</h3>
            <dl className="space-y-2 text-sm">
              {summaryRows.map(([label, value], index) => (
                <div key={`${label}-${index}`} className="grid grid-cols-[110px_1fr] gap-2">
                  <dt className="font-medium text-[var(--color-text-primary)]">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <PartnerDisclaimer className="mt-4" />
          </Card>
        </div>
      </div>
    </Section>
  );
}
