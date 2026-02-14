export type KnowledgeCategory =
  | "Licensing Guides"
  | "Compliance & Security"
  | "Procurement / TCO"
  | "Renewals"
  | "Deployment Playbooks"
  | "Chandigarh Tricity IT";

export type KnowledgeArticle = {
  slug: string;
  title: string;
  description: string;
  category: KnowledgeCategory;
  tags: string[];
};

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  "Licensing Guides",
  "Compliance & Security",
  "Procurement / TCO",
  "Renewals",
  "Deployment Playbooks",
  "Chandigarh Tricity IT"
];

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    slug: "microsoft-licensing-basics",
    title: "Microsoft Licensing Basics",
    description: "Coming soon licensing primer for seat planning, commercial fit and renewal hygiene.",
    category: "Licensing Guides",
    tags: ["microsoft", "licensing", "users", "seats", "renewals"]
  },
  {
    slug: "m365-business-vs-enterprise",
    title: "M365 Business vs Enterprise",
    description: "Coming soon comparison framework for procurement teams choosing the right suite path.",
    category: "Licensing Guides",
    tags: ["microsoft", "m365", "business", "enterprise", "procurement"]
  },
  {
    slug: "edr-vs-antivirus",
    title: "EDR vs Antivirus",
    description: "Coming soon guide to evaluate detection maturity, risk exposure and commercial alignment.",
    category: "Compliance & Security",
    tags: ["edr", "antivirus", "endpoint", "seqrite", "security"]
  },
  {
    slug: "procurement-tco-checklist",
    title: "Procurement TCO Checklist",
    description: "Coming soon checklist for budgeting, lifecycle cost control and vendor evaluation.",
    category: "Procurement / TCO",
    tags: ["tco", "procurement", "budget", "renewals", "it purchase"]
  },
  {
    slug: "renewal-management-best-practices",
    title: "Renewal Management Best Practices",
    description: "Coming soon playbook for renewal governance, support continuity and term planning.",
    category: "Renewals",
    tags: ["renewals", "governance", "support", "sla", "license management"]
  },
  {
    slug: "security-compliance-rfp-template",
    title: "Security Compliance RFP Template",
    description: "Coming soon template structure for compliance-ready security procurement requests.",
    category: "Compliance & Security",
    tags: ["security", "compliance", "rfp", "risk", "procurement"]
  },
  {
    slug: "chandigarh-it-procurement-guide",
    title: "Chandigarh IT Procurement Guide",
    description: "Coming soon local guide for Chandigarh Tricity procurement and deployment planning.",
    category: "Chandigarh Tricity IT",
    tags: ["chandigarh", "mohali", "panchkula", "procurement", "north india"]
  },
  {
    slug: "cloud-migration-risk-mitigation",
    title: "Cloud Migration Risk Mitigation",
    description: "Coming soon framework for migration planning, rollback readiness and commercial guardrails.",
    category: "Deployment Playbooks",
    tags: ["migration", "cloud", "risk", "microsoft", "deployment"]
  }
];

export function getKnowledgeBySlug(slug: string) {
  return KNOWLEDGE_ARTICLES.find((article) => article.slug === slug) ?? null;
}

export function getKnowledgeByCategory(category: KnowledgeCategory) {
  return KNOWLEDGE_ARTICLES.filter((article) => article.category === category);
}

export function getRelatedKnowledge(tags: string[], limit = 3, excludeSlug?: string) {
  const needle = new Set(tags.map((tag) => tag.toLowerCase()));

  return KNOWLEDGE_ARTICLES
    .filter((article) => article.slug !== excludeSlug)
    .map((article) => {
      const score = article.tags.reduce((count, tag) => count + (needle.has(tag.toLowerCase()) ? 1 : 0), 0);
      return { article, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.article.title.localeCompare(b.article.title);
    })
    .slice(0, limit)
    .map((item) => item.article);
}
