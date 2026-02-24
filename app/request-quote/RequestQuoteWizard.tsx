"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import Section from "@/app/components/Section";
import { trackAdsConversionOncePerSession } from "@/lib/ads";
import { SALES_EMAIL, SUPPORT_EMAIL, mailto } from "@/lib/contact";
import { appendAttributionToQuery, resolveLeadContext } from "@/lib/lead-flow";
import {
  BRAND_ACCENTS,
  CITY_OPTIONS,
  type LeadBrand,
  getCategoryForPlan,
  getDeploymentOptions,
  getProductOptions,
  getQuantityLabel,
  supportsServers
} from "@/lib/quote-catalog";
import type { DeploymentType } from "@/lib/product-registry";

type WizardState = {
  brand: LeadBrand | "";
  brandLabel: string;
  category: string;
  product: string;
  quantity: string;
  servers: string;
  deployment: DeploymentType | "";
  city: string;
  region: string;
  timeline: string;
  contactName: string;
  company: string;
  email: string;
  phone: string;
  customerType: "Enterprise" | "Partner" | "Govt-PSU" | "SMB";
  tenderGemRef: string;
  documentationRequired: boolean;
  partnerEndCustomer: string;
  backToBackBilling: boolean;
  whatsappOptIn: boolean;
  notes: string;
  website: string;
  sourcePage: string;
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  gclid: string;
  gbraid: string;
  wbraid: string;
  pagePath: string;
  referrer: string;
};

const steps = ["Brand", "Product", "Users / Devices", "Deployment", "Contact"] as const;
const timelineOptions = ["Today", "This Week", "This Month", "Planned Window"] as const;
const customerTypeOptions: Array<WizardState["customerType"]> = ["Enterprise", "Partner", "Govt-PSU", "SMB"];
const REGION_OPTIONS = [
  "Chandigarh",
  "Panchkula",
  "Mohali",
  "Punjab",
  "Haryana",
  "Himachal Pradesh",
  "Uttarakhand",
  "J&K"
] as const;
const DRAFT_KEY = "conjoin_rfq_draft_v2";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const primaryBrands: LeadBrand[] = ["Microsoft", "Seqrite", "Cisco", "Other"];
const quickSelectBrands: LeadBrand[] = ["Microsoft", "Seqrite"];
const brandSearchOptions: Array<{ label: string; brand: LeadBrand; note: string }> = [
  { label: "Microsoft", brand: "Microsoft", note: "Microsoft 365 licensing and migration" },
  { label: "Seqrite", brand: "Seqrite", note: "Endpoint and EDR/XDR security stack" },
  { label: "Cisco", brand: "Cisco", note: "Networking, security and collaboration solutions" },
  { label: "Other OEM", brand: "Other", note: "Generic procurement scope for additional brands" }
];
const formFieldClass =
  "form-field-surface w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/35";
const formTextareaClass = `${formFieldClass} min-h-28`;

function toNumber(value: string) {
  const next = Number.parseInt(value, 10);
  return Number.isFinite(next) && next > 0 ? next : 0;
}

function normalizeBrand(raw: string) {
  const value = raw.trim().toLowerCase();
  if (!value) {
    return { brand: "" as const, brandLabel: "" };
  }
  if (value.includes("microsoft")) {
    return { brand: "Microsoft" as const, brandLabel: "Microsoft" };
  }
  if (value.includes("seqrite")) {
    return { brand: "Seqrite" as const, brandLabel: "Seqrite" };
  }
  if (value.includes("cisco")) {
    return { brand: "Cisco" as const, brandLabel: "Cisco" };
  }
  return { brand: "Other" as const, brandLabel: raw.trim() };
}

function resolveBrandFromQuery(raw: string) {
  const query = raw.trim();
  if (!query) {
    return null;
  }
  const queryLower = query.toLowerCase();

  const fromCatalog = brandSearchOptions.find(
    (option) =>
      option.label.toLowerCase() === queryLower ||
      option.brand.toLowerCase() === queryLower ||
      option.label.toLowerCase().startsWith(queryLower)
  );
  if (fromCatalog) {
    return {
      brand: fromCatalog.brand,
      label: fromCatalog.brand === "Other" ? fromCatalog.label : fromCatalog.brand
    };
  }

  const normalized = normalizeBrand(query);
  if (!normalized.brand) {
    return null;
  }

  return {
    brand: normalized.brand,
    label: normalized.brand === "Other" ? normalized.brandLabel : normalized.brand
  };
}

function headingForStep(step: number, brand: LeadBrand | "") {
  if (step === 1) {
    return "Choose brand";
  }
  if (step === 2) {
    if (brand === "Microsoft") {
      return "Choose Microsoft product";
    }
    if (brand === "Seqrite") {
      return "Choose Seqrite product";
    }
    return "Choose product";
  }
  if (step === 3) {
    return "Users / Devices";
  }
  if (step === 4) {
    return "Deployment type";
  }
  return "Contact details";
}

function validationMessageForStep(currentStep: number, brand: LeadBrand | "") {
  if (currentStep === 1) {
    return "Select a brand to continue. Use the Microsoft or Seqrite quick select for fastest flow.";
  }

  if (currentStep === 2) {
    if (brand === "Microsoft") {
      return "Select a Microsoft product before continuing.";
    }
    if (brand === "Seqrite") {
      return "Select a Seqrite product before continuing.";
    }
    return "Select a product before continuing.";
  }

  if (currentStep === 3) {
    return "Enter a valid quantity to continue.";
  }

  if (currentStep === 4) {
    return "Choose a deployment type to continue.";
  }

  if (currentStep === 5) {
    return "Enter name, phone or email, and city before submit.";
  }

  return "Please complete required fields to continue.";
}

export default function RequestQuoteWizard() {
  const router = useRouter();
  const formStartTracked = useRef(false);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [brandQuery, setBrandQuery] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const params = new URLSearchParams(window.location.search);
    return normalizeBrand(params.get("brand") ?? "").brandLabel || "";
  });
  const [brandListOpen, setBrandListOpen] = useState(false);
  const [activeBrandIndex, setActiveBrandIndex] = useState(0);
  const brandInputRef = useRef<HTMLInputElement | null>(null);

  const [state, setState] = useState<WizardState>(() => {
    const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
    const legacySource = (params.get("source") ?? "").trim();
    const sourcePath =
      (params.get("landingPath") ?? "").trim() ||
      (legacySource.startsWith("/") ? legacySource : "") ||
      (typeof document !== "undefined"
        ? (() => {
            try {
              const parsed = new URL(document.referrer);
              return parsed.pathname || "/";
            } catch {
              return "/";
            }
          })()
        : "/");
    const formSource =
      (params.get("formSource") ?? "").trim() ||
      (legacySource && !legacySource.startsWith("/") ? legacySource : "") ||
      "request-quote";

    const incomingBrand = normalizeBrand(params.get("brand") ?? "");
    const incomingProduct = (params.get("product") ?? params.get("plan") ?? "").trim();
    const incomingCategory = (params.get("category") ?? "").trim();
    const inferredContext = resolveLeadContext({
      pathname: sourcePath,
      sourceContext: formSource,
      brand: incomingBrand.brandLabel,
      category: incomingCategory,
      requirement: incomingProduct
    });
    const resolvedBrand = incomingBrand.brand || inferredContext.brand;
    const resolvedBrandLabel = incomingBrand.brandLabel || inferredContext.brand;
    let category =
      incomingCategory ||
      (resolvedBrand ? getCategoryForPlan(resolvedBrand, incomingProduct) : "") ||
      inferredContext.category;
    let product = incomingProduct;

    if (resolvedBrand && category && product) {
      const exists = getProductOptions(resolvedBrand).some(
        (item) => item.category === category && item.product === product
      );
      if (!exists) {
        category = "";
        product = "";
      }
    }

    const defaultState: WizardState = {
      brand: resolvedBrand,
      brandLabel: resolvedBrandLabel,
      category,
      product,
      quantity: "",
      servers: "",
      deployment: (params.get("deployment") ?? "") as DeploymentType | "",
      city: (params.get("city") ?? "").trim() || "Chandigarh",
      region: (params.get("region") ?? params.get("state") ?? "").trim(),
      timeline: "This Week",
      contactName: "",
      company: "",
      email: "",
      phone: "",
      customerType: "Enterprise",
      tenderGemRef: "",
      documentationRequired: false,
      partnerEndCustomer: "",
      backToBackBilling: false,
      whatsappOptIn: true,
      notes: "",
      website: "",
      sourcePage: sourcePath,
      source: formSource,
      utmSource: (params.get("utm_source") ?? "").trim(),
      utmMedium: (params.get("utm_medium") ?? "").trim(),
      utmCampaign: (params.get("utm_campaign") ?? "").trim(),
      utmContent: (params.get("utm_content") ?? "").trim(),
      utmTerm: (params.get("utm_term") ?? "").trim(),
      gclid: (params.get("gclid") ?? "").trim(),
      gbraid: (params.get("gbraid") ?? "").trim(),
      wbraid: (params.get("wbraid") ?? "").trim(),
      pagePath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/request-quote",
      referrer: typeof window !== "undefined" ? document.referrer : ""
    };

    if (typeof window === "undefined") {
      return defaultState;
    }

    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        return defaultState;
      }
      const parsed = JSON.parse(raw) as { savedAt?: number; state?: Partial<WizardState>; step?: number };
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > DRAFT_TTL_MS || !parsed.state) {
        window.localStorage.removeItem(DRAFT_KEY);
        return defaultState;
      }

      return {
        ...defaultState,
        ...parsed.state,
        sourcePage: defaultState.sourcePage,
        source: defaultState.source,
        pagePath: defaultState.pagePath,
        referrer: defaultState.referrer
      };
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload = JSON.stringify({
      savedAt: Date.now(),
      step,
      state
    });
    window.localStorage.setItem(DRAFT_KEY, payload);
  }, [state, step]);

  const filteredBrandOptions = useMemo(() => {
    const query = brandQuery.trim().toLowerCase();
    if (!query) {
      return brandSearchOptions;
    }

    return brandSearchOptions.filter((option) => {
      const row = `${option.label} ${option.brand} ${option.note}`.toLowerCase();
      return row.includes(query);
    });
  }, [brandQuery]);

  const accent = state.brand ? BRAND_ACCENTS[state.brand] : "var(--color-primary)";

  const productOptions = useMemo(() => {
    if (!state.brand) {
      return [];
    }

    const all = getProductOptions(state.brand);
    const query = productQuery.trim().toLowerCase();
    if (!query) {
      return all;
    }

    return all.filter((item) => {
      const line = `${item.product} ${item.category} ${item.description}`.toLowerCase();
      return line.includes(query);
    });
  }, [state.brand, productQuery]);

  const groupedProducts = useMemo(() => {
    const map = new Map<string, typeof productOptions>();
    for (const option of productOptions) {
      const current = map.get(option.category) ?? [];
      map.set(option.category, [...current, option]);
    }
    return Array.from(map.entries());
  }, [productOptions]);

  const selectedProduct = useMemo(() => {
    if (!state.brand || !state.category || !state.product) {
      return null;
    }

    const list = getProductOptions(state.brand);
    return list.find((item) => item.category === state.category && item.product === state.product) ?? null;
  }, [state.brand, state.category, state.product]);

  const deploymentOptions = useMemo(() => {
    if (!state.brand || !state.category || !state.product) {
      return [] as DeploymentType[];
    }

    return getDeploymentOptions(state.brand, state.category, state.product);
  }, [state.brand, state.category, state.product]);

  const showServers = useMemo(() => {
    if (!state.brand || !state.category) {
      return false;
    }

    return supportsServers(state.brand, state.category, state.deployment, state.product);
  }, [state.brand, state.category, state.deployment, state.product]);

  const quantityLabel = state.brand
    ? getQuantityLabel(state.brand, state.category)
    : "Users / Devices";

  const summaryRows = useMemo(() => {
    const quantityText = state.quantity ? state.quantity : "-";
    const rows: Array<[string, string]> = [
      ["Brand", state.brandLabel || "-"],
      ["Category", state.category || "-"],
      ["Product", state.product || "-"],
      [quantityLabel, quantityText],
      ["Deployment", state.deployment || "-"],
      ["City", state.city || "-"],
      ["Region", state.region || "-"],
      ["Timeline", state.timeline || "-"]
    ];

    if (showServers) {
      rows.splice(4, 0, ["Servers", state.servers || "-"]);
    }

    return rows;
  }, [quantityLabel, showServers, state]);

  function patch(values: Partial<WizardState>) {
    if (status === "error") {
      setStatus("idle");
      setNotice("");
    }
    setState((current) => ({ ...current, ...values }));
  }

  function selectBrand(brand: LeadBrand, label?: string) {
    const nextLabel = brand === "Other" ? (label?.trim() || "Other OEM") : brand;
    patch({
      brand,
      brandLabel: nextLabel,
      category: "",
      product: "",
      quantity: "",
      servers: "",
      deployment: ""
    });
    setBrandQuery(nextLabel);
    setBrandListOpen(false);
    setActiveBrandIndex(0);
    setProductQuery("");
  }

  function selectProduct(category: string, product: string) {
    patch({
      category,
      product,
      deployment: ""
    });
  }

  function canContinue(currentStep: number) {
    if (currentStep === 1) {
      return Boolean(state.brand || resolveBrandFromQuery(brandQuery)?.brand);
    }

    if (currentStep === 2) {
      return Boolean(state.brand && state.category && state.product);
    }

    if (currentStep === 3) {
      return toNumber(state.quantity) > 0;
    }

    if (currentStep === 4) {
      return Boolean(state.deployment);
    }

    if (currentStep === 5) {
      return Boolean(state.contactName.trim()) && Boolean(state.phone.trim() || state.email.trim()) && Boolean(state.city.trim());
    }

    return true;
  }

  function next() {
    if (step === 1 && !state.brand) {
      const resolved = resolveBrandFromQuery(brandQuery);
      if (resolved?.brand) {
        selectBrand(resolved.brand, resolved.label);
      }
    }

    if (!canContinue(step)) {
      setNotice(validationMessageForStep(step, state.brand));
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
    if (!canContinue(5) || !state.brand) {
      setNotice(validationMessageForStep(5, state.brand));
      return;
    }

    setStatus("loading");
    setNotice("");

    const quantity = toNumber(state.quantity);
    const normalizedCity = state.city.trim() || "Chandigarh";
    const normalizedRegion = state.region.trim();
    const normalizedCompany = state.company.trim();
    const normalizedEmail = state.email.trim();
    const requirement = [state.category.trim(), state.product.trim()].filter(Boolean).join(" - ") || state.category.trim() || "General requirement";
    const context = resolveLeadContext({
      pathname: state.pagePath,
      sourceContext: "request-quote",
      brand: state.brandLabel,
      category: state.category,
      requirement
    });
    const quoteNotes = [
      state.notes,
      state.product ? `Plan: ${state.product}` : "",
      state.deployment ? `Deployment: ${state.deployment}` : "",
      state.customerType ? `Customer Type: ${state.customerType}` : "",
      normalizedRegion ? `Region: ${normalizedRegion}` : "",
      state.tenderGemRef ? `Tender/GeM: ${state.tenderGemRef}` : "",
      state.documentationRequired ? "Documentation Required: Yes" : "",
      state.partnerEndCustomer ? `Partner End Customer: ${state.partnerEndCustomer}` : "",
      state.backToBackBilling ? "Back-to-back Billing: Yes" : ""
    ]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      name: state.contactName.trim() || "Website Lead",
      brand: context.brand,
      category: context.category,
      solutionType: state.product || state.category || undefined,
      requirement,
      usersDevices: quantity > 0 ? quantity : undefined,
      city: normalizedCity,
      source: state.source,
      pageUrl: state.sourcePage || state.pagePath,
      landing_page: state.sourcePage || state.pagePath,
      utm_source: state.utmSource,
      utm_medium: state.utmMedium,
      utm_campaign: state.utmCampaign,
      utm_content: state.utmContent,
      utm_term: state.utmTerm,
      gclid: state.gclid,
      gbraid: state.gbraid,
      wbraid: state.wbraid,
      referrer: state.referrer,
      timeline: state.timeline,
      notes: quoteNotes,
      website: state.website,
      company: normalizedCompany || undefined,
      email: normalizedEmail || undefined,
      phone: state.phone,
      businessType: state.customerType,
      device_type:
        typeof window !== "undefined" && /mobile|android|iphone|ipod/i.test(window.navigator.userAgent)
          ? "mobile"
          : typeof window !== "undefined" && /ipad|tablet/i.test(window.navigator.userAgent)
            ? "tablet"
            : "desktop",
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data: { ok?: boolean; success?: boolean; queued?: boolean; message?: string; error?: string; leadId?: string; rfqId?: string } | null = null;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = (await response.json()) as { ok?: boolean; success?: boolean; queued?: boolean; message?: string; error?: string; leadId?: string; rfqId?: string };
      } else {
        const text = await response.text();
        data = {
          ok: false,
          error:
            response.status >= 500
              ? "Server error while submitting RFQ. Please retry or contact sales."
              : text?.trim() || "Unable to submit request.",
          message:
            response.status >= 500
              ? "Server error while submitting RFQ. Please retry or contact sales."
              : text?.trim() || "Unable to submit request."
        };
      }

      const isSuccess = response.ok && data?.ok !== false;

      if (!isSuccess) {
        setStatus("error");
        setNotice(data?.error ?? data?.message ?? `Unable to submit request (HTTP ${response.status}).`);
        return;
      }

      const resolvedRfqId = data?.rfqId ?? data?.leadId ?? "";
      setStatus("success");
      setNotice("");
      const queuedOrSuccessMessage = data?.message?.trim();
      if (queuedOrSuccessMessage) {
        setNotice(`${queuedOrSuccessMessage}${resolvedRfqId ? ` Reference ID: ${resolvedRfqId}.` : ""} Redirecting...`);
      } else {
        setNotice(`RFQ received. Reference ID: ${resolvedRfqId || "pending"}. Redirecting...`);
      }
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_KEY);
        window.sessionStorage.setItem(
          "conjoin_submit_success",
          JSON.stringify({
            formSource: "request-quote",
            sourcePage: state.sourcePage || null,
            leadId: resolvedRfqId || null,
            timestamp: Date.now()
          })
        );
      }

      const query = new URLSearchParams({
        formSource: state.source || "request-quote",
        landingPath: state.sourcePage || "/request-quote",
        brand: context.brand,
        city: normalizedCity,
        region: normalizedRegion,
        qty: String(quantity),
        category: context.category,
        requirement,
        plan: state.product,
        timeline: state.timeline
      });
      if (resolvedRfqId) {
        query.set("leadId", resolvedRfqId);
      }
      appendAttributionToQuery(query, {
        gclid: state.gclid,
        gbraid: state.gbraid,
        wbraid: state.wbraid,
        utm_source: state.utmSource,
        utm_medium: state.utmMedium,
        utm_campaign: state.utmCampaign,
        utm_term: state.utmTerm,
        utm_content: state.utmContent
      });

      router.replace(`/thank-you?${query.toString()}`);
    } catch (error) {
      setStatus("error");
      setNotice(
        error instanceof Error && error.message
          ? `Unable to submit request: ${error.message}`
          : "Unable to submit request."
      );
    }
  }

  function onBrandInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!brandListOpen) {
      if (event.key === "ArrowDown") {
        setBrandListOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveBrandIndex((current) => Math.min(current + 1, filteredBrandOptions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveBrandIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = filteredBrandOptions[activeBrandIndex] ?? filteredBrandOptions[0];
      if (target) {
        selectBrand(target.brand, target.label);
      }
      return;
    }

    if (event.key === "Escape") {
      setBrandListOpen(false);
    }
  }

  function handleFormStartCapture() {
    if (formStartTracked.current) {
      return;
    }
    formStartTracked.current = true;
    const pagePath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/request-quote";
    trackAdsConversionOncePerSession(
      "form_start",
      {
        form_name: "request_quote_wizard",
        page_path: pagePath
      },
      "form_start:request_quote"
    );
  }

  return (
    <Section tone="alt" className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-5xl">Request a Quote</h1>
          <p className="max-w-3xl text-sm md:text-base">
            Five-step procurement flow for Microsoft and Seqrite subscriptions with instant brand-filtered options.
          </p>
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
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <Card className="section-revealed space-y-6 border-t-2 p-5 md:p-7" onFocusCapture={handleFormStartCapture}>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                Step {step} of {steps.length}
              </p>
              <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">{headingForStep(step, state.brand)}</h2>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-alt-bg)]">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(step / steps.length) * 100}%`, background: accent }} />
              </div>
              <ol className="grid gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] sm:grid-cols-5">
                {steps.map((label, index) => {
                  const stepNumber = index + 1;
                  const active = stepNumber === step;
                  const done = stepNumber < step;
                  return (
                    <li
                      key={`step-${label}`}
                      className={`rounded-lg border px-2 py-1 text-center ${
                        active
                          ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                          : done
                            ? "border-[var(--color-border)] text-[var(--color-text-primary)]"
                            : "border-[var(--color-border)]"
                      }`}
                    >
                      {label}
                    </li>
                  );
                })}
              </ol>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Quick select</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {quickSelectBrands.map((brand) => {
                      const active = state.brand === brand;
                      return (
                        <button
                          key={`chip-${brand}`}
                          type="button"
                          onPointerDown={(event) => {
                            event.preventDefault();
                            selectBrand(brand, brand);
                          }}
                          onClick={() => selectBrand(brand, brand)}
                          className="rounded-xl border px-3 py-3 text-left text-sm font-semibold transition"
                          style={{
                            borderColor: active ? BRAND_ACCENTS[brand] : "var(--color-border)",
                            boxShadow: active ? `0 0 0 1px ${BRAND_ACCENTS[brand]}33` : "none"
                          }}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="brand-combobox" className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Search brand
                    <input
                      ref={brandInputRef}
                      id="brand-combobox"
                      type="text"
                      role="combobox"
                      aria-expanded={brandListOpen}
                      aria-controls="brand-options-listbox"
                      aria-autocomplete="list"
                      aria-activedescendant={
                        filteredBrandOptions[activeBrandIndex] ? `brand-option-${activeBrandIndex}` : undefined
                      }
                      value={brandQuery}
                      onFocus={() => {
                        setBrandListOpen(true);
                        setActiveBrandIndex(0);
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setBrandListOpen(false), 120);
                      }}
                      onChange={(event) => {
                        setBrandQuery(event.target.value);
                        setBrandListOpen(true);
                        setActiveBrandIndex(0);
                      }}
                      onKeyDown={onBrandInputKeyDown}
                      placeholder="Type Microsoft, Seqrite, Cisco..."
                      className={formFieldClass}
                    />
                  </label>

                  {brandListOpen ? (
                    <ul
                      id="brand-options-listbox"
                      role="listbox"
                      className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-auto rounded-xl border border-[var(--color-border)] bg-white p-2 shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
                    >
                      {filteredBrandOptions.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-slate-500">No match found.</li>
                      ) : (
                        filteredBrandOptions.map((option, index) => {
                          const active = index === activeBrandIndex;
                          const selected = state.brand === option.brand;
                          return (
                            <li key={`${option.label}-${index}`} role="option" aria-selected={selected}>
                              <button
                                id={`brand-option-${index}`}
                                type="button"
                                onPointerDown={(event) => {
                                  event.preventDefault();
                                  selectBrand(option.brand, option.label);
                                }}
                                onClick={() => selectBrand(option.brand, option.label)}
                                onMouseEnter={() => setActiveBrandIndex(index)}
                                className={`w-full rounded-lg px-3 py-2 text-left transition ${
                                  active ? "bg-slate-100" : "hover:bg-slate-100"
                                }`}
                              >
                                <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                                <p className="text-xs text-slate-600">{option.note}</p>
                              </button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {primaryBrands.map((brand) => {
                  const active = state.brand === brand;
                  return (
                    <button
                      key={`card-${brand}`}
                      type="button"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        selectBrand(brand, brand);
                      }}
                      onClick={() => selectBrand(brand, brand)}
                      className="rounded-2xl border px-4 py-4 text-left transition"
                      style={{
                        borderColor: active ? BRAND_ACCENTS[brand] : "var(--color-border)",
                        boxShadow: active ? `0 0 0 1px ${BRAND_ACCENTS[brand]}33` : "none"
                      }}
                    >
                      <p className="text-base font-semibold text-[var(--color-text-primary)]">{brand}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        {brand === "Microsoft"
                          ? "Microsoft 365, Azure and security"
                          : brand === "Seqrite"
                            ? "Endpoint security and advanced protection"
                            : brand === "Cisco"
                              ? "Networking and security pathways"
                              : "Other OEM procurement requirement"}
                      </p>
                    </button>
                  );
                })}
              </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                  Search product
                  <input
                    type="text"
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    placeholder="Type product name"
                    className={formFieldClass}
                  />
                </label>
                <p className="text-xs text-[var(--color-text-secondary)]">Selection remains locked in summary after you continue.</p>

                <div className="space-y-4">
                  {groupedProducts.map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{category}</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((item, index) => {
                          const selected = state.category === item.category && state.product === item.product;
                          return (
                            <button
                              key={`${item.product}-${index}`}
                              type="button"
                              onClick={() => selectProduct(item.category, item.product)}
                              className="rounded-2xl border px-4 py-4 text-left transition"
                              style={{
                                borderColor: selected ? accent : "var(--color-border)",
                                boxShadow: selected ? `0 0 0 1px ${accent}33` : "none"
                              }}
                            >
                              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.product}</p>
                              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{item.description}</p>
                              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                                {item.licenseModel}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                  {quantityLabel} slider
                  <input
                    type="range"
                    min="1"
                    max="5000"
                    step="1"
                    value={Math.min(5000, Math.max(1, toNumber(state.quantity) || 1))}
                    onChange={(event) => patch({ quantity: event.target.value })}
                    className="w-full accent-[var(--color-primary)]"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                  {quantityLabel}
                  <input
                    type="number"
                    min="1"
                    value={state.quantity}
                    onChange={(event) => patch({ quantity: event.target.value })}
                    className={formFieldClass}
                    autoComplete="off"
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
                      className={formFieldClass}
                      autoComplete="off"
                    />
                  </label>
                ) : null}
                <p className="text-xs text-[var(--color-text-secondary)]">
                  These inputs help produce a compliance-ready proposal and reduce commercial back-and-forth.
                </p>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {deploymentOptions.map((item, index) => {
                    const selected = state.deployment === item;
                    return (
                      <button
                        key={`${item}-${index}`}
                        type="button"
                        onClick={() => patch({ deployment: item })}
                        className="rounded-xl border px-4 py-3 text-center text-sm font-semibold transition"
                        style={{
                          borderColor: selected ? accent : "var(--color-border)",
                          boxShadow: selected ? `0 0 0 1px ${accent}33` : "none"
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Choose the deployment model that matches your current environment.</p>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Name
                    <input
                      type="text"
                      value={state.contactName}
                      onChange={(event) => patch({ contactName: event.target.value })}
                      className={formFieldClass}
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Company
                    <input
                      type="text"
                      value={state.company}
                      onChange={(event) => patch({ company: event.target.value })}
                      className={formFieldClass}
                      autoComplete="organization"
                      placeholder="Optional"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Phone
                    <input
                      type="tel"
                      value={state.phone}
                      onChange={(event) => patch({ phone: event.target.value })}
                      className={formFieldClass}
                      autoComplete="tel"
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Email
                    <input
                      type="email"
                      value={state.email}
                      onChange={(event) => patch({ email: event.target.value })}
                      className={formFieldClass}
                      autoComplete="email"
                      placeholder="Optional"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Customer Type
                    <select
                      value={state.customerType}
                      onChange={(event) =>
                        patch({
                          customerType: event.target.value as WizardState["customerType"],
                          tenderGemRef: event.target.value === "Govt-PSU" ? state.tenderGemRef : "",
                          documentationRequired: event.target.value === "Govt-PSU" ? state.documentationRequired : false,
                          partnerEndCustomer: event.target.value === "Partner" ? state.partnerEndCustomer : "",
                          backToBackBilling: event.target.value === "Partner" ? state.backToBackBilling : false
                        })
                      }
                      className={formFieldClass}
                    >
                      {customerTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    City
                    <input
                      type="text"
                      list="city-options"
                      value={state.city}
                      onChange={(event) => patch({ city: event.target.value })}
                      className={formFieldClass}
                      placeholder="Chandigarh"
                      required
                    />
                    <datalist id="city-options">
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </datalist>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Service Region
                    <select
                      value={state.region}
                      onChange={(event) => patch({ region: event.target.value })}
                      className={formFieldClass}
                    >
                      <option value="">Select region</option>
                      {REGION_OPTIONS.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>
                  {state.customerType !== "SMB" ? (
                    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                      Timeline
                      <select
                        value={state.timeline}
                        onChange={(event) => patch({ timeline: event.target.value })}
                        className={formFieldClass}
                      >
                        {timelineOptions.map((timeline) => (
                          <option key={timeline} value={timeline}>
                            {timeline}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}

                  {state.customerType === "Govt-PSU" ? (
                    <>
                      <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                        Tender / GeM Ref (optional)
                        <input
                          type="text"
                          value={state.tenderGemRef}
                          onChange={(event) => patch({ tenderGemRef: event.target.value })}
                          className={formFieldClass}
                          placeholder="Tender ID / GeM Ref"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                        <input
                          type="checkbox"
                          checked={state.documentationRequired}
                          onChange={(event) => patch({ documentationRequired: event.target.checked })}
                          className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                        />
                        Documentation required
                      </label>
                    </>
                  ) : null}

                  {state.customerType === "Partner" ? (
                    <>
                      <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
                        End Customer Name (protected)
                        <input
                          type="text"
                          value={state.partnerEndCustomer}
                          onChange={(event) => patch({ partnerEndCustomer: event.target.value })}
                          className={formFieldClass}
                          placeholder="Optional"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                        <input
                          type="checkbox"
                          checked={state.backToBackBilling}
                          onChange={(event) => patch({ backToBackBilling: event.target.checked })}
                          className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                        />
                        Need back-to-back billing
                      </label>
                    </>
                  ) : null}

                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                    <input
                      type="checkbox"
                      checked={state.whatsappOptIn}
                      onChange={(event) => patch({ whatsappOptIn: event.target.checked })}
                      className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                    />
                    WhatsApp follow-up allowed on provided number
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                    Notes (optional)
                    <textarea
                      rows={4}
                      value={state.notes}
                      onChange={(event) => patch({ notes: event.target.value })}
                      className={formTextareaClass}
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
                </div>
              </div>
            ) : null}

            {notice ? (
              <p
                role="alert"
                aria-live="polite"
                className={`rounded-xl border px-3 py-2 text-sm ${
                  status === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : status === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {notice}
              </p>
            ) : null}

            <div className="sticky bottom-2 z-20 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_95%,transparent)] p-2 md:static md:border-0 md:bg-transparent md:p-0">
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
                  data-testid="wizard-next"
                  onClick={next}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
                  style={{ background: accent }}
                  disabled={status === "loading"}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="wizard-submit"
                  onClick={submit}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: accent }}
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Submitting..." : "Submit RFQ"}
                </button>
              )}
            </div>
          </Card>

          <Card className="h-fit space-y-3 p-5 lg:sticky lg:top-24">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Live Summary</h3>
            {selectedProduct ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-alt-bg)] p-3 text-xs text-[var(--color-text-secondary)]">
                <p className="font-semibold text-[var(--color-text-primary)]">{selectedProduct.product}</p>
                <p>{selectedProduct.description}</p>
                <p className="mt-1 uppercase tracking-[0.08em]">{selectedProduct.licenseModel}</p>
              </div>
            ) : null}
            <dl className="space-y-2 text-sm">
              {summaryRows.map(([label, value], index) => (
                <div key={`${label}-${index}`} className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="font-medium text-[var(--color-text-primary)]">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="text-xs text-[var(--color-text-secondary)]">
              <p>Response in about 15 minutes during business hours.</p>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
