export type CanonicalLeadBrand = "Microsoft" | "Seqrite" | "Cisco" | "Other";

export const ATTRIBUTION_QUERY_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content"
] as const;

export type AttributionQueryKey = (typeof ATTRIBUTION_QUERY_KEYS)[number];
export type AttributionQuery = Partial<Record<AttributionQueryKey, string>>;

type ResolveLeadContextInput = {
  pathname?: string;
  sourceContext?: string;
  brand?: string;
  category?: string;
  requirement?: string;
};

function normalize(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeLower(value: string | null | undefined) {
  return normalize(value).toLowerCase();
}

function detectBrand(raw: string) {
  const value = normalizeLower(raw);
  if (!value || value === "it solution") {
    return "";
  }
  if (value.includes("microsoft")) {
    return "Microsoft";
  }
  if (value.includes("seqrite") || value.includes("quick heal")) {
    return "Seqrite";
  }
  if (value.includes("cisco")) {
    return "Cisco";
  }
  if (value === "other" || value === "other oem") {
    return "Other";
  }
  return "";
}

function detectCategory(raw: string) {
  const value = normalizeLower(raw);
  if (!value || value === "it solution") {
    return "";
  }
  if (value.includes("microsoft 365") || value.includes("m365")) {
    return "Microsoft 365";
  }
  if (value.includes("endpoint")) {
    return "Endpoint Security";
  }
  if (value.includes("seqrite")) {
    return "Endpoint Security";
  }
  if (value.includes("network")) {
    return "Networking";
  }
  if (value.includes("cisco")) {
    return "Networking";
  }
  return "";
}

function contextFromPath(pathname: string) {
  const path = normalizeLower(pathname);
  if (!path) {
    return { brand: "" as const, category: "" };
  }
  if (path.includes("/microsoft-365")) {
    return { brand: "Microsoft" as const, category: "Microsoft 365" };
  }
  if (path.includes("/seqrite")) {
    return { brand: "Seqrite" as const, category: "Endpoint Security" };
  }
  if (path.includes("/cisco")) {
    return { brand: "Cisco" as const, category: "Networking" };
  }
  return { brand: "" as const, category: "" };
}

function fallbackCategoryForBrand(brand: CanonicalLeadBrand) {
  if (brand === "Microsoft") {
    return "Microsoft 365";
  }
  if (brand === "Seqrite") {
    return "Endpoint Security";
  }
  if (brand === "Cisco") {
    return "Networking";
  }
  return "IT solution";
}

export function resolveLeadContext(input: ResolveLeadContextInput) {
  const pathContext = contextFromPath(input.pathname ?? "");

  const detectedBrand =
    detectBrand(input.brand ?? "") ||
    detectBrand(input.requirement ?? "") ||
    detectBrand(input.category ?? "") ||
    pathContext.brand ||
    "Other";

  const brand = detectedBrand as CanonicalLeadBrand;
  const category =
    normalize(input.category) ||
    detectCategory(input.requirement ?? "") ||
    pathContext.category ||
    fallbackCategoryForBrand(brand);

  const requirement =
    normalize(input.requirement) ||
    normalize(input.category) ||
    category ||
    "General requirement";

  return { brand, category, requirement };
}

export function readAttributionFromSearch(search: string) {
  return readAttributionFromParams(new URLSearchParams(search));
}

export function readAttributionFromParams(params: URLSearchParams) {
  const output: AttributionQuery = {};
  for (const key of ATTRIBUTION_QUERY_KEYS) {
    const value = normalize(params.get(key));
    if (value) {
      output[key] = value;
    }
  }
  return output;
}

export function appendAttributionToQuery(query: URLSearchParams, attribution: AttributionQuery) {
  for (const key of ATTRIBUTION_QUERY_KEYS) {
    const value = normalize(attribution[key]);
    if (value) {
      query.set(key, value);
    }
  }
}
