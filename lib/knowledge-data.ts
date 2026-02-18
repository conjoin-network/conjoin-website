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
  lastVerified: string;
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
    slug: "microsoft-365-licensing-india-guide",
    title: "Microsoft 365 Licensing India Guide",
    description: "Procurement-first guide for Microsoft 365 licensing, seat planning, and renewal governance in India.",
    category: "Licensing Guides",
    tags: ["microsoft", "licensing", "india", "users", "seats", "renewals"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "microsoft-365-vs-google-workspace",
    title: "Microsoft 365 vs Google Workspace",
    description: "Decision framework for IT and procurement teams comparing collaboration suites, governance, and total cost.",
    category: "Licensing Guides",
    tags: ["microsoft", "google workspace", "comparison", "procurement", "tco"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "seqrite-endpoint-security-pricing",
    title: "Seqrite Endpoint Security Pricing Guide",
    description: "Planning guide for endpoint scope, deployment model, and commercial benchmarks for Seqrite programs.",
    category: "Compliance & Security",
    tags: ["seqrite", "endpoint", "pricing", "security", "renewals"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "it-procurement-checklist-india",
    title: "IT Procurement Checklist India",
    description: "Practical checklist for scope clarity, compliance evidence, and commercial controls before vendor finalization.",
    category: "Procurement / TCO",
    tags: ["procurement", "india", "tco", "compliance", "vendor evaluation"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "renewal-compliance-guide",
    title: "Renewal & Compliance Guide",
    description: "Framework for renewal calendars, support continuity, and compliance evidence across annual IT cycles.",
    category: "Renewals",
    tags: ["renewals", "compliance", "sla", "support", "governance"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "m365-business-vs-enterprise",
    title: "M365 Business vs Enterprise",
    description: "Comparison framework for procurement teams choosing the right Microsoft suite path.",
    category: "Licensing Guides",
    tags: ["microsoft", "m365", "business", "enterprise", "procurement"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "microsoft-licensing-basics",
    title: "Microsoft Licensing Basics",
    description: "Licensing primer for seat planning, commercial fit, and renewal hygiene.",
    category: "Licensing Guides",
    tags: ["microsoft", "licensing", "users", "seats", "renewals"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "cloud-migration-risk-mitigation",
    title: "Cloud Migration Risk Mitigation",
    description: "Framework for migration planning, rollback readiness, and commercial guardrails.",
    category: "Deployment Playbooks",
    tags: ["migration", "cloud", "risk", "microsoft", "deployment"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "microsoft-tenant-migration-checklist",
    title: "Microsoft Tenant Migration Checklist",
    description: "Checklist for tenant readiness, identity dependencies, and phased cutover governance.",
    category: "Deployment Playbooks",
    tags: ["microsoft", "tenant migration", "identity", "cutover", "deployment"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "edr-vs-antivirus",
    title: "EDR vs Antivirus",
    description: "Evaluation guide for detection maturity, risk exposure, and commercial alignment.",
    category: "Compliance & Security",
    tags: ["edr", "antivirus", "endpoint", "seqrite", "security"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "security-compliance-rfp-template",
    title: "Security Compliance RFP Template",
    description: "Template structure for compliance-ready security procurement requests.",
    category: "Compliance & Security",
    tags: ["security", "compliance", "rfp", "risk", "procurement"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "chandigarh-it-procurement-guide",
    title: "Chandigarh IT Procurement Guide",
    description: "Local guide for Chandigarh Tricity procurement and deployment planning.",
    category: "Chandigarh Tricity IT",
    tags: ["chandigarh", "mohali", "panchkula", "procurement", "north india"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "procurement-tco-checklist",
    title: "Procurement TCO Checklist",
    description: "Checklist for budgeting, lifecycle cost control, and vendor evaluation.",
    category: "Procurement / TCO",
    tags: ["tco", "procurement", "budget", "renewals", "it purchase"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "renewal-management-best-practices",
    title: "Renewal Management Best Practices",
    description: "Playbook for renewal governance, support continuity, and term planning.",
    category: "Renewals",
    tags: ["renewals", "governance", "support", "sla", "license management"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "rfq-template-it-purchase",
    title: "RFQ Template for IT Purchase Teams",
    description: "RFQ template for security, licensing, and procurement workflows with compliance clarity.",
    category: "Procurement / TCO",
    tags: ["rfq", "procurement", "tco", "it purchase", "compliance"],
    lastVerified: "2026-02-15"
  },
  {
    slug: "microsoft-365-pricing-india-chandigarh-buyers-guide",
    title: "Microsoft 365 Pricing in India (Chandigarh Buyers Guide)",
    description: "Commercial planning guide for Chandigarh buyers comparing Microsoft 365 plan pathways and renewal controls.",
    category: "Licensing Guides",
    tags: ["microsoft", "pricing india", "chandigarh", "procurement", "renewal"],
    lastVerified: "2026-02-18"
  },
  {
    slug: "business-premium-vs-standard-chandigarh-smb",
    title: "Business Premium vs Standard for SMBs in Chandigarh",
    description: "Decision guide for SMB leaders evaluating Premium vs Standard by risk, control, and commercial fit.",
    category: "Licensing Guides",
    tags: ["microsoft", "business premium", "business standard", "chandigarh", "smb"],
    lastVerified: "2026-02-18"
  },
  {
    slug: "endpoint-security-50-to-500-users-guide",
    title: "How to Choose Endpoint Security for 50–500 Users",
    description: "Framework for selecting endpoint controls, rollout depth, and renewal model for 50 to 500 user environments.",
    category: "Compliance & Security",
    tags: ["endpoint security", "50-500 users", "deployment", "renewals", "procurement"],
    lastVerified: "2026-02-18"
  },
  {
    slug: "seqrite-endpoint-schools-hospitals-punjab-haryana",
    title: "Seqrite Endpoint Protection for Schools and Hospitals (Punjab/Haryana)",
    description: "Operational and commercial guidance for schools and hospitals adopting Seqrite endpoint controls.",
    category: "Compliance & Security",
    tags: ["seqrite", "schools", "hospitals", "punjab", "haryana", "endpoint"],
    lastVerified: "2026-02-18"
  },
  {
    slug: "m365-migration-checklist-for-smbs",
    title: "M365 Migration Checklist for SMBs",
    description: "Migration readiness checklist covering identity, mailbox cutover, communications, and support handover.",
    category: "Deployment Playbooks",
    tags: ["m365", "migration", "smb", "checklist", "deployment"],
    lastVerified: "2026-02-18"
  },
  {
    slug: "it-procurement-playbook-chandigarh-smb",
    title: "IT Procurement Playbook for Chandigarh SMB Teams",
    description: "Procurement playbook for SMB buyers covering scope freeze, vendor evaluation, and renewal governance.",
    category: "Chandigarh Tricity IT",
    tags: ["it procurement", "chandigarh", "smb", "tco", "renewals"],
    lastVerified: "2026-02-18"
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
