import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "conjoin_admin_session";
const CRM_HOST = "crm.conjoinnetwork.com";
const CRM_GATEWAY_PATH = "/crm/gateway";

const adminNoCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff"
};

const crmSecurityHeaders = {
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "off",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Content-Security-Policy-Report-Only":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; upgrade-insecure-requests"
};

function withHeaders(response: NextResponse, options: { admin?: boolean; crm?: boolean }) {
  if (options.admin) {
    Object.entries(adminNoCacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  if (options.crm) {
    Object.entries(crmSecurityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

function isCrmHost(hostHeader: string | null) {
  const host = (hostHeader ?? "").split(":")[0].toLowerCase();
  return host === CRM_HOST;
}

function isCrmSurfacePath(pathname: string) {
  return (
    pathname === "/gateway" ||
    pathname === "/crm" ||
    pathname.startsWith("/crm/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/") ||
    pathname === "/api/health"
  );
}

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/apple-touch-icon.png" ||
    pathname.startsWith("/favicon-") ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/assets/")
  );
}

function withRequestContextHeaders(request: NextRequest, pathname = request.nextUrl.pathname) {
  const requestHeaders = new Headers(request.headers);
  const host = request.headers.get("host") ?? "";
  requestHeaders.set("x-conjoin-host", host);
  requestHeaders.set("x-conjoin-path", pathname);
  return requestHeaders;
}

function nextWithContext(request: NextRequest, pathname = request.nextUrl.pathname) {
  return NextResponse.next({
    request: {
      headers: withRequestContextHeaders(request, pathname),
    },
  });
}

function withAdminHeaders(response: NextResponse, isCrmRequest: boolean) {
  Object.entries(adminNoCacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (isCrmRequest) {
    Object.entries(crmSecurityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const crmRequest = isCrmHost(request.headers.get("host"));

  if (crmRequest) {
    if (pathname === "/robots.txt") {
      return withHeaders(
        new NextResponse("User-agent: *\nDisallow: /", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
        }),
        { crm: true }
      );
    }

    if (pathname === "/sitemap.xml") {
      return withHeaders(NextResponse.json({ ok: false, message: "Not available on this host." }, { status: 404 }), {
        crm: true
      });
    }

    if (pathname === "/" || pathname === "/index.html" || pathname === "/crm" || pathname === "/gateway") {
      return withHeaders(NextResponse.redirect(new URL(CRM_GATEWAY_PATH, request.url), 307), { crm: true });
    }

    if (!isCrmSurfacePath(pathname) && !isAssetPath(pathname) && !pathname.startsWith("/api/")) {
      const destination = new URL(pathname + request.nextUrl.search, "https://conjoinnetwork.com");
      return withHeaders(NextResponse.redirect(destination, 307), { crm: true });
    }
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) {
    return withHeaders(nextWithContext(request), { crm: crmRequest });
  }

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return withAdminHeaders(nextWithContext(request), crmRequest);
  }

  const hasConfiguredOwner = Boolean(
    (process.env.OWNER_USER?.trim() || process.env.ADMIN_USER?.trim() || "admin") &&
      (process.env.OWNER_PASS?.trim() || process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASS?.trim())
  );

  if (!hasConfiguredOwner) {
    if (isAdminApi) {
      return withAdminHeaders(
        NextResponse.json(
          { ok: false, message: "Admin portal is not configured. Set OWNER_USER and OWNER_PASS." },
          { status: 503 }
        ),
        crmRequest
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return withAdminHeaders(NextResponse.redirect(loginUrl), crmRequest);
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    if (isAdminApi) {
      return withAdminHeaders(NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }), crmRequest);
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return withAdminHeaders(NextResponse.redirect(loginUrl), crmRequest);
  }

  return withAdminHeaders(nextWithContext(request), crmRequest);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|favicon-16x16.png|favicon-32x32.png).*)"
  ]
};
