export type LeadBrand = "Microsoft" | "Seqrite" | "Cisco" | "Other";
export type LeadStatus = "NEW" | "IN_PROGRESS" | "QUOTED" | "WON" | "LOST";
export type LeadPriority = "HOT" | "WARM" | "COLD";

export const LEAD_STATUSES: LeadStatus[] = ["NEW", "IN_PROGRESS", "QUOTED", "WON", "LOST"];
export const LEAD_PRIORITIES: LeadPriority[] = ["HOT", "WARM", "COLD"];

export const CITY_OPTIONS = ["Chandigarh", "Panchkula", "Mohali", "Haryana", "Punjab", "Other"] as const;

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
};

export const QUOTE_CATALOG: Record<LeadBrand, CatalogNode[]> = {
  Microsoft: [
    {
      label: "Business",
      plans: ["Business Basic", "Business Standard", "Business Premium"],
      quantityLabel: "Users/Seats"
    },
    {
      label: "Enterprise",
      plans: ["Enterprise E3", "Enterprise E5"],
      quantityLabel: "Users/Seats"
    },
    {
      label: "Add-ons",
      plans: ["Identity", "Endpoint", "Email", "Cloud Apps"],
      quantityLabel: "Users/Seats"
    }
  ],
  Seqrite: [
    {
      label: "Cloud",
      plans: ["Essentials", "Advanced", "Complete"],
      quantityLabel: "Endpoints"
    },
    {
      label: "On-Prem",
      plans: ["Essentials", "Advanced", "Complete"],
      quantityLabel: "Endpoints"
    }
  ],
  Cisco: [
    {
      label: "Firewall",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "Switching",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "Wi-Fi",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "Collaboration",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "Endpoint",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "EDR",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    }
  ],
  Other: [
    {
      label: "Firewall",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "Switching",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "Wi-Fi",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "Collaboration",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "Endpoint",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    },
    {
      label: "EDR",
      plans: ["Starter", "Standard", "Advanced"],
      quantityLabel: "Users"
    }
  ]
};

export const ADD_ON_OPTIONS = ["DLP", "Patch", "EDR", "Encryption"] as const;

export const LAST_VERIFIED_DATE = "12 Feb 2026";

export function getStageTwoOptions(brand: LeadBrand) {
  return QUOTE_CATALOG[brand].map((node) => node.label);
}

export function getPlans(brand: LeadBrand, label: string) {
  const node = QUOTE_CATALOG[brand].find((item) => item.label === label);
  return node ? node.plans : [];
}

export function getQuantityLabel(brand: LeadBrand, label: string) {
  const node = QUOTE_CATALOG[brand].find((item) => item.label === label);
  return node?.quantityLabel ?? "Quantity";
}

export function isValidSelection(brand: LeadBrand, stageTwo: string, plan: string) {
  const node = QUOTE_CATALOG[brand].find((item) => item.label === stageTwo);
  if (!node) {
    return false;
  }
  return node.plans.includes(plan);
}
