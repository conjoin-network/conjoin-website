import { NextResponse } from "next/server";
import { patchLead, readLeads } from "@/lib/leads";
import { extractInboundWhatsAppMessages, normalizeWhatsAppNumber } from "@/lib/whatsapp-api";

function normalizePhoneForMatch(value: string) {
  const normalized = normalizeWhatsAppNumber(value);
  if (normalized.length <= 10) {
    return normalized;
  }
  return normalized.slice(-10);
}

function resolveVerifyToken() {
  return process.env.WHATSAPP_VERIFY_TOKEN?.trim() ?? "";
}

export async function GET(request: Request) {
  const verifyToken = resolveVerifyToken();
  if (!verifyToken) {
    return NextResponse.json(
      { ok: false, message: "WHATSAPP_VERIFY_TOKEN not configured." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: false, message: "Webhook verification failed." }, { status: 403 });
}

export async function POST(request: Request) {
  const verifyToken = resolveVerifyToken();
  if (!verifyToken) {
    return NextResponse.json(
      { ok: false, message: "WHATSAPP_VERIFY_TOKEN not configured." },
      { status: 503 }
    );
  }

  const payload = (await request.json().catch(() => null)) as unknown;
  const incoming = extractInboundWhatsAppMessages(payload);
  if (incoming.length === 0) {
    return NextResponse.json({ ok: true, received: 0, matched: 0 });
  }

  const leads = await readLeads();
  let matchedCount = 0;

  for (const message of incoming) {
    const incomingPhone = normalizePhoneForMatch(message.from);
    if (!incomingPhone) {
      continue;
    }

    const match = leads.find((lead) => normalizePhoneForMatch(String(lead.phone ?? "")) === incomingPhone);
    if (!match) {
      continue;
    }

    matchedCount += 1;
    await patchLead(match.leadId, {
      markContacted: true,
      actor: "WhatsApp Webhook",
      note: `Inbound WhatsApp (${message.messageId}): ${message.text}`
    });
  }

  return NextResponse.json({ ok: true, received: incoming.length, matched: matchedCount });
}
