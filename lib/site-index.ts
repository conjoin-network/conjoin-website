import { BRAND_TILES } from "@/lib/brands-data";
import { CATEGORY_PAGES } from "@/lib/categories-data";
import { KNOWLEDGE_ARTICLES } from "@/lib/knowledge-data";
import { LOCATION_PAGES } from "@/lib/locations-data";
import { PRODUCT_PAGES } from "@/lib/products-data";
import { SOLUTION_LINES } from "@/lib/solutions-data";

export type SiteIndexEntry = {
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: "Guides" | "Products" | "Locations";
};

const baseEntries: SiteIndexEntry[] = [
  {
    title: "Home",
    description: "Microsoft and cybersecurity subscriptions simplified for Indian businesses.",
    url: "/",
    tags: ["home", "microsoft", "seqrite", "licensing", "renewals"],
    category: "Guides"
  },
  {
    title: "Request Quote",
    description: "Quote wizard for Microsoft, Seqrite and Cisco/other OEM requirements.",
    url: "/request-quote",
    tags: ["quote", "lead", "procurement", "whatsapp"],
    category: "Guides"
  },
  {
    title: "Search",
    description: "Instant search across products, locations and knowledge pages.",
    url: "/search",
    tags: ["search", "index"],
    category: "Guides"
  },
  {
    title: "Contact",
    description: "Official sales and support contacts for Conjoin Network Private Limited.",
    url: "/contact",
    tags: ["contact", "sales", "support", "phone", "email"],
    category: "Guides"
  },
  {
    title: "Microsoft 365 Reseller Chandigarh",
    description: "Procurement-led Microsoft 365 reseller page for Chandigarh buyers.",
    url: "/microsoft-365-reseller-chandigarh",
    tags: ["microsoft", "reseller", "chandigarh", "licensing", "renewal"],
    category: "Guides"
  },
  {
    title: "Microsoft 365 Business Basic Chandigarh",
    description: "Business Basic commercial and deployment guide for Chandigarh teams.",
    url: "/microsoft-365-business-basic-chandigarh",
    tags: ["microsoft", "business basic", "chandigarh", "smb"],
    category: "Guides"
  },
  {
    title: "Microsoft 365 Business Standard Chandigarh",
    description: "Business Standard procurement and adoption pathway for Chandigarh organizations.",
    url: "/microsoft-365-business-standard-chandigarh",
    tags: ["microsoft", "business standard", "chandigarh", "procurement"],
    category: "Guides"
  },
  {
    title: "Microsoft 365 Business Premium Chandigarh",
    description: "Business Premium security-first licensing pathway for Chandigarh buyers.",
    url: "/microsoft-365-business-premium-chandigarh",
    tags: ["microsoft", "business premium", "chandigarh", "security"],
    category: "Guides"
  },
  {
    title: "M365 Business Basic Chandigarh",
    description: "High-conversion plan page with instant estimate for Microsoft 365 Business Basic.",
    url: "/m365-business-basic-chandigarh",
    tags: ["m365", "business basic", "pricing", "chandigarh"],
    category: "Guides"
  },
  {
    title: "M365 Business Standard Chandigarh",
    description: "Plan page for Microsoft 365 Business Standard with instant estimate and RFQ.",
    url: "/m365-business-standard-chandigarh",
    tags: ["m365", "business standard", "pricing", "chandigarh"],
    category: "Guides"
  },
  {
    title: "M365 Business Premium Chandigarh",
    description: "Microsoft 365 Business Premium page with security-led commercial scope.",
    url: "/m365-business-premium-chandigarh",
    tags: ["m365", "business premium", "security", "chandigarh"],
    category: "Guides"
  },
  {
    title: "M365 E3 Chandigarh",
    description: "Enterprise-focused Microsoft 365 E3 licensing page for Chandigarh.",
    url: "/m365-e3-chandigarh",
    tags: ["m365", "e3", "enterprise", "chandigarh"],
    category: "Guides"
  },
  {
    title: "M365 E5 Chandigarh",
    description: "Enterprise-focused Microsoft 365 E5 licensing page for Chandigarh.",
    url: "/m365-e5-chandigarh",
    tags: ["m365", "e5", "enterprise", "chandigarh"],
    category: "Guides"
  },
  {
    title: "Seqrite Endpoint Security",
    description: "Ad-aligned Seqrite endpoint security landing page with quick RFQ.",
    url: "/seqrite-endpoint-security",
    tags: ["seqrite", "endpoint security", "rfq", "chandigarh"],
    category: "Products"
  },
  {
    title: "Seqrite EDR XDR",
    description: "Seqrite EDR/XDR landing page with conversion-first lead flow.",
    url: "/seqrite-edr-xdr",
    tags: ["seqrite", "edr", "xdr", "rfq"],
    category: "Products"
  },
  {
    title: "Seqrite Email Security",
    description: "Seqrite email security procurement and deployment support page.",
    url: "/seqrite-email-security",
    tags: ["seqrite", "email security", "procurement"],
    category: "Products"
  },
  {
    title: "Seqrite Server Security",
    description: "Server security-focused Seqrite landing page for enterprise teams.",
    url: "/seqrite-server-security",
    tags: ["seqrite", "server security", "enterprise"],
    category: "Products"
  },
  {
    title: "Seqrite Enterprise Suite",
    description: "Enterprise suite page for unified Seqrite security programs.",
    url: "/seqrite-enterprise-suite",
    tags: ["seqrite", "enterprise suite", "security"],
    category: "Products"
  },
  {
    title: "Seqrite Renewals",
    description: "Renewal-focused Seqrite page with continuity and add-on planning.",
    url: "/seqrite-renewals",
    tags: ["seqrite", "renewal", "support"],
    category: "Products"
  },
  {
    title: "Endpoint Security Chandigarh",
    description: "Endpoint security deployment and renewal support for Chandigarh organizations.",
    url: "/endpoint-security-chandigarh",
    tags: ["endpoint security", "chandigarh", "renewal", "deployment"],
    category: "Guides"
  },
  {
    title: "Endpoint Security Panchkula",
    description: "Panchkula-focused endpoint protection and policy rollout guidance.",
    url: "/endpoint-security-panchkula",
    tags: ["endpoint security", "panchkula", "policy", "support"],
    category: "Guides"
  },
  {
    title: "Endpoint Security Mohali",
    description: "Mohali endpoint security procurement and lifecycle governance page.",
    url: "/endpoint-security-mohali",
    tags: ["endpoint security", "mohali", "procurement", "renewal"],
    category: "Guides"
  },
  {
    title: "IT Procurement Chandigarh",
    description: "Procurement-led IT programs across workspace, security, networking and access.",
    url: "/it-procurement-chandigarh",
    tags: ["it procurement", "chandigarh", "commercial", "delivery"],
    category: "Guides"
  },
  {
    title: "Privacy Policy",
    description: "Data handling, privacy commitments and customer contact rights.",
    url: "/privacy-policy",
    tags: ["privacy", "policy", "data"],
    category: "Guides"
  },
  {
    title: "Terms",
    description: "Commercial and service engagement terms for RFQ and project delivery.",
    url: "/terms",
    tags: ["terms", "commercial", "service"],
    category: "Guides"
  },
  {
    title: "Refund Policy",
    description: "Refund and cancellation policy for subscriptions and services.",
    url: "/refund-policy",
    tags: ["refund", "policy", "cancellation"],
    category: "Guides"
  },
  {
    title: "Campaign Microsoft 365",
    description: "Landing page for Microsoft 365 licensing and migration quote requests.",
    url: "/campaigns/microsoft-365",
    tags: ["campaign", "microsoft", "rfq", "licensing", "migration"],
    category: "Guides"
  },
  {
    title: "Campaign Seqrite Endpoint",
    description: "Landing page for Seqrite endpoint security quote requests.",
    url: "/campaigns/seqrite-endpoint",
    tags: ["campaign", "seqrite", "endpoint", "rfq", "security"],
    category: "Guides"
  },
  {
    title: "Campaign Cisco Security",
    description: "Landing page for Cisco security and networking category-first RFQs.",
    url: "/campaigns/cisco-security",
    tags: ["campaign", "cisco", "security", "networking", "rfq"],
    category: "Guides"
  },
  {
    title: "Locations Index",
    description: "Chandigarh Tricity and North India delivery coverage.",
    url: "/locations",
    tags: ["locations", "north india", "chandigarh", "mohali", "panchkula"],
    category: "Locations"
  },
  {
    title: "Products Index",
    description: "Endpoint security and control product solution pages.",
    url: "/products",
    tags: ["products", "endpoint", "edr", "dlp", "patch"],
    category: "Products"
  },
  {
    title: "Brands Hub",
    description: "Brand portfolio categories with available and coming-soon pathways.",
    url: "/brands",
    tags: ["brands", "security", "networking", "cloud", "collaboration"],
    category: "Guides"
  },
  {
    title: "Categories Index",
    description: "Category-wise IT procurement pathways mapped to live brands.",
    url: "/categories",
    tags: ["categories", "security", "networking", "cloud", "software", "datacenter"],
    category: "Guides"
  },
  {
    title: "Solutions Portfolio",
    description: "Service lines for workspace, secure, network, vision and access delivery.",
    url: "/solutions",
    tags: ["solutions", "workspace", "security", "networking", "surveillance", "access"],
    category: "Guides"
  },
  {
    title: "Commercial Model",
    description: "Quote-led commercial structure for licensing, services and implementation.",
    url: "/commercial",
    tags: ["commercial", "quote", "procurement", "implementation"],
    category: "Guides"
  },
  {
    title: "Knowledge Hub",
    description: "Index of licensing, security, procurement and renewal guides.",
    url: "/knowledge",
    tags: ["knowledge", "tco", "renewals", "compliance"],
    category: "Guides"
  },
  {
    title: "Microsoft Solutions",
    description: "Microsoft licensing, migration, security and support.",
    url: "/microsoft",
    tags: ["microsoft", "licensing", "migration", "security"],
    category: "Products"
  },
  {
    title: "Microsoft Business Plans",
    description: "Business-focused Microsoft plan pathways.",
    url: "/microsoft/business",
    tags: ["microsoft", "business", "users", "seats"],
    category: "Products"
  },
  {
    title: "Microsoft Enterprise Plans",
    description: "Enterprise-focused Microsoft plan pathways.",
    url: "/microsoft/enterprise",
    tags: ["microsoft", "enterprise", "e3", "e5"],
    category: "Products"
  },
  {
    title: "Microsoft Add-ons",
    description: "Microsoft add-on procurement pathways.",
    url: "/microsoft/addons",
    tags: ["microsoft", "add-ons", "security"],
    category: "Products"
  },
  {
    title: "Seqrite Solutions",
    description: "Seqrite endpoint security advisory.",
    url: "/seqrite",
    tags: ["seqrite", "endpoint", "renewal"],
    category: "Products"
  },
  {
    title: "Seqrite Cloud",
    description: "Cloud-managed endpoint protection pathways.",
    url: "/seqrite/cloud",
    tags: ["seqrite", "cloud", "endpoints"],
    category: "Products"
  },
  {
    title: "Seqrite On-Prem",
    description: "On-prem console endpoint protection pathways.",
    url: "/seqrite/on-prem",
    tags: ["seqrite", "on-prem", "servers"],
    category: "Products"
  },
  {
    title: "Seqrite EDR",
    description: "EDR-focused procurement and deployment advisory.",
    url: "/seqrite/edr",
    tags: ["seqrite", "edr", "endpoint"],
    category: "Products"
  },
  {
    title: "Cisco Solutions",
    description: "Cisco procurement advisory for networking, collaboration and security.",
    url: "/cisco",
    tags: ["cisco", "networking", "collaboration", "security"],
    category: "Products"
  },
  {
    title: "Cisco Collaboration",
    description: "Cisco collaboration procurement advisory page.",
    url: "/cisco/collaboration",
    tags: ["cisco", "collaboration"],
    category: "Products"
  },
  {
    title: "Cisco Networking",
    description: "Cisco networking procurement advisory page.",
    url: "/cisco/networking",
    tags: ["cisco", "networking"],
    category: "Products"
  },
  {
    title: "Cisco Security",
    description: "Cisco security procurement advisory page.",
    url: "/cisco/security",
    tags: ["cisco", "security"],
    category: "Products"
  }
];

const brandEntries: SiteIndexEntry[] = BRAND_TILES.map((brand) => ({
  title: `${brand.name} Brand Page`,
  description: brand.description,
  url: `/brands/${brand.slug}`,
  tags: [brand.name.toLowerCase(), ...brand.categories.map((item) => item.toLowerCase()), brand.status.toLowerCase()],
  category: brand.status === "Live" ? "Products" : "Guides"
}));

const categoryEntries: SiteIndexEntry[] = CATEGORY_PAGES.map((category) => ({
  title: `${category.name} Category`,
  description: category.description,
  url: `/categories/${category.slug}`,
  tags: ["category", category.name.toLowerCase(), "procurement", "rfq"],
  category: "Guides"
}));

const productEntries: SiteIndexEntry[] = PRODUCT_PAGES.map((product) => ({
  title: product.title,
  description: product.description,
  url: `/products/${product.slug}`,
  tags: ["products", product.slug.replace("-", " "), "security", "procurement"],
  category: "Products"
}));

const locationEntries: SiteIndexEntry[] = LOCATION_PAGES.map((location) => ({
  title: location.title,
  description: location.description,
  url: `/locations/${location.slug}`,
  tags: ["locations", location.name.toLowerCase(), "north india", "chandigarh tricity"],
  category: "Locations"
}));

const knowledgeEntries: SiteIndexEntry[] = KNOWLEDGE_ARTICLES.map((article) => ({
  title: article.title,
  description: article.description,
  url: `/knowledge/${article.slug}`,
  tags: article.tags,
  category: "Guides"
}));

const solutionEntries: SiteIndexEntry[] = SOLUTION_LINES.map((solution) => ({
  title: `${solution.title} Service Line`,
  description: solution.heroSubtitle,
  url: `/solutions/${solution.slug}`,
  tags: [solution.key, "service line", "quote-led", "procurement"],
  category: "Guides"
}));

export const SITE_INDEX: SiteIndexEntry[] = [
  ...baseEntries,
  ...brandEntries,
  ...categoryEntries,
  ...productEntries,
  ...locationEntries,
  ...knowledgeEntries,
  ...solutionEntries
];
