import pricingConfig from "@/data/m365-plan-pricing.json";

export type M365RoiSlug =
  | "m365-business-basic-chandigarh"
  | "m365-business-standard-chandigarh"
  | "m365-business-premium-chandigarh"
  | "m365-e3-chandigarh"
  | "m365-e5-chandigarh";

export type M365RoiPlan = {
  slug: M365RoiSlug;
  title: string;
  description: string;
  h1: string;
  bestFor: string;
  monthlyLabel: string;
  annualLabel: string;
  responseBadge: string;
  highlights: string[];
  compareTitle: string;
  compareColumns: [string, string, string];
  compareRows: Array<[string, string, string]>;
  faqs: Array<{ question: string; answer: string }>;
  relatedPlans: Array<{ href: string; label: string }>;
};

type PricingTable = Record<M365RoiSlug, { monthlyPerUser: number }>;

const plans = pricingConfig.plans as PricingTable;

export const M365_PRICING = {
  currency: pricingConfig.currency,
  annualDiscountPercent: pricingConfig.annualDiscountPercent,
  plans
} as const;

export const M365_ROI_PLANS: M365RoiPlan[] = [
  {
    slug: "m365-business-basic-chandigarh",
    title: "M365 Business Basic Chandigarh | Instant Estimate + Local Deployment",
    description:
      "Microsoft 365 Business Basic in Chandigarh with fast licensing response, GST invoice, and deployment-ready support.",
    h1: "M365 Business Basic Chandigarh",
    bestFor: "Email, Teams, and cloud collaboration for lean teams.",
    monthlyLabel: "Starts at INR 145/user/month",
    annualLabel: "Annual commit lowers effective seat cost",
    responseBadge: "Response < 30 mins (business hours)",
    highlights: [
      "Entry plan for cost-sensitive teams",
      "Tenant setup + domain alignment",
      "Migration-ready onboarding checklist",
      "GST-compliant quote and invoice"
    ],
    compareTitle: "Compare Business Basic with adjacent plans",
    compareColumns: ["Plan", "Ideal Team", "Commercial Outcome"],
    compareRows: [
      ["Business Basic", "10-60 users", "Lowest entry cost for email + collaboration"],
      ["Business Standard", "40-200 users", "Adds richer productivity stack and app rights"],
      ["Business Premium", "Security-focused SMBs", "Adds stronger security + compliance controls"]
    ],
    faqs: [
      {
        question: "Is GST invoice provided?",
        answer: "Yes. Every quote and invoice is shared with GST-ready documentation."
      },
      {
        question: "Is deployment included?",
        answer: "Yes. Baseline setup and onboarding checklist support are included."
      },
      {
        question: "Can we scale later?",
        answer: "Yes. Seats and plan mix can be scaled as team roles evolve."
      }
    ],
    relatedPlans: [
      { href: "/m365-business-standard-chandigarh", label: "Business Standard" },
      { href: "/m365-business-premium-chandigarh", label: "Business Premium" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "m365-business-standard-chandigarh",
    title: "M365 Business Standard Chandigarh | Procurement-ready Licensing",
    description:
      "Microsoft 365 Business Standard in Chandigarh with fast commercial response, migration support, and GST billing.",
    h1: "M365 Business Standard Chandigarh",
    bestFor: "Growing teams needing desktop apps + collaboration continuity.",
    monthlyLabel: "Starts at INR 770/user/month",
    annualLabel: "Annual seat planning with cost control",
    responseBadge: "Response < 30 mins (business hours)",
    highlights: [
      "Balanced productivity + commercial control",
      "Role-based seat mapping support",
      "Migration wave planning for business teams",
      "Procurement-ready GST documentation"
    ],
    compareTitle: "Compare Business Standard with adjacent plans",
    compareColumns: ["Plan", "Ideal Team", "Commercial Outcome"],
    compareRows: [
      ["Business Basic", "Budget-first teams", "Lowest entry for cloud email + Teams"],
      ["Business Standard", "Growth-stage SMB", "Best value for app + collaboration mix"],
      ["Business Premium", "Security-sensitive teams", "Adds stronger policy and security controls"]
    ],
    faqs: [
      {
        question: "Is GST invoice provided?",
        answer: "Yes. GST-compliant quote and invoice support are standard."
      },
      {
        question: "Is deployment included?",
        answer: "Yes. Setup planning and migration support can be included in scope."
      },
      {
        question: "Can we scale later?",
        answer: "Yes. You can expand seats or move selected users to Premium/E3 later."
      }
    ],
    relatedPlans: [
      { href: "/m365-business-basic-chandigarh", label: "Business Basic" },
      { href: "/m365-business-premium-chandigarh", label: "Business Premium" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "m365-business-premium-chandigarh",
    title: "M365 Business Premium Chandigarh | Security-first Plan",
    description:
      "Microsoft 365 Business Premium in Chandigarh with security-first rollout, GST billing, and fast local support.",
    h1: "M365 Business Premium Chandigarh",
    bestFor: "SMBs requiring stronger security + compliance posture.",
    monthlyLabel: "Starts at INR 1320/user/month",
    annualLabel: "Annual procurement cycle with predictable renewals",
    responseBadge: "Response < 30 mins (business hours)",
    highlights: [
      "Identity and endpoint security baseline",
      "Mixed-plan commercial optimization",
      "Policy-driven deployment guidance",
      "GST invoice + compliance-ready quote"
    ],
    compareTitle: "Compare Business Premium with adjacent plans",
    compareColumns: ["Plan", "Ideal Team", "Commercial Outcome"],
    compareRows: [
      ["Business Standard", "Growth-focused SMB", "Balanced collaboration + app stack"],
      ["Business Premium", "Security-first SMB", "Adds advanced controls and hardening support"],
      ["Microsoft 365 E3", "Large enterprise teams", "Broader enterprise compliance pathway"]
    ],
    faqs: [
      {
        question: "Is GST invoice provided?",
        answer: "Yes. GST billing and commercial documentation are included."
      },
      {
        question: "Is deployment included?",
        answer: "Yes. Security baseline and rollout support are provided with scoped delivery."
      },
      {
        question: "Can we scale later?",
        answer: "Yes. Teams can grow seat count or transition selected users to E3/E5."
      }
    ],
    relatedPlans: [
      { href: "/m365-business-standard-chandigarh", label: "Business Standard" },
      { href: "/m365-e3-chandigarh", label: "Microsoft 365 E3" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "m365-e3-chandigarh",
    title: "M365 E3 Chandigarh | Enterprise Licensing + Deployment",
    description:
      "Microsoft 365 E3 in Chandigarh for enterprise users with procurement-ready quotes, deployment support, and renewal continuity.",
    h1: "M365 E3 Chandigarh",
    bestFor: "Enterprise teams requiring advanced compliance and governance controls.",
    monthlyLabel: "Starts at INR 3180/user/month",
    annualLabel: "Annual enterprise contract optimization",
    responseBadge: "Response < 30 mins (business hours)",
    highlights: [
      "Enterprise governance and compliance alignment",
      "Role-based E3 seat planning",
      "Migration and deployment sequencing",
      "GST invoice and commercial audit readiness"
    ],
    compareTitle: "Compare E3 with adjacent plans",
    compareColumns: ["Plan", "Ideal Team", "Commercial Outcome"],
    compareRows: [
      ["Business Premium", "Security-focused SMB", "Advanced controls with SMB-oriented footprint"],
      ["Microsoft 365 E3", "Enterprise operations", "Balanced enterprise compliance + management"],
      ["Microsoft 365 E5", "High-control enterprise", "Extended security/analytics stack"]
    ],
    faqs: [
      {
        question: "Is GST invoice provided?",
        answer: "Yes. Enterprise quote packs include GST-compliant invoicing."
      },
      {
        question: "Is deployment included?",
        answer: "Yes. Enterprise rollout and migration planning are part of scoped delivery."
      },
      {
        question: "Can we scale later?",
        answer: "Yes. Additional users and E5 upgrades can be handled as requirements evolve."
      }
    ],
    relatedPlans: [
      { href: "/m365-business-premium-chandigarh", label: "Business Premium" },
      { href: "/m365-e5-chandigarh", label: "Microsoft 365 E5" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "m365-e5-chandigarh",
    title: "M365 E5 Chandigarh | Advanced Security + Enterprise Controls",
    description:
      "Microsoft 365 E5 in Chandigarh for high-control enterprise security and compliance programs with procurement-ready execution.",
    h1: "M365 E5 Chandigarh",
    bestFor: "Enterprises prioritizing advanced security, risk, and analytics controls.",
    monthlyLabel: "Starts at INR 5140/user/month",
    annualLabel: "Annual enterprise procurement planning",
    responseBadge: "Response < 30 mins (business hours)",
    highlights: [
      "Advanced security and risk management scope",
      "Enterprise-grade compliance posture mapping",
      "Role-based E5 allocation guidance",
      "GST invoice and procurement-friendly documentation"
    ],
    compareTitle: "Compare E5 with adjacent plans",
    compareColumns: ["Plan", "Ideal Team", "Commercial Outcome"],
    compareRows: [
      ["Microsoft 365 E3", "Enterprise baseline", "Broad enterprise productivity + governance"],
      ["Microsoft 365 E5", "Security-led enterprise", "Highest control and analytics pathway"],
      ["Mixed E3 + E5", "Role-segmented orgs", "Commercial optimization by user profile"]
    ],
    faqs: [
      {
        question: "Is GST invoice provided?",
        answer: "Yes. GST-compliant enterprise quote and invoice documents are provided."
      },
      {
        question: "Is deployment included?",
        answer: "Yes. Advanced rollout, policy and handover planning are supported."
      },
      {
        question: "Can we scale later?",
        answer: "Yes. You can adjust seat mix and expand with staged governance."
      }
    ],
    relatedPlans: [
      { href: "/m365-e3-chandigarh", label: "Microsoft 365 E3" },
      { href: "/m365-business-premium-chandigarh", label: "Business Premium" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  }
];

export function getM365RoiPlan(slug: string) {
  return M365_ROI_PLANS.find((plan) => plan.slug === slug);
}
