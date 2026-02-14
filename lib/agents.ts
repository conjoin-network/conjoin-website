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
