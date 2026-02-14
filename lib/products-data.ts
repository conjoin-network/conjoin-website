export type ProductPage = {
  slug: string;
  title: string;
  description: string;
  trust: string[];
  useCases: string[];
  outcomes: string[];
};

export const PRODUCT_PAGES: ProductPage[] = [
  {
    slug: "endpoint-security",
    title: "Endpoint Security Solutions",
    description: "Endpoint protection pathways for business devices with deployment and renewal governance.",
    trust: ["Policy-led rollout planning", "Compliance-ready commercial proposals", "Renewal continuity support"],
    useCases: ["Branch endpoint protection", "User device hardening", "Central policy control"],
    outcomes: ["Reduced endpoint risk", "Operational visibility", "Predictable renewal cadence"]
  },
  {
    slug: "edr",
    title: "EDR for Business Teams",
    description: "Threat detection and response readiness with procurement-friendly planning.",
    trust: ["Detection-response alignment", "Risk and TCO prioritization", "Post-sales support continuity"],
    useCases: ["Threat visibility", "Response workflow setup", "Alert governance"],
    outcomes: ["Faster response readiness", "Improved control maturity", "Lower incident impact"]
  },
  {
    slug: "dlp",
    title: "Data Loss Prevention",
    description: "Data movement controls for compliance-sensitive business environments.",
    trust: ["Policy-driven controls", "Commercially clear scope", "Lifecycle support"],
    useCases: ["Data movement policy", "Role-based control", "Audit-ready control mapping"],
    outcomes: ["Reduced leakage risk", "Stronger compliance posture", "Clear governance ownership"]
  },
  {
    slug: "patch-management",
    title: "Patch Management",
    description: "Patch lifecycle planning for lower exposure risk and predictable endpoint hygiene.",
    trust: ["Ring-based rollout planning", "Operational change windows", "Renewal continuity"],
    useCases: ["Patch ring design", "Backlog reduction", "Exception governance"],
    outcomes: ["Lower vulnerability exposure", "Better device hygiene", "Improved audit traceability"]
  },
  {
    slug: "device-control",
    title: "Device Control",
    description: "Port and peripheral control planning for stronger endpoint governance.",
    trust: ["Policy-first enforcement", "Use-case led deployment", "Procurement to support continuity"],
    useCases: ["USB policy controls", "Role-based access restrictions", "Peripheral governance"],
    outcomes: ["Lower data-risk exposure", "Higher policy compliance", "Consistent endpoint control"]
  }
];

export function getProductBySlug(slug: string) {
  return PRODUCT_PAGES.find((item) => item.slug === slug) ?? null;
}
