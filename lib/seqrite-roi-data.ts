export type SeqriteRoiSlug =
  | "seqrite-endpoint-security"
  | "seqrite-edr-xdr"
  | "seqrite-email-security"
  | "seqrite-server-security"
  | "seqrite-enterprise-suite"
  | "seqrite-renewals";

export type SeqriteRoiPageData = {
  slug: SeqriteRoiSlug;
  title: string;
  description: string;
  h1: string;
  outcome: string;
  bestFor: string[];
  keyOutcomes: string[];
  deployment: string[];
  caseProof: string;
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ href: string; label: string }>;
};

export const SEQRITE_ROI_PAGES: SeqriteRoiPageData[] = [
  {
    slug: "seqrite-endpoint-security",
    title: "Seqrite Endpoint Security Chandigarh | Quote + Deployment Support",
    description:
      "Seqrite endpoint security Chandigarh page for purchase, rollout, and renewal with procurement-ready support.",
    h1: "Seqrite Endpoint Security Chandigarh",
    outcome: "Protect endpoints fast with deployment-ready policy baseline and renewal clarity.",
    bestFor: ["SMB teams with 25-300 devices", "Distributed branch users", "Compliance-aware operations"],
    keyOutcomes: [
      "Reduced malware risk with policy-led endpoint coverage",
      "Centralized management visibility for IT owners",
      "Renewal and add-on planning without service gaps"
    ],
    deployment: ["Typical rollout: 24-72 hrs", "Cloud or on-prem policy path", "Tricity support coordination"],
    caseProof: "Retail chain in Tricity standardized endpoint policy across stores and reduced unmanaged devices in one cycle.",
    faqs: [
      { question: "Is GST invoice provided?", answer: "Yes. GST-compliant quote and invoice are provided." },
      { question: "Is deployment included?", answer: "Yes. Deployment planning and baseline setup are included in scope." },
      { question: "Can we scale later?", answer: "Yes. Endpoints and add-ons can be expanded in phased renewals." }
    ],
    related: [
      { href: "/seqrite-renewals", label: "Seqrite Renewals" },
      { href: "/seqrite-edr-xdr", label: "Seqrite EDR/XDR" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "seqrite-edr-xdr",
    title: "Seqrite EDR XDR Chandigarh | Detection + Response Readiness",
    description: "Seqrite EDR/XDR advisory in Chandigarh for detection and response procurement planning.",
    h1: "Seqrite EDR / XDR Chandigarh",
    outcome: "Move from basic antivirus to response-aware endpoint security maturity.",
    bestFor: ["Security-conscious SMB and enterprise", "SOC-lite teams", "High-incident environments"],
    keyOutcomes: [
      "Improved threat visibility and triage flow",
      "Policy-backed endpoint response process",
      "Procurement alignment for long-term control"
    ],
    deployment: ["Phased rollout by risk group", "Response workflow handover", "Renewal continuity checkpoints"],
    caseProof: "Services enterprise improved incident response turnaround with staged EDR deployment and team enablement.",
    faqs: [
      { question: "Is GST invoice provided?", answer: "Yes. GST-ready billing and documentation are standard." },
      { question: "Is deployment included?", answer: "Yes. Response workflow mapping and rollout guidance are included." },
      { question: "Can we scale later?", answer: "Yes. EDR/XDR coverage can be expanded by endpoint groups." }
    ],
    related: [
      { href: "/seqrite-endpoint-security", label: "Endpoint Security" },
      { href: "/seqrite-enterprise-suite", label: "Enterprise Suite" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "seqrite-email-security",
    title: "Seqrite Email Security Chandigarh | Threat Protection for Business Mail",
    description: "Seqrite email security deployment and renewal support for Chandigarh business teams.",
    h1: "Seqrite Email Security Chandigarh",
    outcome: "Harden business email risk posture with policy-first deployment and ongoing coverage.",
    bestFor: ["Email-heavy teams", "Phishing risk exposure", "Compliance-driven communication workflows"],
    keyOutcomes: [
      "Reduced phishing and spam risk window",
      "Policy-driven mail protection controls",
      "Commercial clarity for renewals and add-ons"
    ],
    deployment: ["Fast policy setup", "Tenant-aligned handover", "Support continuity planning"],
    caseProof: "Regional business reduced repeated phishing incidents after policy realignment and staged enablement.",
    faqs: [
      { question: "Is GST invoice provided?", answer: "Yes. Quotes and invoices are GST-compliant." },
      { question: "Is deployment included?", answer: "Yes. Email security policy rollout is supported." },
      { question: "Can we scale later?", answer: "Yes. Controls can be expanded as mailbox footprint grows." }
    ],
    related: [
      { href: "/seqrite-endpoint-security", label: "Endpoint Security" },
      { href: "/seqrite-renewals", label: "Renewals" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "seqrite-server-security",
    title: "Seqrite Server Security Chandigarh | Workload Protection Planning",
    description: "Seqrite server security in Chandigarh for server workloads, compliance support, and renewals.",
    h1: "Seqrite Server Security Chandigarh",
    outcome: "Protect critical server workloads with deployment-safe policy controls and renewal governance.",
    bestFor: ["Application and file servers", "Hybrid infra teams", "Compliance-led workloads"],
    keyOutcomes: [
      "Server protection policy consistency",
      "Operational continuity during updates",
      "Predictable renewal and support pathway"
    ],
    deployment: ["Server inventory-led onboarding", "Policy staging by workload criticality", "Escalation-ready handover"],
    caseProof: "Manufacturing IT team aligned server protection scope with production-critical workloads and audit needs.",
    faqs: [
      { question: "Is GST invoice provided?", answer: "Yes. GST billing and documentation are supported." },
      { question: "Is deployment included?", answer: "Yes. Server inventory mapping and rollout planning are included." },
      { question: "Can we scale later?", answer: "Yes. Additional server nodes can be added in phased extensions." }
    ],
    related: [
      { href: "/seqrite-enterprise-suite", label: "Enterprise Suite" },
      { href: "/seqrite-renewals", label: "Renewals" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "seqrite-enterprise-suite",
    title: "Seqrite Enterprise Suite Chandigarh | Multi-layer Security Scope",
    description: "Seqrite enterprise suite planning in Chandigarh with procurement, rollout, and lifecycle support.",
    h1: "Seqrite Enterprise Suite Chandigarh",
    outcome: "Build an enterprise-grade endpoint security stack with procurement-led execution.",
    bestFor: ["Large endpoint estates", "Multi-site enterprise teams", "Security governance programs"],
    keyOutcomes: [
      "Unified policy and visibility for enterprise endpoints",
      "Role-based operational handover and support alignment",
      "Commercial control across yearly renewal cycles"
    ],
    deployment: ["Program-based rollout", "Cross-site policy governance", "Lifecycle health checkpoints"],
    caseProof: "Multi-site operations group moved to unified policy governance and reduced fragmented endpoint tooling.",
    faqs: [
      { question: "Is GST invoice provided?", answer: "Yes. Enterprise quote packs include GST-compliant invoicing." },
      { question: "Is deployment included?", answer: "Yes. Program rollout planning and team handover are supported." },
      { question: "Can we scale later?", answer: "Yes. Seat and feature expansion can be staged by business unit." }
    ],
    related: [
      { href: "/seqrite-endpoint-security", label: "Endpoint Security" },
      { href: "/seqrite-edr-xdr", label: "EDR/XDR" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  },
  {
    slug: "seqrite-renewals",
    title: "Seqrite Renewals Chandigarh | Fast Continuity + Add-on Planning",
    description: "Seqrite renewal support in Chandigarh for continuity, true-up planning, and add-on governance.",
    h1: "Seqrite Renewals Chandigarh",
    outcome: "Avoid coverage gaps with procurement-ready renewal operations and local response.",
    bestFor: ["Expiring subscriptions", "Growing endpoint volume", "Teams needing add-on planning"],
    keyOutcomes: [
      "No-lapse renewal continuity planning",
      "Seat and policy right-sizing before term close",
      "Commercial readiness for finance approvals"
    ],
    deployment: ["Same-day renewal response window", "Term continuity checks", "Add-on recommendation where required"],
    caseProof: "Finance-led buyer completed renewal and add-on scope validation in one cycle with zero lapse window.",
    faqs: [
      { question: "Is GST invoice provided?", answer: "Yes. GST invoice and renewal paperwork are included." },
      { question: "Is deployment included?", answer: "Yes. Renewal-linked policy and continuity checks are supported." },
      { question: "Can we scale later?", answer: "Yes. True-up and additional endpoint scope can be processed quickly." }
    ],
    related: [
      { href: "/seqrite-endpoint-security", label: "Endpoint Security" },
      { href: "/seqrite-enterprise-suite", label: "Enterprise Suite" },
      { href: "/request-quote", label: "Request Quote" }
    ]
  }
];

export function getSeqriteRoiPage(slug: string) {
  return SEQRITE_ROI_PAGES.find((entry) => entry.slug === slug);
}
