export type BrandStatus = "Live";
export type BrandCategory =
  | "Security"
  | "Networking"
  | "Cloud & Productivity"
  | "Enterprise Software"
  | "Endpoint & Devices"
  | "Data Center & Backup";

export type BrandTile = {
  slug: string;
  name: string;
  status: BrandStatus;
  description: string;
  categories: BrandCategory[];
};

export const BRAND_CATEGORIES: readonly BrandCategory[] = [
  "Security",
  "Networking",
  "Cloud & Productivity",
  "Enterprise Software",
  "Endpoint & Devices",
  "Data Center & Backup"
] as const;

export const BRAND_CATEGORY_HINTS: Record<BrandCategory, string> = {
  Security: "Endpoint / EDR / Firewall / Email and Web security",
  Networking: "Switching / Wi-Fi / Routing / Collaboration backbone",
  "Cloud & Productivity": "Cloud platforms, subscriptions and workload modernization",
  "Enterprise Software": "Licensing, compliance and renewal planning for software estates",
  "Endpoint & Devices": "User devices, endpoints and workplace computing standards",
  "Data Center & Backup": "Servers, storage, backup and resilience lifecycle planning"
};

export const BRAND_TILES: BrandTile[] = [
  {
    slug: "apple",
    name: "Apple",
    status: "Live",
    description: "Workplace device and endpoint procurement support for enterprise teams.",
    categories: ["Endpoint & Devices"]
  },
  {
    slug: "dell-technologies",
    name: "Dell Technologies",
    status: "Live",
    description: "Endpoint and infrastructure procurement planning with lifecycle visibility.",
    categories: ["Endpoint & Devices", "Data Center & Backup"]
  },
  {
    slug: "hp",
    name: "HP",
    status: "Live",
    description: "Business endpoint and print estate procurement support.",
    categories: ["Endpoint & Devices"]
  },
  {
    slug: "autodesk",
    name: "Autodesk",
    status: "Live",
    description: "Licensing and renewal governance for design and engineering teams.",
    categories: ["Enterprise Software"]
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    status: "Live",
    description: "Licensing, migration, security and renewal governance for Microsoft workloads.",
    categories: ["Cloud & Productivity", "Enterprise Software"]
  },
  {
    slug: "salesforce",
    name: "Salesforce",
    status: "Live",
    description: "Subscription procurement outcomes with compliance-ready commercial clarity.",
    categories: ["Enterprise Software", "Cloud & Productivity"]
  },
  {
    slug: "ibm",
    name: "IBM",
    status: "Live",
    description: "Enterprise software and platform procurement support for governance-first teams.",
    categories: ["Enterprise Software", "Cloud & Productivity"]
  },
  {
    slug: "oracle",
    name: "Oracle",
    status: "Live",
    description: "Database and application licensing pathways aligned to compliance workflows.",
    categories: ["Enterprise Software", "Cloud & Productivity"]
  },
  {
    slug: "microfocus",
    name: "Microfocus",
    status: "Live",
    description: "Software renewal and licensing support for enterprise environments.",
    categories: ["Enterprise Software"]
  },
  {
    slug: "ptc",
    name: "PTC",
    status: "Live",
    description: "Product lifecycle software procurement planning and renewal readiness.",
    categories: ["Enterprise Software"]
  },
  {
    slug: "red-hat",
    name: "Red Hat",
    status: "Live",
    description: "Platform subscription planning for deployment stability and compliance.",
    categories: ["Enterprise Software", "Cloud & Productivity"]
  },
  {
    slug: "sas",
    name: "SAS",
    status: "Live",
    description: "Analytics licensing and commercial planning support for business teams.",
    categories: ["Enterprise Software"]
  },
  {
    slug: "splunk",
    name: "Splunk",
    status: "Live",
    description: "Security and observability procurement support for risk-aware operations.",
    categories: ["Security", "Enterprise Software"]
  },
  {
    slug: "suse",
    name: "Suse",
    status: "Live",
    description: "Infrastructure software subscription support and renewal governance.",
    categories: ["Enterprise Software", "Cloud & Productivity"]
  },
  {
    slug: "aws",
    name: "AWS",
    status: "Live",
    description: "Cloud platform procurement and workload migration planning.",
    categories: ["Cloud & Productivity"]
  },
  {
    slug: "google-cloud",
    name: "Google Cloud",
    status: "Live",
    description: "Cloud workload procurement support with governance and cost controls.",
    categories: ["Cloud & Productivity"]
  },
  {
    slug: "microsoft-azure",
    name: "Microsoft Azure",
    status: "Live",
    description: "Azure subscription and workload governance planning for enterprises.",
    categories: ["Cloud & Productivity"]
  },
  {
    slug: "ibm-cloud",
    name: "IBM Cloud",
    status: "Live",
    description: "Cloud procurement support for regulated and hybrid workloads.",
    categories: ["Cloud & Productivity"]
  },
  {
    slug: "oracle-cloud",
    name: "Oracle Cloud",
    status: "Live",
    description: "Cloud procurement support for database-centric and enterprise workloads.",
    categories: ["Cloud & Productivity"]
  },
  {
    slug: "vmware",
    name: "VMware",
    status: "Live",
    description: "Virtualization and data center software procurement support.",
    categories: ["Data Center & Backup", "Cloud & Productivity"]
  },
  {
    slug: "dell-apex",
    name: "Dell APEX",
    status: "Live",
    description: "Consumption-model infrastructure planning with procurement visibility.",
    categories: ["Cloud & Productivity", "Data Center & Backup"]
  },
  {
    slug: "veeam",
    name: "Veeam",
    status: "Live",
    description: "Backup and recovery procurement pathways with continuity focus.",
    categories: ["Data Center & Backup"]
  },
  {
    slug: "veritas",
    name: "Veritas",
    status: "Live",
    description: "Data protection and backup lifecycle planning for enterprise operations.",
    categories: ["Data Center & Backup"]
  },
  {
    slug: "rubrik",
    name: "Rubrik",
    status: "Live",
    description: "Data resilience procurement support with risk mitigation planning.",
    categories: ["Data Center & Backup"]
  },
  {
    slug: "sap",
    name: "SAP",
    status: "Live",
    description: "Enterprise application licensing and renewal governance support.",
    categories: ["Enterprise Software"]
  },
  {
    slug: "seqrite",
    name: "Seqrite",
    status: "Live",
    description: "Endpoint security advisory for cloud and on-prem deployment.",
    categories: ["Security", "Endpoint & Devices"]
  },
  {
    slug: "cisco",
    name: "Cisco",
    status: "Live",
    description: "Security, networking and collaboration procurement pathways.",
    categories: ["Networking", "Security"]
  },
  {
    slug: "fortinet",
    name: "Fortinet",
    status: "Live",
    description: "Firewall and security posture planning with compliance-aware outcomes.",
    categories: ["Security"]
  },
  {
    slug: "sophos",
    name: "Sophos",
    status: "Live",
    description: "Endpoint and network security options for business risk control.",
    categories: ["Security", "Endpoint & Devices"]
  },
  {
    slug: "sonicwall",
    name: "SonicWall",
    status: "Live",
    description: "Branch security and firewall procurement support.",
    categories: ["Security", "Networking"]
  },
  {
    slug: "palo-alto",
    name: "Palo Alto",
    status: "Live",
    description: "Security architecture pathways for governance-first teams.",
    categories: ["Security"]
  },
  {
    slug: "trend-micro",
    name: "Trend Micro",
    status: "Live",
    description: "Threat defense procurement and lifecycle planning.",
    categories: ["Security", "Endpoint & Devices"]
  },
  {
    slug: "check-point",
    name: "Check Point",
    status: "Live",
    description: "Security control planning for risk-aware procurement teams.",
    categories: ["Security"]
  },
  {
    slug: "barracuda",
    name: "Barracuda",
    status: "Live",
    description: "Email and web security procurement pathways.",
    categories: ["Security"]
  },
  {
    slug: "juniper",
    name: "Juniper",
    status: "Live",
    description: "Routing and switching procurement support for enterprise networks.",
    categories: ["Networking"]
  },
  {
    slug: "aruba",
    name: "Aruba",
    status: "Live",
    description: "Enterprise wireless and network access planning.",
    categories: ["Networking"]
  },
  {
    slug: "ruckus",
    name: "Ruckus",
    status: "Live",
    description: "Wireless and campus networking procurement support.",
    categories: ["Networking"]
  },
  {
    slug: "cambium",
    name: "Cambium",
    status: "Live",
    description: "Connectivity and Wi-Fi expansion planning for business operations.",
    categories: ["Networking"]
  },
  {
    slug: "tp-link",
    name: "TP-Link",
    status: "Live",
    description: "Networking options for branch and SMB deployment needs.",
    categories: ["Networking"]
  },
  {
    slug: "molex",
    name: "Molex",
    status: "Live",
    description: "Structured cabling and passive networking outcomes.",
    categories: ["Networking"]
  }
];

export const PLACEHOLDER_BRAND_SLUGS: string[] = [];

export function getBrandBySlug(slug: string) {
  return BRAND_TILES.find((brand) => brand.slug === slug) ?? null;
}

export function getBrandsByCategory(category: BrandCategory) {
  return BRAND_TILES.filter((brand) => brand.categories.includes(category));
}
