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
