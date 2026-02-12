import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminCredentialsFromEnv, isAuthorizedBasicAuth } from "@/lib/admin-auth";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Conjoin Admin", charset="UTF-8"'
    }
  });
}

export function middleware(request: NextRequest) {
  const credentials = getAdminCredentialsFromEnv();
  if (!credentials) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const authHeader = request.headers.get("authorization");
  if (!isAuthorizedBasicAuth(authHeader, credentials)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
