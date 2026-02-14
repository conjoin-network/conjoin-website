export type LocationPage = {
  slug: string;
  name: string;
  title: string;
  description: string;
  trust: string[];
  coverage: string[];
};

export const NORTH_INDIA_REGIONS = [
  "Chandigarh",
  "Panchkula",
  "Mohali",
  "Haryana",
  "Punjab",
  "Himachal Pradesh",
  "Uttarakhand",
  "Jammu and Kashmir"
] as const;

export const LOCATION_PAGES: LocationPage[] = [
  {
    slug: "chandigarh",
    name: "Chandigarh",
    title: "Chandigarh IT Licensing & Security",
    description: "Microsoft, Seqrite and OEM procurement support for Chandigarh business teams.",
    trust: ["Procurement-first support", "Compliance-aware proposals", "Renewal continuity"],
    coverage: ["Licensing and migration advisory", "Security rollout support", "Commercial renewals governance"]
  },
  {
    slug: "panchkula",
    name: "Panchkula",
    title: "Panchkula IT Licensing & Security",
    description: "Quote-led IT procurement support for Panchkula organizations.",
    trust: ["Local support cadence", "Commercial clarity", "Lifecycle continuity"],
    coverage: ["Microsoft and security planning", "Endpoint and governance support", "Renewal management"]
  },
  {
    slug: "mohali",
    name: "Mohali",
    title: "Mohali IT Licensing & Security",
    description: "Procurement and deployment advisory for Mohali teams.",
    trust: ["Structured onboarding", "Compliance-ready proposals", "Support continuity"],
    coverage: ["Licensing fitment", "Security scope mapping", "Renewal reminders"]
  },
  {
    slug: "haryana",
    name: "Haryana",
    title: "Haryana IT Licensing & Security",
    description: "Regional delivery support across Haryana business environments.",
    trust: ["North India focus", "Outcome-led procurement", "Post-sales continuity"],
    coverage: ["Multi-branch rollouts", "Security and policy guidance", "Renewal governance"]
  },
  {
    slug: "punjab",
    name: "Punjab",
    title: "Punjab IT Licensing & Security",
    description: "Licensing and cybersecurity support across Punjab.",
    trust: ["Procurement clarity", "Compliance alignment", "Lifecycle support"],
    coverage: ["Business and enterprise advisory", "Deployment checkpoints", "Renewal management"]
  },
  {
    slug: "himachal",
    name: "Himachal",
    title: "Himachal IT Licensing & Security",
    description: "Remote-first advisory for licensing and security operations in Himachal.",
    trust: ["Remote coordination model", "Clear ownership", "Renewal continuity"],
    coverage: ["Plan-fit advisory", "Security hardening guidance", "Commercial support"]
  },
  {
    slug: "uttarakhand",
    name: "Uttarakhand",
    title: "Uttarakhand IT Licensing & Security",
    description: "Quote-led Microsoft and security advisory for Uttarakhand businesses.",
    trust: ["Outcome-first delivery", "Compliance-ready scope", "Support continuity"],
    coverage: ["Licensing roadmap", "Security deployment planning", "Renewal governance"]
  },
  {
    slug: "jammu-kashmir",
    name: "Jammu & Kashmir",
    title: "Jammu & Kashmir IT Licensing & Security",
    description: "Business procurement support for licensing and security operations.",
    trust: ["North region coordination", "Risk-aware planning", "Renewal lifecycle support"],
    coverage: ["Procurement support", "Deployment readiness", "Ongoing renewals coordination"]
  }
];

export function getLocationBySlug(slug: string) {
  return LOCATION_PAGES.find((item) => item.slug === slug) ?? null;
}
