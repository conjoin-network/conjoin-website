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
  deploymentOptions?: string[];
  supportsServers?: boolean;
};

export const QUOTE_CATALOG: Record<LeadBrand, CatalogNode[]> = {
  Microsoft: [
    {
      label: "Microsoft 365 Business",
      plans: ["Business Basic", "Business Standard", "Business Premium"],
      quantityLabel: "Users/Seats"
    },
    {
      label: "Microsoft 365 Enterprise",
      plans: ["Enterprise E3", "Enterprise E5"],
      quantityLabel: "Users/Seats"
    },
    {
      label: "Microsoft Security Add-ons",
      plans: [
        "Defender for Business",
        "Defender for Endpoint",
        "Entra ID",
        "Intune"
      ],
      quantityLabel: "Users/Seats"
    }
  ],
  Seqrite: [
    {
      label: "Endpoint Security",
      plans: ["Essentials", "Advanced", "Complete"],
      quantityLabel: "Endpoints",
      deploymentOptions: ["Cloud", "On-Prem"],
      supportsServers: true
    },
    {
      label: "EDR",
      plans: ["EDR Essentials", "EDR Advanced"],
      quantityLabel: "Endpoints"
    }
  ],
  Cisco: [
    {
      label: "Firewall",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "Switching",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "Wi-Fi",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "Collaboration",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "Endpoint",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "EDR",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    }
  ],
  Other: [
    {
      label: "Firewall",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "Switching",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "Wi-Fi",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "Collaboration",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "Endpoint",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
      quantityLabel: "Users"
    },
    {
      label: "EDR",
      plans: ["New deployment", "Refresh / upgrade", "Renewal / support"],
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

export function getDeploymentOptions(brand: LeadBrand, label: string) {
  const node = QUOTE_CATALOG[brand].find((item) => item.label === label);
  return node?.deploymentOptions ?? [];
}

export function supportsServers(brand: LeadBrand, label: string, deployment?: string) {
  const node = QUOTE_CATALOG[brand].find((item) => item.label === label);
  if (!node?.supportsServers) {
    return false;
  }

  if (!deployment) {
    return true;
  }

  return deployment.toLowerCase() === "on-prem";
}

export function isValidSelection(brand: LeadBrand, stageTwo: string, plan: string, deployment?: string) {
  const node = QUOTE_CATALOG[brand].find((item) => item.label === stageTwo);
  if (!node) {
    return false;
  }

  const deploymentOptions = node.deploymentOptions ?? [];
  if (deploymentOptions.length > 0 && !deploymentOptions.includes(deployment ?? "")) {
    return false;
  }

  return node.plans.includes(plan);
}
