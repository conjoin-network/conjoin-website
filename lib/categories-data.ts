import { BRAND_TILES, getBrandBySlug, type BrandTile } from "@/lib/brands-data";

export type CategoryPage = {
  slug:
    | "security"
    | "networking"
    | "cloud"
    | "collaboration"
    | "endpoint"
    | "datacenter"
    | "software"
    | "backup"
    | "servers-storage"
    | "pcs-laptops"
    | "printers";
  name: string;
  title: string;
  description: string;
  quoteCategory: string;
  brandSlugs: string[];
};

export const CATEGORY_PAGES: CategoryPage[] = [
  {
    slug: "security",
    name: "Security",
    title: "Security Solutions for IT & Procurement Teams",
    description:
      "Firewall, endpoint, EDR and risk control pathways with procurement-ready scope and compliance clarity.",
    quoteCategory: "Security",
    brandSlugs: [
      "seqrite",
      "cisco",
      "fortinet",
      "sophos",
      "sonicwall",
      "palo-alto",
      "trend-micro",
      "check-point",
      "barracuda",
      "splunk"
    ]
  },
  {
    slug: "networking",
    name: "Networking",
    title: "Networking Solutions for IT & Procurement Teams",
    description:
      "Switching, routing and Wi-Fi procurement pathways with deployment clarity and support continuity.",
    quoteCategory: "Networking",
    brandSlugs: ["cisco", "juniper", "aruba", "ruckus", "cambium", "tp-link", "molex", "sonicwall"]
  },
  {
    slug: "cloud",
    name: "Cloud",
    title: "Cloud Solutions for IT & Procurement Teams",
    description:
      "Cloud subscriptions and modernization pathways aligned to TCO visibility, governance and renewals.",
    quoteCategory: "Cloud",
    brandSlugs: [
      "microsoft",
      "microsoft-azure",
      "aws",
      "google-cloud",
      "ibm-cloud",
      "oracle-cloud",
      "vmware",
      "dell-apex",
      "salesforce"
    ]
  },
  {
    slug: "collaboration",
    name: "Collaboration",
    title: "Collaboration Solutions for IT & Procurement Teams",
    description:
      "Meetings, communication and workplace collaboration procurement pathways for business teams.",
    quoteCategory: "Collaboration",
    brandSlugs: ["microsoft", "cisco", "salesforce", "google-cloud"]
  },
  {
    slug: "endpoint",
    name: "Endpoint",
    title: "Endpoint & Device Solutions for IT & Procurement Teams",
    description:
      "Device standardization, endpoint security and lifecycle planning for distributed business teams.",
    quoteCategory: "Endpoint",
    brandSlugs: ["apple", "dell-technologies", "hp", "seqrite", "sophos", "trend-micro", "microsoft"]
  },
  {
    slug: "datacenter",
    name: "Data Center",
    title: "Data Center Solutions for IT & Procurement Teams",
    description:
      "Server, storage and resilience planning aligned to risk mitigation and continuity goals.",
    quoteCategory: "Data Center",
    brandSlugs: ["dell-technologies", "vmware", "veeam", "veritas", "rubrik", "dell-apex", "oracle", "ibm"]
  },
  {
    slug: "software",
    name: "Software",
    title: "Enterprise Software Solutions for IT & Procurement Teams",
    description:
      "License governance and renewal control for enterprise software and cloud subscriptions.",
    quoteCategory: "Software",
    brandSlugs: [
      "autodesk",
      "microsoft",
      "salesforce",
      "ibm",
      "oracle",
      "microfocus",
      "ptc",
      "red-hat",
      "sas",
      "splunk",
      "suse",
      "sap"
    ]
  },
  {
    slug: "backup",
    name: "Backup",
    title: "Backup & Recovery Solutions for IT & Procurement Teams",
    description:
      "Data protection procurement pathways with continuity and recovery-readiness outcomes.",
    quoteCategory: "Backup",
    brandSlugs: ["veeam", "veritas", "rubrik", "dell-technologies", "vmware"]
  },
  {
    slug: "servers-storage",
    name: "Servers & Storage",
    title: "Servers & Storage Solutions for IT & Procurement Teams",
    description:
      "Infrastructure procurement pathways with capacity planning and operational resilience.",
    quoteCategory: "Servers & Storage",
    brandSlugs: ["dell-technologies", "vmware", "veeam", "veritas", "rubrik", "dell-apex", "oracle", "ibm"]
  },
  {
    slug: "pcs-laptops",
    name: "PCs & Laptops",
    title: "PCs & Laptops Solutions for IT & Procurement Teams",
    description:
      "Endpoint fleet standardization with lifecycle governance and deployment support.",
    quoteCategory: "PCs & Laptops",
    brandSlugs: ["apple", "dell-technologies", "hp"]
  },
  {
    slug: "printers",
    name: "Printers",
    title: "Printing Solutions for IT & Procurement Teams",
    description:
      "Managed print procurement pathways with support continuity and renewal visibility.",
    quoteCategory: "Printing",
    brandSlugs: ["hp"]
  }
];

export function getCategoryBySlug(slug: string) {
  return CATEGORY_PAGES.find((category) => category.slug === slug) ?? null;
}

export function getCategoryBrands(category: CategoryPage): BrandTile[] {
  return category.brandSlugs
    .map((slug) => getBrandBySlug(slug))
    .filter((brand): brand is BrandTile => Boolean(brand));
}

export function getLiveCategoryBrands(slug: string): BrandTile[] {
  const category = getCategoryBySlug(slug);
  if (!category) {
    return [];
  }

  const brandMap = new Set(category.brandSlugs);
  return BRAND_TILES.filter((brand) => brandMap.has(brand.slug));
}
