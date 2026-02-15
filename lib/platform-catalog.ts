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
  content: [
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
