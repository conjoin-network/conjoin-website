import Link from "next/link";
import { cookies } from "next/headers";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import CrmBackButton from "@/app/components/crm/CrmBackButton";
import { getPortalSessionFromCookies } from "@/lib/admin-session";

type CrmAdminShellProps = {
  currentPath: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin", label: "Console Home" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/scoreboard", label: "Scoreboard" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/events", label: "Events" }
];

function isActivePath(currentPath: string, href: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function breadcrumbLabel(pathname: string) {
  if (pathname === "/admin") return "Console Home";
  if (pathname.startsWith("/admin/leads")) return "Leads";
  if (pathname.startsWith("/admin/pipeline")) return "Pipeline";
  if (pathname.startsWith("/admin/agents")) return "Agents";
  if (pathname.startsWith("/admin/scoreboard")) return "Scoreboard";
  if (pathname.startsWith("/admin/messages")) return "Messages";
  if (pathname.startsWith("/admin/events")) return "Events";
  if (pathname.startsWith("/admin/login")) return "Login";
  return "Admin";
}

export default async function CrmAdminShell({ currentPath, children }: CrmAdminShellProps) {
  const cookieStore = await cookies();
  const session = getPortalSessionFromCookies(cookieStore);
  const canShowQuickLinks = Boolean(session);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden h-screen border-r border-slate-800 bg-slate-950/95 px-4 py-5 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Conjoin CRM</p>
          <p className="mt-1 text-sm text-slate-300">Corporate Gateway</p>
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const active = isActivePath(currentPath, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition",
                    active ? "bg-blue-500/20 text-blue-100" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CrmBackButton fallbackHref="/admin" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">CRM</span>
                  <span className="mx-1 text-slate-500">/</span>
                  <span>{breadcrumbLabel(currentPath)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {session ? (
                  <span className="inline-flex min-h-9 items-center rounded-full border border-slate-700 px-3 text-xs font-semibold text-slate-200">
                    {session.displayName} • {session.role}
                  </span>
                ) : null}
                <AdminLogoutButton redirectTo="/crm/gateway" />
              </div>
            </div>

            {canShowQuickLinks ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 lg:hidden">
                {navItems.map((item) => {
                  const active = isActivePath(currentPath, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold transition",
                        active
                          ? "border-blue-500/50 bg-blue-500/15 text-blue-100"
                          : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </header>

          <main className="flex-1 px-4 py-4 md:px-6 md:py-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
