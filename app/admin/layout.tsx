import { headers } from "next/headers";
import CrmAdminShell from "@/app/components/crm/CrmAdminShell";
import { isCrmHost } from "@/lib/server/host";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const host = headerStore.get("x-conjoin-host") ?? headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const path = headerStore.get("x-conjoin-path") ?? "/admin";
  const crmHost = isCrmHost(host);

  if (!crmHost || path.startsWith("/admin/login")) {
    return children;
  }

  return <CrmAdminShell currentPath={path}>{children}</CrmAdminShell>;
}
