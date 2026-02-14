export type WhatsAppSendResult = {
  ok: boolean;
  status: number;
  provider: "meta";
  messageId?: string;
  error?: string;
};

export type InboundWhatsAppMessage = {
  from: string;
  text: string;
  messageId: string;
  receivedAt: string;
};

function cleanDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function normalizeWhatsAppNumber(value: string) {
  const digits = cleanDigits(value);
  if (!digits) {
    return "";
  }

  if (digits.length >= 11) {
    return digits;
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

export function isWhatsAppConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim());
}

export async function sendWhatsAppText(to: string, text: string): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  if (!token || !phoneNumberId) {
    return {
      ok: false,
      status: 503,
      provider: "meta",
      error: "WhatsApp credentials missing."
    };
  }

  const normalizedTo = normalizeWhatsAppNumber(to);
  if (!normalizedTo) {
    return {
      ok: false,
      status: 400,
      provider: "meta",
      error: "Invalid WhatsApp recipient."
    };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizedTo,
        type: "text",
        text: {
          preview_url: false,
          body: text
        }
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        provider: "meta",
        error: payload.error?.message || "WhatsApp API request failed."
      };
    }

    return {
      ok: true,
      status: response.status,
      provider: "meta",
      messageId: payload.messages?.[0]?.id
    };
  } catch {
    return {
      ok: false,
      status: 500,
      provider: "meta",
      error: "Unable to reach WhatsApp API."
    };
  }
}

function asObject(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function extractInboundWhatsAppMessages(payload: unknown): InboundWhatsAppMessage[] {
  const root = asObject(payload);
  if (!root || !Array.isArray(root.entry)) {
    return [];
  }

  const collected: InboundWhatsAppMessage[] = [];
  for (const entryItem of root.entry) {
    const entry = asObject(entryItem);
    if (!entry || !Array.isArray(entry.changes)) {
      continue;
    }

    for (const changeItem of entry.changes) {
      const change = asObject(changeItem);
      const value = asObject(change?.value);
      const messages = value?.messages;
      if (!Array.isArray(messages)) {
        continue;
      }

      for (const messageItem of messages) {
        const message = asObject(messageItem);
        if (!message) {
          continue;
        }

        const from = asString(message.from);
        const messageId = asString(message.id);
        const textNode = asObject(message.text);
        const text = asString(textNode?.body).trim();
        if (!from || !text) {
          continue;
        }

        collected.push({
          from,
          text,
          messageId: messageId || `wa-${Date.now()}`,
          receivedAt: new Date().toISOString()
        });
      }
    }
  }

  return collected;
}
