import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Container from "@/app/components/Container";
import AdminLoginClient from "@/app/admin/login/AdminLoginClient";
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminSessionToken } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Internal admin authentication portal.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLoginPage() {
  const configured = isAdminConfigured();
  if (configured) {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (isValidAdminSessionToken(token)) {
      redirect("/admin/leads");
    }
  }

  return (
    <div className="py-12 md:py-16">
      <Container className="mx-auto max-w-xl space-y-4">
        {configured ? (
          <AdminLoginClient />
        ) : (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl">Admin Not Configured</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Set portal credentials in environment variables (for example <code>CRM_ADMIN_EMAIL</code> and{" "}
              <code>CRM_ADMIN_PASSWORD</code>, or <code>OWNER_USER</code>/<code>OWNER_PASS</code>) to enable the admin portal.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
