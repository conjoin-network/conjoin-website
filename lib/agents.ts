export type AgentOption = {
  name: string;
  label: string;
  role: "CALLING_AGENT" | "SALES_AGENT" | "TECH_SUPPORT";
};

export const AGENT_OPTIONS: AgentOption[] = [
  { name: "Girish", label: "Girish (Calling Agent)", role: "CALLING_AGENT" },
  { name: "Kiran", label: "Kiran (Executive Technical Support Engineer)", role: "TECH_SUPPORT" },
  { name: "Rimpy", label: "Rimpy (Dealer)", role: "SALES_AGENT" },
  { name: "Nidhi", label: "Nidhi (End Customer)", role: "SALES_AGENT" },
  { name: "Zeena", label: "Zeena (Enterprise)", role: "SALES_AGENT" },
  { name: "Bharat", label: "Bharat (Local Installation)", role: "SALES_AGENT" },
  { name: "Pardeep", label: "Pardeep (Local Installation)", role: "SALES_AGENT" }
];

export function isValidAgentName(value: string) {
  return AGENT_OPTIONS.some((agent) => agent.name === value);
}

function pickFromPool(pool: string[]) {
  if (pool.length === 0) {
    return null;
  }
  const index = Math.abs(Date.now()) % pool.length;
  return pool[index] ?? null;
}

export function suggestAgentForLead(brand: string, category = "") {
  const normalizedBrand = brand.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();

  if (normalizedBrand === "microsoft") {
    return pickFromPool(["Zeena", "Nidhi"]);
  }
  if (normalizedBrand === "seqrite") {
    return pickFromPool(["Nidhi", "Girish"]);
  }
  if (normalizedBrand === "cisco" || normalizedCategory.includes("network")) {
    return pickFromPool(["Rimpy", "Bharat"]);
  }
  if (normalizedCategory.includes("support")) {
    return "Kiran";
  }
  return pickFromPool(["Girish", "Nidhi", "Rimpy"]);
}

const AGENT_EMAIL_ENV_MAP: Record<string, string | undefined> = {
  Girish: process.env.AGENT_EMAIL_GIRISH,
  Kiran: process.env.AGENT_EMAIL_KIRAN,
  Rimpy: process.env.AGENT_EMAIL_RIMPY,
  Nidhi: process.env.AGENT_EMAIL_NIDHI,
  Zeena: process.env.AGENT_EMAIL_ZEENA,
  Bharat: process.env.AGENT_EMAIL_BHARAT,
  Pardeep: process.env.AGENT_EMAIL_PARDEEP
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function getAgentNotificationEmail(name: string | null | undefined) {
  const key = (name ?? "").trim();
  if (!key) {
    return null;
  }

  const configured = AGENT_EMAIL_ENV_MAP[key]?.trim().toLowerCase() ?? "";
  if (!configured || !EMAIL_REGEX.test(configured)) {
    return null;
  }
  return configured;
}
