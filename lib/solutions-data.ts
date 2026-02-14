import type { ServiceThemeKey } from "@/lib/brand/themes";

export type SolutionFaq = {
  question: string;
  answer: string;
};

export type SolutionLine = {
  key: ServiceThemeKey;
  slug: string;
  title: string;
  promise: string;
  heroTitle: string;
  heroSubtitle: string;
  trustBullets: [string, string, string];
  summaryBullets: [string, string, string];
  capabilities: string[];
  audience: string[];
  faqs: SolutionFaq[];
  quoteCategory: string;
  prefillBrand: "Microsoft" | "Seqrite" | "Cisco" | "Other";
};

export const SOLUTION_LINES: SolutionLine[] = [
  {
    key: "workspace",
    slug: "workspace",
    title: "Modern Workspace",
    promise: "Microsoft-led productivity, identity, and device governance for business teams.",
    heroTitle: "Workspace Solutions for Microsoft 365 and Managed Endpoint Productivity",
    heroSubtitle:
      "Plan mapping, rollout, and lifecycle support across Microsoft 365, Intune, and collaboration workflows.",
    trustBullets: ["Partner-led implementation", "Response < 30 mins", "Canada + India delivery"],
    summaryBullets: ["Plan advisory", "Migration alignment", "User lifecycle governance"],
    capabilities: [
      "Microsoft 365 subscription mapping by team profile",
      "Tenant readiness and migration planning",
      "Identity and access baseline (Entra + policy guardrails)",
      "Endpoint management alignment with Intune",
      "License renewal governance and reminders",
      "Post-deployment support for IT and procurement teams"
    ],
    audience: [
      "Growing businesses moving from fragmented tools to M365",
      "IT teams needing clean identity + endpoint ownership",
      "Procurement teams seeking cost-predictable subscription controls"
    ],
    faqs: [
      {
        question: "Can you help us choose between Business and Enterprise plans?",
        answer:
          "Yes. We map user roles, compliance needs, and expansion plans to recommend the right-fit Microsoft licensing path."
      },
      {
        question: "Do you support migrations and onboarding?",
        answer:
          "Yes. We design migration sequencing, rollout checkpoints, and handover steps for internal teams."
      },
      {
        question: "How is commercial governance handled?",
        answer:
          "We provide quote-led commercial proposals with renewal visibility and license management support."
      },
      {
        question: "Is this suitable for multi-location teams?",
        answer:
          "Yes. Workspace architecture and rollout are structured for distributed teams across offices and remote users."
      }
    ],
    quoteCategory: "Microsoft Workspace",
    prefillBrand: "Microsoft"
  },
  {
    key: "secure",
    slug: "secure",
    title: "Cybersecurity & Resilience",
    promise: "Endpoint, email, and backup-first defense with measurable policy outcomes.",
    heroTitle: "Secure Service Line for Endpoint, Email, and Data Protection Programs",
    heroSubtitle:
      "Security advisory and deployment for endpoint protection, EDR, backup resilience, and response readiness.",
    trustBullets: ["Partner-led implementation", "Response < 30 mins", "Canada + India delivery"],
    summaryBullets: ["Risk reduction", "Control visibility", "Operational resilience"],
    capabilities: [
      "Endpoint security baseline and policy rollout",
      "EDR/XDR readiness by threat profile and risk appetite",
      "Email security and anti-phishing hygiene",
      "Backup and recovery architecture planning",
      "Security posture review and renewal checkpoints",
      "Support handover for ongoing security operations"
    ],
    audience: [
      "Businesses needing better endpoint and email coverage",
      "Teams preparing for ransomware resilience",
      "Organizations improving compliance-ready security governance"
    ],
    faqs: [
      {
        question: "Do you support both cloud-managed and on-prem security stacks?",
        answer:
          "Yes. We align deployment mode to your infrastructure maturity, compliance demands, and team capacity."
      },
      {
        question: "Can this include existing tools and renewals?",
        answer:
          "Yes. We can include migration and renewal governance to avoid overlap and reduce commercial waste."
      },
      {
        question: "How quickly can support teams respond?",
        answer:
          "We prioritize first response in under 30 minutes during business hours, then align the escalation path."
      },
      {
        question: "Do you provide OEM-neutral recommendations?",
        answer:
          "Yes. We remain vendor-neutral and propose options based on requirements, compliance, and support needs."
      }
    ],
    quoteCategory: "Security & Endpoint",
    prefillBrand: "Seqrite"
  },
  {
    key: "network",
    slug: "network",
    title: "Network & Connectivity",
    promise: "Cisco-focused networking clarity from branch setup to core reliability.",
    heroTitle: "Network Solutions for Switching, Wi-Fi, Routing, and Secure Branch Connectivity",
    heroSubtitle:
      "Requirement-led architecture support for corporate networking, branch operations, and uptime-focused delivery.",
    trustBullets: ["Partner-led implementation", "Response < 30 mins", "Canada + India delivery"],
    summaryBullets: ["Reliable architecture", "Scale planning", "Lifecycle support"],
    capabilities: [
      "Network refresh planning and branch audit support",
      "Switching and Wi-Fi coverage design",
      "Routing and WAN planning for multi-site teams",
      "Segmentation and access policy advisory",
      "Implementation partner coordination and rollout control",
      "Commercial planning for renewals and scale upgrades"
    ],
    audience: [
      "Businesses opening new sites or consolidating branches",
      "IT teams improving uptime and performance baselines",
      "Procurement teams requiring predictable network lifecycle planning"
    ],
    faqs: [
      {
        question: "Do you handle branch network modernization?",
        answer:
          "Yes. We scope existing branch constraints and map upgrades with minimal operational disruption."
      },
      {
        question: "Can networking and security be quoted together?",
        answer:
          "Yes. We support multi-solution commercial proposals with clear ownership and phased delivery."
      },
      {
        question: "Do you support Wi-Fi and switching coverage planning?",
        answer:
          "Yes. Coverage, performance, and growth assumptions are included in design discussions."
      },
      {
        question: "Will proposals include support and renewal planning?",
        answer:
          "Yes. Proposals are structured for deployment plus ongoing support and renewal governance."
      }
    ],
    quoteCategory: "Networking & Connectivity",
    prefillBrand: "Cisco"
  },
  {
    key: "vision",
    slug: "vision",
    title: "Surveillance & Visibility",
    promise: "Camera, storage, and monitoring design for operations and compliance visibility.",
    heroTitle: "Vision Solutions for Surveillance, Monitoring, and Site-Wide Visibility",
    heroSubtitle:
      "Program-led surveillance planning for coverage, retention, operations control, and maintenance readiness.",
    trustBullets: ["Partner-led implementation", "Response < 30 mins", "Canada + India delivery"],
    summaryBullets: ["Coverage planning", "Retention clarity", "Operations visibility"],
    capabilities: [
      "Site audit and surveillance requirement discovery",
      "Camera and recording architecture guidance",
      "Storage retention and monitoring workflow planning",
      "VMS/NVR integration advisory",
      "Deployment sequencing with partner execution teams",
      "Post-rollout support and service continuity planning"
    ],
    audience: [
      "Multi-site businesses improving operational monitoring",
      "Facilities and compliance teams requiring audit-ready video retention",
      "Organizations upgrading from fragmented camera environments"
    ],
    faqs: [
      {
        question: "Can you advise without locking us to one OEM?",
        answer:
          "Yes. We evaluate fit by environment, support model, and commercial sustainability."
      },
      {
        question: "Do you support central monitoring rollout?",
        answer:
          "Yes. We map central visibility requirements and staged deployment to reduce downtime."
      },
      {
        question: "How do you handle expansion to new sites?",
        answer:
          "We standardize rollout templates so new branches inherit policy and monitoring consistency."
      },
      {
        question: "Is maintenance planning included?",
        answer:
          "Yes. We align maintenance and lifecycle checkpoints as part of delivery governance."
      }
    ],
    quoteCategory: "Surveillance & Vision",
    prefillBrand: "Other"
  },
  {
    key: "access",
    slug: "access",
    title: "Access Control & Attendance",
    promise: "Secure entry, identity controls, and attendance governance with deployment clarity.",
    heroTitle: "Access Solutions for Entry Control, Identity Events, and Attendance Workflows",
    heroSubtitle:
      "Policy-led access advisory spanning biometric devices, attendance mapping, and security governance.",
    trustBullets: ["Partner-led implementation", "Response < 30 mins", "Canada + India delivery"],
    summaryBullets: ["Entry governance", "Audit readiness", "Operational continuity"],
    capabilities: [
      "Access control requirement mapping by site and role",
      "Biometric and attendance integration advisory",
      "Policy design for privileged area access",
      "Event trail and reporting workflow planning",
      "Deployment readiness and partner coordination",
      "Support process design for long-term operations"
    ],
    audience: [
      "Organizations improving site-level access discipline",
      "HR and security teams aligning attendance and identity flows",
      "Businesses scaling access systems across multiple locations"
    ],
    faqs: [
      {
        question: "Can attendance and access be combined in one plan?",
        answer:
          "Yes. We design a combined approach where policy, reporting, and operational controls stay aligned."
      },
      {
        question: "Do you support phased rollouts?",
        answer:
          "Yes. We prioritize high-risk or high-volume areas first, then scale in controlled phases."
      },
      {
        question: "How are support expectations handled?",
        answer:
          "Support ownership and response expectations are defined in the proposal and onboarding checklist."
      },
      {
        question: "Can this integrate with existing infrastructure?",
        answer:
          "Yes. We assess current systems and propose the safest integration path with minimal disruption."
      }
    ],
    quoteCategory: "Access & Attendance",
    prefillBrand: "Other"
  }
];

export function getSolutionBySlug(slug: string) {
  return SOLUTION_LINES.find((item) => item.slug === slug) ?? null;
}
