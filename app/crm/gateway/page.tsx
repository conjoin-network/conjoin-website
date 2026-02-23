import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/app/components/Container";
import { getPortalSessionFromCookies, isAdminConfigured } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Conjoin CRM Gateway",
  description: "Secure access gateway for authorized CRM personnel.",
  robots: {
    index: false,
    follow: false
  }
};

const trustChips = ["TLS Enforced", "Role-based Access", "Audit Logs", "Partner-safe"];

export default async function CrmGatewayPage() {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  if (session) {
    redirect(session.isManagement ? "/admin/leads" : "/crm/leads");
  }

  const hasPortalCreds = isAdminConfigured();
  const microsoftSignInUrl = process.env.CRM_MICROSOFT_SSO_URL?.trim() || "";

  return (
    <div className="min-h-[calc(100vh-96px)] bg-[radial-gradient(circle_at_top,_#f1f5ff_0%,_#dbe4f6_55%,_#cbd5e6_100%)] py-10 md:py-16">
      <Container className="mx-auto max-w-4xl">
        <section className="rounded-3xl border border-slate-300/65 bg-white/85 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur md:p-10">
          <div className="grid gap-6 md:grid-cols-[140px_1fr] md:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 shadow-[0_18px_30px_-28px_rgba(15,23,42,0.6)] md:h-32 md:w-32">
              <Image
                src="/brand/conjoin-logo.png"
                alt="Conjoin Network"
                width={112}
                height={112}
                className="h-16 w-16 object-contain md:h-20 md:w-20"
                priority
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Internal Gateway</p>
                <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Conjoin CRM Gateway</h1>
                <p className="text-sm text-slate-600 md:text-base">Secure access for authorized personnel.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {trustChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={hasPortalCreds ? "/admin/login?next=%2Fadmin%2Fleads" : "/crm"}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(37,99,235,0.8)] transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                >
                  Continue to CRM
                </Link>
                {microsoftSignInUrl ? (
                  <Link
                    href={microsoftSignInUrl}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                  >
                    Sign in with Microsoft
                  </Link>
                ) : null}
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Need access?</p>
                <p>
                  Access is provisioned by CRM administrators. Contact your manager or use{" "}
                  <Link href="/crm/team" className="font-semibold text-blue-700 hover:underline">
                    Team onboarding
                  </Link>{" "}
                  for role assignment instructions.
                </p>
                <p>
                  <Link href="/admin/login" className="font-semibold text-blue-700 hover:underline">
                    Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
