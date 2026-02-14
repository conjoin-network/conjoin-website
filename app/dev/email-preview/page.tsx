import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/app/components/Container";
import EmailPreviewClient from "@/app/dev/email-preview/EmailPreviewClient";

export const metadata: Metadata = {
  title: "Email Preview (Dev)",
  description: "Development-only preview for outbound Conjoin email templates.",
  robots: {
    index: false,
    follow: false
  }
};

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="py-10 md:py-14">
      <Container className="space-y-5">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl">Email Preview / QA</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Render all transactional templates with sample data and copy HTML for QA checks.
          </p>
        </header>
        <EmailPreviewClient />
      </Container>
    </div>
  );
}
