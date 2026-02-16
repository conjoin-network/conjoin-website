import type { Metadata } from "next";
import Section from "@/app/components/Section";
import Card from "@/app/components/Card";
import { ButtonLink } from "@/app/components/Button";
import { buildMetadata } from "@/lib/seo";

const title = "Microsoft 365 vs Google Workspace | Conjoin Network";
const description =
  "A clear comparison of Microsoft 365 and Google Workspace for business email, apps, and security.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/compare/microsoft-365-vs-google-workspace"
});

export default function ComparePage() {
  return (
    <div>
      <Section>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-6xl">
            Microsoft 365 vs Google Workspace
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
            Compare core capabilities to pick the right platform.
          </p>
        </div>
      </Section>

      <Section>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                  <th className="py-3 pr-4 font-semibold">Criteria</th>
                  <th className="py-3 pr-4 font-semibold">Microsoft 365</th>
                  <th className="py-3 font-semibold">Google Workspace</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-text-secondary)]">
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">
                    Email & calendaring
                  </td>
                  <td className="py-3 pr-4">Exchange Online + Outlook</td>
                  <td className="py-3">Gmail + Google Calendar</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">
                    Office apps
                  </td>
                  <td className="py-3 pr-4">Desktop + web Office apps</td>
                  <td className="py-3">Web-first Google apps</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">
                    Security & compliance
                  </td>
                  <td className="py-3 pr-4">Security/compliance features depend on plan selection</td>
                  <td className="py-3">Security/compliance features depend on plan selection</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">
                    Admin controls
                  </td>
                  <td className="py-3 pr-4">Admin controls vary by licensing tier</td>
                  <td className="py-3">Admin controls vary by licensing tier</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">
                    Windows integration
                  </td>
                  <td className="py-3 pr-4">Integration approach depends on environment and selected SKU</td>
                  <td className="py-3">Integration approach depends on environment and selected SKU</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">
                    Collaboration
                  </td>
                  <td className="py-3 pr-4">Teams, SharePoint, OneDrive</td>
                  <td className="py-3">Meet, Chat, Drive</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-semibold text-[var(--color-text-primary)]">
                    Typical fit
                  </td>
                  <td className="py-3 pr-4">
                    Compliance-focused or desktop-heavy orgs
                  </td>
                  <td className="py-3">Cloud-first, lightweight IT teams</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <Section tone="alt">
        <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              Need a recommendation?
            </h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)] md:text-base">
              We map users, devices, and compliance needs.
            </p>
          </div>
          <ButtonLink href="/request-quote" variant="primary">
            Request a Quote
          </ButtonLink>
        </Card>
      </Section>
    </div>
  );
}
