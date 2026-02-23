"use client";

import { useMemo, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";

type BuyerType = "Government/PSU" | "Enterprise" | "SMB" | "Partner/Reseller" | "Individual";
type ServiceCategory =
  | "Microsoft 365"
  | "Endpoint Security"
  | "Networking"
  | "Surveillance"
  | "Access Control"
  | "Backup/DR"
  | "Other";
type Timeline = "Urgent" | "This Week" | "This Month" | "Planning";
type PurchaseProcess = "Tender" | "Direct" | "Rate Contract";

type SmartRfqEstimatorProps = {
  sourceContext?: string;
  title?: string;
};

const BUYER_TYPES: BuyerType[] = ["Government/PSU", "Enterprise", "SMB", "Partner/Reseller", "Individual"];
const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Microsoft 365",
  "Endpoint Security",
  "Networking",
  "Surveillance",
  "Access Control",
  "Backup/DR",
  "Other"
];
const TIMELINES: Timeline[] = ["Urgent", "This Week", "This Month", "Planning"];
const PURCHASE_PROCESSES: PurchaseProcess[] = ["Tender", "Direct", "Rate Contract"];
const M365_NEEDS = ["Email", "Teams", "SharePoint", "Security", "Intune"] as const;
const ENDPOINT_NEEDS = ["AV", "EDR", "Email Security", "DLP"] as const;

function defaultCategoryFromPath(pathname: string): ServiceCategory {
  if (pathname.includes("/microsoft-365")) {
    return "Microsoft 365";
  }
  if (pathname.includes("/seqrite")) {
    return "Endpoint Security";
  }
  return "Other";
}

function toPositiveNumber(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseJsonPayload(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as {
    ok?: boolean;
    error?: string;
    message?: string;
    leadId?: string;
    rfqId?: string;
  };
}

export default function SmartRfqEstimator({
  sourceContext = "smart-rfq",
  title = "Smart RFQ Estimator"
}: SmartRfqEstimatorProps) {
  const pathname = usePathname() ?? "/";
  const [step, setStep] = useState(1);
  const [buyerType, setBuyerType] = useState<BuyerType>("Enterprise");
  const [category, setCategory] = useState<ServiceCategory>(() => defaultCategoryFromPath(pathname));
  const [timeline, setTimeline] = useState<Timeline>("This Week");
  const [usersCount, setUsersCount] = useState("");
  const [devicesCount, setDevicesCount] = useState("");
  const [windowsMacMix, setWindowsMacMix] = useState("Mostly Windows");
  const [currentAv, setCurrentAv] = useState("None");
  const [m365Needs, setM365Needs] = useState<Array<(typeof M365_NEEDS)[number]>>([]);
  const [endpointNeeds, setEndpointNeeds] = useState<Array<(typeof ENDPOINT_NEEDS)[number]>>([]);
  const [needGemSupport, setNeedGemSupport] = useState(false);
  const [needComplianceDocs, setNeedComplianceDocs] = useState(false);
  const [purchaseProcess, setPurchaseProcess] = useState<PurchaseProcess>("Tender");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("Chandigarh");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [notice, setNotice] = useState("");

  const serviceSummary = useMemo(() => {
    if (category === "Microsoft 365") {
      const needText = m365Needs.length ? m365Needs.join(", ") : "General Microsoft setup";
      return `${category} • Needs: ${needText} • Users: ${usersCount || "-"}`;
    }

    if (category === "Endpoint Security") {
      const needText = endpointNeeds.length ? endpointNeeds.join(", ") : "General endpoint hardening";
      return `${category} • Needs: ${needText} • Devices: ${devicesCount || "-"}`;
    }

    return `${category} • Buyer: ${buyerType}`;
  }, [buyerType, category, devicesCount, endpointNeeds, m365Needs, usersCount]);

  function toggleM365Need(option: (typeof M365_NEEDS)[number]) {
    setM365Needs((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    );
  }

  function toggleEndpointNeed(option: (typeof ENDPOINT_NEEDS)[number]) {
    setEndpointNeeds((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
    );
  }

  function canMoveNext() {
    if (step === 1) return Boolean(buyerType);
    if (step === 2) return Boolean(category);
    if (step === 3) {
      if (category === "Microsoft 365") return Boolean(usersCount.trim());
      if (category === "Endpoint Security") return Boolean(devicesCount.trim());
      return true;
    }
    return true;
  }

  function next() {
    if (!canMoveNext()) {
      setNotice("Please complete the current step before continuing.");
      return;
    }
    setNotice("");
    setStep((current) => Math.min(current + 1, 4));
  }

  function back() {
    setNotice("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }

    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedCity = city.trim();
    if (!normalizedName || !normalizedPhone || !normalizedCity) {
      setStatus("error");
      setNotice("Please enter Name, Phone, and City.");
      return;
    }

    setStatus("submitting");
    setNotice("");

    const pagePath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname;
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

    const payload = {
      name: normalizedName,
      phone: normalizedPhone,
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      city: normalizedCity,
      requirement: `${category} | ${buyerType}`,
      businessType: buyerType,
      usersDevices: toPositiveNumber(category === "Microsoft 365" ? usersCount : devicesCount),
      timeline,
      source: `smart-estimator:${sourceContext}`,
      pageUrl: pagePath,
      landing_page: pagePath,
      referrer: typeof document !== "undefined" ? document.referrer : "",
      utm_source: searchParams?.get("utm_source") ?? undefined,
      utm_medium: searchParams?.get("utm_medium") ?? undefined,
      utm_campaign: searchParams?.get("utm_campaign") ?? undefined,
      utm_term: searchParams?.get("utm_term") ?? undefined,
      utm_content: searchParams?.get("utm_content") ?? undefined,
      gclid: searchParams?.get("gclid") ?? undefined,
      gbraid: searchParams?.get("gbraid") ?? undefined,
      wbraid: searchParams?.get("wbraid") ?? undefined,
      notes: [
        notes.trim(),
        serviceSummary,
        buyerType === "Government/PSU" ? `GeM support: ${needGemSupport ? "Yes" : "No"}` : "",
        buyerType === "Government/PSU" ? `Compliance docs: ${needComplianceDocs ? "Yes" : "No"}` : "",
        buyerType === "Government/PSU" ? `Purchase process: ${purchaseProcess}` : "",
        category === "Endpoint Security" ? `Windows/Mac mix: ${windowsMacMix}` : "",
        category === "Endpoint Security" ? `Current AV: ${currentAv}` : "",
        "Expected response < 30 mins",
        "GST invoice + procurement-ready documentation",
        "Partner-safe billing / OEM-aligned procurement"
      ]
        .filter(Boolean)
        .join(" | "),
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = parseJsonPayload(await response.json().catch(() => ({})));

      if (!response.ok) {
        setStatus("error");
        setNotice(data.error || data.message || `Unable to submit request (HTTP ${response.status}).`);
        return;
      }

      const leadId = data.leadId || data.rfqId;
      setStatus("success");
      setNotice("Thank you. Request received. Redirecting to confirmation...");

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

      const query = new URLSearchParams({
        formSource: sourceContext,
        city: normalizedCity,
        category
      });
      if (leadId) {
        query.set("leadId", leadId);
      }

      if (typeof window !== "undefined") {
        window.location.assign(`/thank-you?${query.toString()}`);
      }
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
    <section className="surface-card space-y-5 p-5 md:p-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] md:text-2xl">{title}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Cisco/Bark-style rapid estimator for procurement-ready pricing scope.
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-text-primary)]">
          {["Expected response < 30 mins", "GeM supported", "GST invoice", "Partner-safe billing"].map((badge) => (
            <span key={badge} className="rounded-full border border-[var(--color-border)] px-3 py-1">
              {badge}
            </span>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
        {[1, 2, 3, 4].map((item) => (
          <span
            key={item}
            className={`rounded-full border px-2.5 py-1 ${
              step === item
                ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                : "border-[var(--color-border)]"
            }`}
          >
            Step {item}
          </span>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Choose Buyer Type</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {BUYER_TYPES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBuyerType(option)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold text-left ${
                    buyerType === option
                      ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Select Service Category</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SERVICE_CATEGORIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold text-left ${
                    category === option
                      ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {category === "Microsoft 365" ? (
              <>
                <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
                  Users count
                  <input
                    value={usersCount}
                    onChange={(event) => setUsersCount(event.target.value)}
                    className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
                    inputMode="numeric"
                    placeholder="e.g. 50"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
                  Timeline
                  <select
                    value={timeline}
                    onChange={(event) => setTimeline(event.target.value as Timeline)}
                    className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
                  >
                    {TIMELINES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Need</p>
                  <div className="flex flex-wrap gap-2">
                    {M365_NEEDS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleM365Need(option)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          m365Needs.includes(option)
                            ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                            : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {category === "Endpoint Security" ? (
              <>
                <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
                  Devices count
                  <input
                    value={devicesCount}
                    onChange={(event) => setDevicesCount(event.target.value)}
                    className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
                    inputMode="numeric"
                    placeholder="e.g. 120"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
                  Windows/Mac mix
                  <select
                    value={windowsMacMix}
                    onChange={(event) => setWindowsMacMix(event.target.value)}
                    className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
                  >
                    <option>Mostly Windows</option>
                    <option>Mixed</option>
                    <option>Mostly Mac</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                  Current AV
                  <select
                    value={currentAv}
                    onChange={(event) => setCurrentAv(event.target.value)}
                    className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
                  >
                    <option>None</option>
                    <option>Other</option>
                    <option>Quick Heal</option>
                    <option>Seqrite</option>
                  </select>
                </label>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">Need</p>
                  <div className="flex flex-wrap gap-2">
                    {ENDPOINT_NEEDS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleEndpointNeed(option)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          endpointNeeds.includes(option)
                            ? "border-[var(--color-primary)] text-[var(--color-text-primary)]"
                            : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {category !== "Microsoft 365" && category !== "Endpoint Security" ? (
              <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                Requirement details
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="form-field-surface min-h-24 w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
                  placeholder="Share requirement summary"
                />
              </label>
            ) : null}

            {buyerType === "Government/PSU" ? (
              <>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                  <input
                    type="checkbox"
                    checked={needGemSupport}
                    onChange={(event) => setNeedGemSupport(event.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                  />
                  Need GeM support?
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                  <input
                    type="checkbox"
                    checked={needComplianceDocs}
                    onChange={(event) => setNeedComplianceDocs(event.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                  />
                  Need GST invoice + compliance docs?
                </label>
                <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
                  Purchase process
                  <select
                    value={purchaseProcess}
                    onChange={(event) => setPurchaseProcess(event.target.value as PurchaseProcess)}
                    className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
                  >
                    {PURCHASE_PROCESSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              Name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              Phone
              <input
                required
                type="tel"
                minLength={10}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              Email (optional)
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              Company
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)]">
              City
              <input
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="form-field-surface w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-[var(--color-text-primary)] md:col-span-2">
              Notes (optional)
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="form-field-surface min-h-24 w-full rounded-xl border border-[var(--color-border)] px-3 py-2"
                placeholder="Share any context for procurement and rollout"
              />
            </label>
          </div>
        ) : null}

        {notice ? (
          <p
            className={`rounded-xl border px-3 py-2 text-sm ${
              status === "error"
                ? "border-red-500/40 bg-red-900/20 text-red-200"
                : "border-emerald-500/40 bg-emerald-900/20 text-emerald-200"
            }`}
          >
            {notice}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-primary)]"
            >
              Back
            </button>
          ) : null}
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-5 text-sm font-semibold text-white"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="interactive-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-700/20 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting" ? "Submitting..." : "Submit Request"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
