import type { LeadRecord } from "@/lib/leads";
import { sendLeadNotification } from "@/lib/email";
import { sendWhatsAppText } from "@/lib/whatsapp-api";

type MessagingResult = {
  ok: boolean;
  reason?: string;
};

export async function sendWhatsApp(input: { message: string; to: string }): Promise<MessagingResult> {
  const provider = (process.env.WHATSAPP_PROVIDER ?? "").trim().toLowerCase();
  const providerEnabled = ["enabled", "cloud", "meta"].includes(provider);
  if (!providerEnabled) {
    console.info("WHATSAPP_NOOP", JSON.stringify({ to: input.to, message: input.message }));
    return { ok: false, reason: "WHATSAPP_PROVIDER disabled" };
  }

  const result = await sendWhatsAppText(input.to, input.message);
  if (!result.ok) {
    console.error("WHATSAPP_SEND_FAILED", JSON.stringify({ to: input.to, reason: result.error }));
    return { ok: false, reason: result.error ?? "WhatsApp send failed" };
  }

  console.info("WHATSAPP_SEND_OK", JSON.stringify({ to: input.to, messageId: result.messageId ?? "" }));
  return { ok: true };
}

export async function sendEmail(input: { lead: LeadRecord }): Promise<MessagingResult> {
  try {
    const result = await sendLeadNotification(input.lead);
    if (!result.sent) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "EMAIL_FALLBACK_QUEUE",
          JSON.stringify({ leadId: input.lead.leadId, reason: result.reason ?? "Email send failed" })
        );
      }
      return { ok: false, reason: result.reason ?? "Email send failed" };
    }
    return { ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown email error";
    return { ok: false, reason };
  }
}
