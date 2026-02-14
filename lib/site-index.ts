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
