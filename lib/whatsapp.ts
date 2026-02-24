import { WHATSAPP_PHONE_NUMBER } from "@/lib/contact";

const PRIMARY_WHATSAPP_NUMBER = `91${WHATSAPP_PHONE_NUMBER}`;

function cleanPhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function toWaBase(numberOrUrl: string) {
  const trimmed = numberOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const digits = cleanPhone(trimmed);
  if (!digits) {
    return `https://wa.me/${PRIMARY_WHATSAPP_NUMBER}`;
  }

  return `https://wa.me/${digits}`;
}

function getPrimaryWhatsAppBase() {
  return `https://wa.me/${PRIMARY_WHATSAPP_NUMBER}`;
}

function getAgentWhatsAppBase(assignedTo?: string | null) {
  const owner = (assignedTo ?? "").trim();
  if (!owner) {
    return "";
  }

  const map: Record<string, string | undefined> = {
    Zeena: process.env.AGENT_WHATSAPP_ZEENA,
    Nidhi: process.env.AGENT_WHATSAPP_NIDHI,
    Rimpy: process.env.AGENT_WHATSAPP_RIMPY,
    Bharat: process.env.AGENT_WHATSAPP_BHARAT,
    Pardeep: process.env.AGENT_WHATSAPP_PARDEEP
  };

  const value = map[owner]?.trim();
  return value ? toWaBase(value) : "";
}

function withMessage(baseUrl: string, message: string) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}text=${encodeURIComponent(message)}`;
}

export function getWhatsAppLink(message: string) {
  return withMessage(getPrimaryWhatsAppBase(), message);
}

export function getLeadWhatsAppLink(input: { message: string; assignedTo?: string | null }) {
  const agentBase = getAgentWhatsAppBase(input.assignedTo);
  return withMessage(agentBase || getPrimaryWhatsAppBase(), input.message);
}

export function buildQuoteMessage(input: {
  brand?: string;
  city?: string;
  requirement?: string;
  qty?: string | number;
  timeline?: string;
}) {
  const brand = input.brand?.trim() || "General IT requirement";
  const city = input.city?.trim() || "Chandigarh";
  const requirement = input.requirement?.trim() || "General requirement";
  const qty = String(input.qty ?? "-").trim() || "-";
  const timeline = input.timeline?.trim() || "This Week";

  return `Hi Conjoin, I need a quote for ${brand} for ${city}. My requirement: ${requirement}. Timeline: ${timeline}. Seats/Qty: ${qty}.`;
}

export function getPrimaryWhatsAppNumber() {
  return PRIMARY_WHATSAPP_NUMBER;
}
