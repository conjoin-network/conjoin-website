import type { Metadata } from "next";
import { Accordion } from "@/src/components/ui/Accordion";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input, Textarea } from "@/src/components/ui/Input";
import { Tabs } from "@/src/components/ui/Tabs";
import { Toast } from "@/src/components/ui/Toast";
import Section from "@/app/components/Section";

export const metadata: Metadata = {
  title: "UI Kit",
  description: "Internal UI component preview for Conjoin design system.",
  robots: {
    index: false,
    follow: false
  }
};

export default function UiKitPage() {
  return (
    <div>
      <Section className="pb-10 pt-10 md:pb-14 md:pt-12">
        <h1 className="type-h1 text-[var(--color-text-primary)]">UI Kit</h1>
        <p className="type-body max-w-3xl">
          Internal preview of shared UI components used for enterprise procurement pages and lead workflows.
        </p>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="type-h2 text-[var(--color-text-primary)]">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </Card>
          <Card className="space-y-3">
            <h2 className="type-h2 text-[var(--color-text-primary)]">Badges</h2>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warn">Warn</Badge>
              <Badge tone="error">Error</Badge>
              <Badge tone="info">Info</Badge>
            </div>
          </Card>
        </div>
      </Section>

      <Section className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="type-h2 text-[var(--color-text-primary)]">Inputs</h2>
            <Input label="Company email" type="email" placeholder="name@company.com" hint="Business email only" />
            <Textarea label="Notes" placeholder="Requirement notes..." rows={3} />
          </Card>
          <Card className="space-y-3">
            <h2 className="type-h2 text-[var(--color-text-primary)]">Toasts</h2>
            <Toast tone="success" message="Lead created successfully." />
            <Toast tone="error" message="Please complete required fields." />
            <Toast tone="info" message="Response SLA is within 30 minutes during business hours." />
          </Card>
        </div>
      </Section>

      <Section tone="alt" className="py-10 md:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="type-h2 text-[var(--color-text-primary)]">Tabs</h2>
            <Tabs
              items={[
                { id: "pricing", label: "Commercial", content: <p className="text-sm">Quote-led commercial pathway.</p> },
                { id: "sla", label: "SLA", content: <p className="text-sm">Business-hours response within 30 minutes.</p> },
                { id: "renewals", label: "Renewals", content: <p className="text-sm">Renewal reminders and lifecycle continuity.</p> }
              ]}
            />
          </Card>
          <Card className="space-y-3">
            <h2 className="type-h2 text-[var(--color-text-primary)]">Accordion</h2>
            <Accordion
              items={[
                {
                  id: "a1",
                  title: "How is pricing finalized?",
                  content: "Final commercials depend on scope, eligibility and OEM licensing terms."
                },
                {
                  id: "a2",
                  title: "How fast is first response?",
                  content: "Target response is under 30 minutes during business hours."
                }
              ]}
            />
          </Card>
        </div>
      </Section>
    </div>
  );
}
