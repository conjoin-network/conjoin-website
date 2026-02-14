import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "conjoin_admin_session";

const adminNoCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff"
};

function withAdminHeaders(response: NextResponse) {
  Object.entries(adminNoCacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return withAdminHeaders(NextResponse.next());
  }

  const hasConfiguredOwner = Boolean(
    (process.env.OWNER_USER?.trim() || process.env.ADMIN_USER?.trim() || "admin") &&
      (process.env.OWNER_PASS?.trim() || process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASS?.trim())
  );

  if (!hasConfiguredOwner) {
    return withAdminHeaders(new NextResponse("Not Found", { status: 404 }));
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    if (isAdminApi) {
      return withAdminHeaders(NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }));
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return withAdminHeaders(NextResponse.redirect(loginUrl));
  }

  return withAdminHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
