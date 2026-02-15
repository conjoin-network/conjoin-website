import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

type SeedBrand = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
};

type SeedProduct = {
  id: string;
  name: string;
  slug: string;
  brandSlug: string;
  category: string;
  deploymentTypes: string[];
  description: string;
  licenseModel: string;
  isPopular?: boolean;
};

type SeedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
};

type StatementRunner = {
  run: (...params: unknown[]) => unknown;
};

const brands: SeedBrand[] = [
  {
    id: "brand_microsoft",
    name: "Microsoft",
    slug: "microsoft",
    category: "Cloud & Productivity",
    description: "Licensing, migration, security and renewal support for Microsoft workloads."
  },
  {
    id: "brand_seqrite",
    name: "Seqrite",
    slug: "seqrite",
    category: "Security",
    description: "Endpoint security advisory across cloud and on-prem deployments."
  },
  {
    id: "brand_cisco",
    name: "Cisco",
    slug: "cisco",
    category: "Networking",
    description: "Category-first procurement for networking, security and collaboration."
  }
];

const products: SeedProduct[] = [
  {
    id: "prod_m365_basic",
    name: "Business Basic",
    slug: "microsoft-business-basic",
    brandSlug: "microsoft",
    category: "Microsoft 365",
    deploymentTypes: ["Cloud", "Hybrid"],
    description: "Core Microsoft 365 services for email and collaboration.",
    licenseModel: "Per user / seat subscription"
  },
  {
    id: "prod_m365_standard",
    name: "Business Standard",
    slug: "microsoft-business-standard",
    brandSlug: "microsoft",
    category: "Microsoft 365",
    deploymentTypes: ["Cloud", "Hybrid"],
    description: "Business productivity suite with desktop apps.",
    licenseModel: "Per user / seat subscription"
  },
  {
    id: "prod_m365_premium",
    name: "Business Premium",
    slug: "microsoft-business-premium",
    brandSlug: "microsoft",
    category: "Microsoft 365",
    deploymentTypes: ["Cloud", "Hybrid"],
    description: "Productivity with advanced security and device controls.",
    licenseModel: "Per user / seat subscription",
    isPopular: true
  },
  {
    id: "prod_m365_e3",
    name: "Enterprise E3",
    slug: "microsoft-enterprise-e3",
    brandSlug: "microsoft",
    category: "Microsoft 365",
    deploymentTypes: ["Cloud", "Hybrid"],
    description: "Enterprise productivity and security baseline.",
    licenseModel: "Per user / seat subscription"
  },
  {
    id: "prod_m365_e5",
    name: "Enterprise E5",
    slug: "microsoft-enterprise-e5",
    brandSlug: "microsoft",
    category: "Microsoft 365",
    deploymentTypes: ["Cloud", "Hybrid"],
    description: "Advanced enterprise security and compliance suite.",
    licenseModel: "Per user / seat subscription"
  },
  {
    id: "prod_seq_endpoint",
    name: "Endpoint Security",
    slug: "seqrite-endpoint-security",
    brandSlug: "seqrite",
    category: "Endpoint Protection",
    deploymentTypes: ["Cloud", "On-Prem", "Hybrid"],
    description: "Endpoint protection baseline for managed devices.",
    licenseModel: "Per endpoint annual subscription",
    isPopular: true
  },
  {
    id: "prod_seq_endpoint_cloud",
    name: "Endpoint Security Cloud",
    slug: "seqrite-endpoint-security-cloud",
    brandSlug: "seqrite",
    category: "Endpoint Protection",
    deploymentTypes: ["Cloud", "Hybrid"],
    description: "Cloud-managed endpoint controls and policy governance.",
    licenseModel: "Per endpoint annual subscription",
    isPopular: true
  },
  {
    id: "prod_seq_edr",
    name: "EDR",
    slug: "seqrite-edr",
    brandSlug: "seqrite",
    category: "Extended Detection",
    deploymentTypes: ["Cloud", "On-Prem", "Hybrid"],
    description: "Endpoint detection and response for incident workflows.",
    licenseModel: "Per endpoint annual subscription",
    isPopular: true
  },
  {
    id: "prod_seq_xdr",
    name: "XDR",
    slug: "seqrite-xdr",
    brandSlug: "seqrite",
    category: "Extended Detection",
    deploymentTypes: ["Cloud", "Hybrid"],
    description: "Cross-domain response model for broader telemetry coverage.",
    licenseModel: "Per endpoint / workload annual subscription"
  }
];

const articles: SeedArticle[] = [
  {
    id: "article_m365_basics",
    title: "Microsoft 365 licensing for SMB India",
    slug: "microsoft-licensing-basics",
    excerpt: "Licensing model basics for SMB procurement teams.",
    category: "Licensing Guides",
    tags: ["microsoft", "licensing", "smb"]
  },
  {
    id: "article_m365_compare",
    title: "Microsoft Business vs Enterprise quick guide",
    slug: "m365-business-vs-enterprise",
    excerpt: "Comparison framework for suite fit and governance.",
    category: "Licensing Guides",
    tags: ["microsoft", "business", "enterprise"]
  },
  {
    id: "article_seqrite_checklist",
    title: "Seqrite endpoint security checklist",
    slug: "seqrite-endpoint-security-checklist",
    excerpt: "Deployment and policy checklist for endpoint programs.",
    category: "Compliance & Security",
    tags: ["seqrite", "endpoint", "security"]
  }
];

const agents = [
  { id: "agent_zeena", name: "Zeena", label: "Zeena (Enterprise)", role: "SALES_AGENT" },
  { id: "agent_nidhi", name: "Nidhi", label: "Nidhi (End Customer)", role: "SALES_AGENT" },
  { id: "agent_girish", name: "Girish", label: "Girish (Calling Agent)", role: "CALLING_AGENT" }
];

const dataDir = path.join(process.cwd(), "data");
const dbPath = process.env.LEAD_DB_PATH?.trim() || path.join(dataDir, "crm-leads.sqlite");

function run() {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS catalog_brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      logo TEXT,
      description TEXT NOT NULL,
      meta_title TEXT NOT NULL,
      meta_desc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS catalog_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      brand_slug TEXT NOT NULL,
      category TEXT NOT NULL,
      deployment_types_json TEXT NOT NULL,
      pricing_json TEXT,
      features_json TEXT NOT NULL,
      description TEXT NOT NULL,
      license_model TEXT NOT NULL,
      is_popular INTEGER NOT NULL DEFAULT 0,
      meta_title TEXT NOT NULL,
      meta_desc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS catalog_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      meta_title TEXT NOT NULL,
      meta_desc TEXT NOT NULL,
      last_verified TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS catalog_agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      role TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );
  `);

  const brandStmt = db.prepare(`
    INSERT INTO catalog_brands (id, name, slug, category, logo, description, meta_title, meta_desc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      slug=excluded.slug,
      category=excluded.category,
      logo=excluded.logo,
      description=excluded.description,
      meta_title=excluded.meta_title,
      meta_desc=excluded.meta_desc
  `) as unknown as StatementRunner;
  const productStmt = db.prepare(`
    INSERT INTO catalog_products (
      id, name, slug, brand_slug, category, deployment_types_json, pricing_json, features_json,
      description, license_model, is_popular, meta_title, meta_desc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      slug=excluded.slug,
      brand_slug=excluded.brand_slug,
      category=excluded.category,
      deployment_types_json=excluded.deployment_types_json,
      pricing_json=excluded.pricing_json,
      features_json=excluded.features_json,
      description=excluded.description,
      license_model=excluded.license_model,
      is_popular=excluded.is_popular,
      meta_title=excluded.meta_title,
      meta_desc=excluded.meta_desc
  `) as unknown as StatementRunner;
  const articleStmt = db.prepare(`
    INSERT INTO catalog_articles (
      id, title, slug, excerpt, content, category, tags_json, published, published_at,
      meta_title, meta_desc, last_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      slug=excluded.slug,
      excerpt=excluded.excerpt,
      content=excluded.content,
      category=excluded.category,
      tags_json=excluded.tags_json,
      published=excluded.published,
      published_at=excluded.published_at,
      meta_title=excluded.meta_title,
      meta_desc=excluded.meta_desc,
      last_verified=excluded.last_verified
  `) as unknown as StatementRunner;
  const agentStmt = db.prepare(`
    INSERT INTO catalog_agents (id, name, label, role, is_active)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      label=excluded.label,
      role=excluded.role,
      is_active=excluded.is_active
  `) as unknown as StatementRunner;

  for (const brand of brands) {
    brandStmt.run(
      brand.id,
      brand.name,
      brand.slug,
      brand.category,
      `/brand/${brand.slug}.png`,
      brand.description,
      `${brand.name} enterprise procurement support`,
      `${brand.name} advisory for procurement, deployment and renewals.`
    );
  }

  for (const product of products) {
    productStmt.run(
      product.id,
      product.name,
      product.slug,
      product.brandSlug,
      product.category,
      JSON.stringify(product.deploymentTypes),
      null,
      JSON.stringify([product.description]),
      product.description,
      product.licenseModel,
      product.isPopular ? 1 : 0,
      `${product.name} procurement path`,
      `${product.name} advisory with deployment and compliance guidance.`
    );
  }

  for (const article of articles) {
    articleStmt.run(
      article.id,
      article.title,
      article.slug,
      article.excerpt,
      `${article.excerpt}\n\nDetailed editorial content is maintained in the knowledge hub.`,
      article.category,
      JSON.stringify(article.tags),
      1,
      "2026-02-14T00:00:00.000Z",
      article.title,
      article.excerpt,
      "2026-02-14"
    );
  }

  for (const agent of agents) {
    agentStmt.run(agent.id, agent.name, agent.label, agent.role, 1);
  }

  const brandCount = db.prepare("SELECT COUNT(*) AS total FROM catalog_brands").get() as { total: number };
  const productCount = db.prepare("SELECT COUNT(*) AS total FROM catalog_products").get() as { total: number };
  const articleCount = db.prepare("SELECT COUNT(*) AS total FROM catalog_articles").get() as { total: number };
  const agentCount = db.prepare("SELECT COUNT(*) AS total FROM catalog_agents").get() as { total: number };

  console.info(
    JSON.stringify(
      {
        ok: true,
        dbPath,
        brands: brandCount.total,
        products: productCount.total,
        articles: articleCount.total,
        agents: agentCount.total
      },
      null,
      2
    )
  );
}

run();
