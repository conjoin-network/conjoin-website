import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-session";
import { sendWhatsAppText } from "@/lib/whatsapp-api";

type SendPayload = {
  to?: string;
  text?: string;
};

function isProviderConfigured() {
  const token = process.env.WHATSAPP_TOKEN?.trim() || process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  return Boolean(token && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim());
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSessionToken(sessionToken)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isProviderConfigured()) {
    return NextResponse.json(
      { ok: false, message: "WhatsApp provider not configured." },
      { status: 503 }
    );
  }

  let payload: SendPayload;
  try {
    payload = (await request.json()) as SendPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const to = payload.to?.trim() ?? "";
  const text = payload.text?.trim() ?? "";
  if (!to || !text) {
    return NextResponse.json({ ok: false, message: "Both 'to' and 'text' are required." }, { status: 400 });
  }

  const result = await sendWhatsAppText(to, text);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.error ?? "Unable to send WhatsApp message." },
      { status: result.status }
    );
  }

  return NextResponse.json({ ok: true, messageId: result.messageId ?? null });
}
