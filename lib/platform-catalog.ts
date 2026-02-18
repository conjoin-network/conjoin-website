import { BRAND_TILES } from "./brands-data";
import { KNOWLEDGE_ARTICLES } from "./knowledge-data";
import { getBrandCategories, getRegistryBrands } from "./product-registry";

export type PlatformBrand = {
  id: string;
  name: string;
  slug: string;
  category: string;
  logo: string | null;
  description: string;
  metaTitle: string;
  metaDesc: string;
};

export type PlatformProduct = {
  id: string;
  name: string;
  slug: string;
  brandSlug: string;
  category: string;
  deploymentTypes: string[];
  pricingJson: Record<string, string | number> | null;
  featuresJson: string[];
  description: string;
  licenseModel: string;
  isPopular: boolean;
  metaTitle: string;
  metaDesc: string;
};

export type PlatformArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  metaTitle: string;
  metaDesc: string;
  lastVerified: string;
};

const ARTICLE_CONTENT_OVERRIDES: Record<string, string> = {
  "microsoft-365-pricing-india-chandigarh-buyers-guide": [
    "Chandigarh buyers should evaluate Microsoft 365 pricing through role segmentation, renewal windows, and security scope before comparing per-seat numbers.",
    "A practical approach is to split users into core collaboration roles, security-sensitive roles, and lightweight users. This creates a mixed plan strategy that controls cost while maintaining governance.",
    "Use procurement checkpoints for term length, onboarding scope, and support obligations so finance and IT can approve with confidence."
  ].join("\n\n"),
  "business-premium-vs-standard-chandigarh-smb": [
    "Premium versus Standard decisions should be based on risk exposure and control requirements, not only feature preference.",
    "Standard often fits productivity-heavy users, while Premium is commonly reserved for users handling higher security responsibilities.",
    "A blended allocation model typically improves commercial outcomes for SMB teams in Chandigarh and Tricity."
  ].join("\n\n"),
  "endpoint-security-50-to-500-users-guide": [
    "For 50 to 500 user environments, endpoint security planning should include deployment model, support ownership, and policy exception handling.",
    "Start with baseline coverage and role-aware policies, then phase advanced controls after rollout stability is confirmed.",
    "Renewal governance is critical: track entitlement usage, add-on impact, and support readiness before term-end."
  ].join("\n\n"),
  "seqrite-endpoint-schools-hospitals-punjab-haryana": [
    "Schools and hospitals in Punjab and Haryana need endpoint policies that balance strict protection with operational continuity.",
    "Program design should account for shared systems, shift-based operations, and segmented access expectations.",
    "Commercial planning should include renewal cycles aligned to academic and clinical operations."
  ].join("\n\n"),
  "m365-migration-checklist-for-smbs": [
    "SMB migration success depends on identity readiness, mailbox discovery, user communication, and support fallback ownership.",
    "Run phased cutover with checkpoint validation, and maintain a rollback-safe path during transition windows.",
    "Post-migration, verify security baseline and renewal governance so operational stability is preserved."
  ].join("\n\n"),
  "it-procurement-playbook-chandigarh-smb": [
    "A strong procurement playbook includes scope freeze, vendor fit criteria, lifecycle cost checks, and renewal controls.",
    "Chandigarh SMB teams should align procurement decisions to implementation ownership and support capacity from day one.",
    "Commercial clarity and execution governance together produce faster approvals and fewer post-purchase surprises."
  ].join("\n\n")
};

function buildId(prefix: string, value: string) {
  return `${prefix}_${value.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`;
}

export const PLATFORM_BRANDS: PlatformBrand[] = BRAND_TILES.map((brand) => ({
  id: buildId("brand", brand.slug),
  name: brand.name,
  slug: brand.slug,
  category: brand.categories[0] ?? "Enterprise Software",
  logo: `/brand/${brand.slug}.png`,
  description: brand.description,
  metaTitle: `${brand.name} solutions for IT procurement teams`,
  metaDesc: `${brand.name} procurement pathway focused on TCO, compliance, deployment and renewal governance.`
}));

export const PLATFORM_PRODUCTS: PlatformProduct[] = getRegistryBrands().flatMap((brandName) => {
  const categories = getBrandCategories(brandName);
  return categories.flatMap((category) =>
    category.products.map((product) => ({
      id: buildId("product", `${brandName}-${category.name}-${product.name}`),
      name: product.name,
      slug: `${brandName}-${product.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      brandSlug: brandName.toLowerCase(),
      category: category.name,
      deploymentTypes: product.deploymentOptions,
      pricingJson: null,
      featuresJson: [
        product.description,
        `License model: ${product.licenseModel}`,
        `Deployment: ${product.deploymentOptions.join(", ")}`
      ],
      description: product.description,
      licenseModel: product.licenseModel,
      isPopular: ["Business Premium", "Enterprise E3", "Endpoint Security Cloud", "EDR"].includes(product.name),
      metaTitle: `${product.name} | ${brandName} procurement path`,
      metaDesc: `${product.name} planning for IT and procurement teams with deployment, compliance and renewal clarity.`
    }))
  );
});

export const PLATFORM_ARTICLES: PlatformArticle[] = KNOWLEDGE_ARTICLES.map((article) => ({
  id: buildId("article", article.slug),
  title: article.title,
  slug: article.slug,
  excerpt: article.description,
  content:
    ARTICLE_CONTENT_OVERRIDES[article.slug] ??
    [
      "This enterprise guide is being expanded with official procurement checklists and implementation notes.",
      "It will include buying criteria, deployment prerequisites, and renewal risk controls.",
      "Use Request Quote for current commercial and solution advisory."
    ].join("\n\n"),
  category: article.category,
  tags: article.tags,
  published: true,
  publishedAt: `${article.lastVerified}T00:00:00.000Z`,
  metaTitle: article.title,
  metaDesc: article.description,
  lastVerified: article.lastVerified
}));

export function findPlatformBrand(slug: string) {
  return PLATFORM_BRANDS.find((brand) => brand.slug === slug) ?? null;
}

export function findPlatformProduct(slug: string) {
  return PLATFORM_PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export function findPlatformArticle(slug: string) {
  return PLATFORM_ARTICLES.find((article) => article.slug === slug) ?? null;
}
