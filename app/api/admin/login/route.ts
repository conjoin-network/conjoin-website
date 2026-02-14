import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createPortalSessionToken,
  getAdminSessionCookieOptions,
  isAdminConfigured,
  validatePortalCredentials
} from "@/lib/admin-session";
import { z } from "zod";
const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().trim().min(1, "Password is required.")
});

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Admin portal is not configured. Set OWNER_USER and OWNER_PASS." },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid credentials." }, { status: 400 });
  }

  const session = validatePortalCredentials(parsed.data.username, parsed.data.password);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createPortalSessionToken(session), getAdminSessionCookieOptions());
  return response;
}
