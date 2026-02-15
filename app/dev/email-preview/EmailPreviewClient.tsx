"use client";

import { useMemo, useState } from "react";
import {
  buildAdminActionTemplate,
  buildContactAcknowledgementTemplate,
  buildCustomerLeadTemplate,
  buildInternalLeadTemplate,
  buildSecurityVerificationTemplate,
  type EmailTemplate
} from "@/lib/emailTemplates";
import type { EmailTriggeredBy } from "@/lib/emailBrand";
import type { LeadRecord } from "@/lib/leads";

type PreviewItem = {
  id: string;
  label: string;
  template: EmailTemplate;
};

const sampleLead: LeadRecord = {
  leadId: "LD-20260214-1024",
  status: "NEW",
  priority: "WARM",
  score: 72,
  assignedTo: "Zeena",
  lastContactedAt: null,
  firstContactAt: null,
  firstContactBy: null,
  nextFollowUpAt: null,
  brand: "Microsoft",
  category: "Microsoft 365",
  tier: "Business Premium",
  qty: 120,
  delivery: "Cloud",
  plan: "Microsoft 365 Business Premium",
  usersSeats: 120,
  endpoints: null,
  servers: null,
  ciscoUsers: null,
  ciscoSites: null,
  budgetRange: undefined,
  addons: ["Defender for Business", "Intune"],
  otherBrand: undefined,
  city: "Chandigarh",
  source: "campaign-microsoft-365",
  sourcePage: "/campaigns/microsoft-365",
  utmSource: "google",
  utmCampaign: "m365-launch",
  utmMedium: "cpc",
  utmContent: "headline-a",
  utmTerm: "microsoft licensing quote",
  pagePath: "/request-quote?brand=Microsoft",
  referrer: "https://www.google.com/",
  timeline: "This Week",
  notes: "Needs migration planning and renewal governance.",
  activityNotes: [],
  contactName: "Amit Sharma",
  company: "Northline Manufacturing",
  email: "amit.sharma@example.com",
  phone: "9876543210",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function buildPreviewTemplates(triggeredBy: EmailTriggeredBy): PreviewItem[] {
  return [
    {
      id: "quote-internal",
      label: "Quote notification (internal)",
      template: buildInternalLeadTemplate(sampleLead)
    },
    {
      id: "quote-customer",
      label: "Quote received (customer)",
      template: buildCustomerLeadTemplate(sampleLead)
    },
    {
      id: "auth-magic-link",
      label: "Auth security email (magic link)",
      template: buildSecurityVerificationTemplate({
        title: "Sign in to Conjoin",
        actionUrl: "https://conjoinnetwork.com/auth/magic-link?token=sample",
        triggeredBy
      })
    },
    {
      id: "email-verification",
      label: "Email verification",
      template: buildSecurityVerificationTemplate({
        title: "Confirm your email",
        actionUrl: "https://conjoinnetwork.com/auth/verify-email?token=sample",
        triggeredBy
      })
    },
    {
      id: "contact-ack",
      label: "Contact acknowledgement",
      template: buildContactAcknowledgementTemplate({
        name: "Amit Sharma",
        requestTopic: "Microsoft renewal support"
      })
    },
    {
      id: "admin-action",
      label: "Admin action notification",
      template: buildAdminActionTemplate({
        title: "Your access level was updated",
        actionUrl: "https://conjoinnetwork.com/admin/leads"
      })
    }
  ];
}

export default function EmailPreviewClient() {
  const [triggeredBy, setTriggeredBy] = useState<EmailTriggeredBy>("user");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const templates = useMemo(() => buildPreviewTemplates(triggeredBy), [triggeredBy]);

  async function copyHtml(id: string, html: string) {
    try {
      await navigator.clipboard.writeText(html);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Role context preview:
          <span className="ml-1 font-semibold text-[var(--color-text-primary)]">{triggeredBy}</span>
        </p>
        <label className="text-sm text-[var(--color-text-secondary)]">
          Triggered by{" "}
          <select
            value={triggeredBy}
            onChange={(event) => setTriggeredBy(event.target.value as EmailTriggeredBy)}
            className="ml-2 min-h-10 rounded-lg border border-[var(--color-border)] bg-white px-3 text-[var(--color-text-primary)]"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
            <option value="system">system</option>
          </select>
        </label>
      </div>

      <div className="space-y-5">
        {templates.map((item) => (
          <article key={item.id} className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white p-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{item.label}</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">Subject: {item.template.subject}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  From: {item.template.fromName} • Reply-To: {item.template.replyTo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyHtml(item.id, item.template.html)}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-alt-bg)]"
              >
                {copiedId === item.id ? "Copied" : "Copy HTML"}
              </button>
            </header>
            <iframe
              title={`email-preview-${item.id}`}
              srcDoc={item.template.html}
              className="h-[520px] w-full rounded-xl border border-[var(--color-border)] bg-white"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
