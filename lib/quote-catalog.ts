import {
  getBrandCategories,
  getBrandProducts,
  getDeploymentOptionsForProduct,
  hasProduct,
  type DirectoryBrand,
  type DeploymentType
} from "@/lib/product-registry";

export type LeadBrand = DirectoryBrand;
export type LeadStatus = "NEW" | "IN_PROGRESS" | "QUOTED" | "WON" | "LOST";
export type LeadPriority = "HOT" | "WARM" | "COLD";

export const LEAD_STATUSES: LeadStatus[] = ["NEW", "IN_PROGRESS", "QUOTED", "WON", "LOST"];
export const LEAD_PRIORITIES: LeadPriority[] = ["HOT", "WARM", "COLD"];

export const CITY_OPTIONS = [
  "Chandigarh",
  "Panchkula",
  "Mohali",
  "Punjab",
  "Haryana",
  "Himachal Pradesh",
  "Uttarakhand",
  "J&K",
  "Other"
] as const;

export const BRAND_ACCENTS: Record<LeadBrand, string> = {
  Microsoft: "var(--brand-microsoft)",
  Seqrite: "var(--brand-seqrite)",
  Cisco: "var(--brand-cisco)",
  Other: "var(--color-primary)"
};

type CatalogNode = {
  label: string;
  plans: string[];
  quantityLabel: string;
  deploymentOptions?: DeploymentType[];
  supportsServers?: boolean;
};

const QUANTITY_LABELS: Record<LeadBrand, string> = {
  Microsoft: "Users/Seats",
  Seqrite: "Devices/Endpoints",
  Cisco: "Users/Devices",
  Other: "Users/Devices"
};

const SEQRITE_SERVER_PRODUCTS = new Set(["Endpoint Security", "EDR", "XDR", "Enterprise Suite"]);

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function categoryToNode(brand: LeadBrand, categoryName: string): CatalogNode {
  const plans = getBrandProducts(brand)
    .filter((item) => item.category === categoryName)
    .map((item) => item.product);

  const deploymentOptions = unique(
    getBrandProducts(brand)
      .filter((item) => item.category === categoryName)
      .flatMap((item) => item.deploymentOptions)
  );

  return {
    label: categoryName,
    plans,
    quantityLabel: QUANTITY_LABELS[brand],
    deploymentOptions,
    supportsServers: brand === "Seqrite"
  };
}

export const QUOTE_CATALOG: Record<LeadBrand, CatalogNode[]> = {
  Microsoft: getBrandCategories("Microsoft").map((category) => categoryToNode("Microsoft", category.name)),
  Seqrite: getBrandCategories("Seqrite").map((category) => categoryToNode("Seqrite", category.name)),
  Cisco: getBrandCategories("Cisco").map((category) => categoryToNode("Cisco", category.name)),
  Other: getBrandCategories("Other").map((category) => categoryToNode("Other", category.name))
};

export const ADD_ON_OPTIONS = ["DLP", "Patch", "EDR", "Encryption"] as const;

export const LAST_VERIFIED_DATE = "14 Feb 2026";

export function getStageTwoOptions(brand: LeadBrand) {
  return QUOTE_CATALOG[brand].map((node) => node.label);
}

export function getPlans(brand: LeadBrand, label: string) {
  const node = QUOTE_CATALOG[brand].find((item) => item.label === label);
  return node ? node.plans : [];
}

export function getQuantityLabel(brand: LeadBrand, label?: string) {
  if (!label) {
    return QUANTITY_LABELS[brand] ?? "Quantity";
  }

  const node = QUOTE_CATALOG[brand].find((item) => item.label === label);
  return node?.quantityLabel ?? QUANTITY_LABELS[brand] ?? "Quantity";
}

export function getCategoryForPlan(brand: LeadBrand, plan: string) {
  const lookup = plan.trim().toLowerCase();
  if (!lookup) {
    return "";
  }

  const categories = getStageTwoOptions(brand);
  const match = categories.find((category) => getPlans(brand, category).some((candidate) => candidate.toLowerCase() === lookup));
  return match ?? "";
}

export function getProductOptions(brand: LeadBrand) {
  return getBrandProducts(brand);
}

export function getDeploymentOptions(brand: LeadBrand, label: string, plan?: string) {
  if (plan) {
    return getDeploymentOptionsForProduct(brand, label, plan);
  }

  const node = QUOTE_CATALOG[brand].find((item) => item.label === label);
  return node?.deploymentOptions ?? [];
}

export function supportsServers(brand: LeadBrand, label: string, deployment?: string, plan?: string) {
  if (brand !== "Seqrite") {
    return false;
  }

  const resolvedPlan = (plan ?? "").trim();
  if (resolvedPlan && !SEQRITE_SERVER_PRODUCTS.has(resolvedPlan)) {
    return false;
  }

  if (!resolvedPlan) {
    const plans = getPlans(brand, label);
    if (!plans.some((candidate) => SEQRITE_SERVER_PRODUCTS.has(candidate))) {
      return false;
    }
  }

  if (!deployment) {
    return true;
  }

  const next = deployment.trim().toLowerCase();
  return next === "on-prem" || next === "hybrid";
}

export function isValidSelection(brand: LeadBrand, stageTwo: string, plan: string, deployment?: string) {
  const category = stageTwo.trim();
  const product = plan.trim();

  if (!category || !product) {
    return false;
  }

  if (!hasProduct(brand, category, product)) {
    return false;
  }

  const deploymentOptions = getDeploymentOptions(brand, category, product);
  if (deploymentOptions.length === 0) {
    return true;
  }

  if (!deployment) {
    return false;
  }

  return deploymentOptions.includes(deployment as DeploymentType);
}

export function isValidProductSelection(brand: LeadBrand, stageTwo: string, plan: string) {
  const category = stageTwo.trim();
  const product = plan.trim();
  if (!category || !product) {
    return false;
  }

  return hasProduct(brand, category, product);
}
