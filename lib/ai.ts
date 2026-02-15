import type { LeadPriority } from "@/lib/quote-catalog";
import type { LeadRecord } from "@/lib/leads";

export type LeadSummaryOutput = {
  summary: string;
  nextStep: string;
  priority: LeadPriority;
  source: "ai" | "fallback";
  model: string;
};

export type LeadEmailDraftOutput = {
  subject: string;
  body: string;
  source: "ai" | "fallback";
  model: string;
};

export const OBJECTION_OPTIONS = ["Too expensive", "Need comparison", "Just exploring"] as const;
export type LeadObjection = (typeof OBJECTION_OPTIONS)[number];

export type LeadObjectionReplyOutput = {
  objection: LeadObjection;
  shortReply: string;
  longReply: string;
  source: "ai" | "fallback";
  model: string;
};

function priorityFromScore(score: number): LeadPriority {
  if (score >= 80) {
    return "HOT";
  }
  if (score >= 45) {
    return "WARM";
  }
  return "COLD";
}

function fallbackSummary(lead: LeadRecord): LeadSummaryOutput {
  const priority = priorityFromScore(lead.score);
  const requirement = lead.plan || lead.tier || lead.category;
  const lines = [
    `${lead.contactName} from ${lead.company} requested ${lead.brand} ${requirement} for ${lead.city}.`,
    `Quantity is ${lead.qty} with timeline ${lead.timeline || "This Week"} and score ${lead.score}.`,
    `Source: ${lead.source || lead.sourcePage || "website"}; assigned to ${lead.assignedTo || "Unassigned"}.`
  ];

  const nextStep =
    priority === "HOT"
      ? "Call now and share a same-day commercial proposal."
      : priority === "WARM"
        ? "Send a quote and book a 10-minute requirement confirmation call."
        : "Share intro proposal and schedule a follow-up within 24 hours.";

  return {
    summary: lines.join(" "),
    nextStep,
    priority,
    source: "fallback",
    model: "fallback-rule"
  };
}

function parseSummaryResponse(text: string): { summary: string; nextStep: string; priority: LeadPriority } | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    const summary = typeof record.summary === "string" ? record.summary.trim() : "";
    const nextStep = typeof record.nextStep === "string" ? record.nextStep.trim() : "";
    const priorityRaw = typeof record.priority === "string" ? record.priority.trim().toUpperCase() : "";
    if (!summary || !nextStep) {
      return null;
    }
    const priority = priorityRaw === "HOT" || priorityRaw === "WARM" || priorityRaw === "COLD"
      ? (priorityRaw as LeadPriority)
      : "WARM";
    return { summary, nextStep, priority };
  } catch {
    return null;
  }
}

function getAiConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY?.trim(),
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini"
  };
}

async function callResponsesApi(input: string, apiKey: string, model: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };

    const outputText =
      data.output_text ||
      data.output
        ?.flatMap((item) => item.content ?? [])
        .filter((item) => item.type === "output_text" && typeof item.text === "string")
        .map((item) => item.text as string)
        .join("\n") ||
      "";

    return outputText.trim() || null;
  } catch {
    return null;
  }
}

export async function generateLeadSummary(lead: LeadRecord): Promise<LeadSummaryOutput> {
  const { apiKey, model } = getAiConfig();
  if (!apiKey) {
    return fallbackSummary(lead);
  }

  const prompt = [
    "You are an enterprise B2B pre-sales assistant.",
    "Generate strict JSON only with keys: summary, nextStep, priority.",
    "summary must be max 3 lines in plain text.",
    "nextStep must be one action sentence.",
    "priority must be one of HOT, WARM, COLD.",
    "Lead JSON:",
    JSON.stringify({
      leadId: lead.leadId,
      brand: lead.brand,
      category: lead.category,
      plan: lead.plan || lead.tier,
      qty: lead.qty,
      city: lead.city,
      timeline: lead.timeline,
      source: lead.source,
      score: lead.score,
      assignedTo: lead.assignedTo
    })
  ].join("\n");

  const outputText = await callResponsesApi(prompt, apiKey, model);
  if (!outputText) {
    return fallbackSummary(lead);
  }

  const parsed = parseSummaryResponse(outputText);
  if (!parsed) {
    return fallbackSummary(lead);
  }

  return {
    summary: parsed.summary,
    nextStep: parsed.nextStep,
    priority: parsed.priority,
    source: "ai",
    model
  };
}

function fallbackEmailDraft(lead: LeadRecord): LeadEmailDraftOutput {
  const requirement = lead.plan || lead.tier || lead.category;
  const subject = `Commercial proposal for ${lead.brand} ${requirement}`.trim();
  const body = [
    `Hi ${lead.contactName || "Team"},`,
    "",
    `Thank you for your requirement for ${lead.brand} (${requirement}) in ${lead.city}.`,
    `Based on ${lead.qty} units and timeline "${lead.timeline || "This Week"}", we are preparing a compliance-ready commercial proposal with GST and support terms.`,
    "",
    "Please confirm any additional deployment constraints so we can finalize the quotation quickly.",
    "",
    "Regards,",
    "Conjoin Leads Desk"
  ].join("\n");

  return { subject, body, source: "fallback", model: "fallback-rule" };
}

function parseEmailDraftResponse(text: string): { subject: string; body: string } | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const subject = typeof record.subject === "string" ? record.subject.trim() : "";
    const body = typeof record.body === "string" ? record.body.trim() : "";
    if (!subject || !body) {
      return null;
    }
    return { subject: subject.slice(0, 180), body: body.slice(0, 4000) };
  } catch {
    return null;
  }
}

export async function generateLeadEmailDraft(lead: LeadRecord): Promise<LeadEmailDraftOutput> {
  const { apiKey, model } = getAiConfig();
  if (!apiKey) {
    return fallbackEmailDraft(lead);
  }

  const prompt = [
    "You are an enterprise B2B sales assistant.",
    "Generate strict JSON only with keys: subject, body.",
    "The tone must be concise and procurement-friendly.",
    "Mention compliance-ready proposal and support terms.",
    "Do not include markdown.",
    "Lead JSON:",
    JSON.stringify({
      leadId: lead.leadId,
      contactName: lead.contactName,
      company: lead.company,
      brand: lead.brand,
      category: lead.category,
      plan: lead.plan || lead.tier,
      qty: lead.qty,
      city: lead.city,
      timeline: lead.timeline
    })
  ].join("\n");

  const outputText = await callResponsesApi(prompt, apiKey, model);
  if (!outputText) {
    return fallbackEmailDraft(lead);
  }

  const parsed = parseEmailDraftResponse(outputText);
  if (!parsed) {
    return fallbackEmailDraft(lead);
  }

  return {
    subject: parsed.subject,
    body: parsed.body,
    source: "ai",
    model
  };
}

function fallbackObjectionReply(lead: LeadRecord, objection: LeadObjection): LeadObjectionReplyOutput {
  let shortReply = "";
  let longReply = "";

  if (objection === "Too expensive") {
    shortReply = "Understood. We can optimize scope and commercials while keeping compliance and support intact.";
    longReply = [
      "Thanks for the candid feedback.",
      `For ${lead.brand}, we can provide option-based pricing with scope optimization so you can compare TCO clearly.`,
      "We will include a base recommendation and an enhanced option, both with transparent support terms."
    ].join(" ");
  } else if (objection === "Need comparison") {
    shortReply = "Absolutely. We can share a side-by-side comparison focused on licensing, support, and renewal impact.";
    longReply = [
      `We can prepare a focused comparison for ${lead.brand} options relevant to your environment.`,
      "It will cover fitment, commercial structure, and renewal implications so you can approve quickly."
    ].join(" ");
  } else {
    shortReply = "No problem. We can start with a lightweight requirement checkpoint and share a clean proposal.";
    longReply = [
      "Thanks for considering the requirement.",
      "If you're still evaluating, we can run a brief 10-minute discovery call and share a commercial draft for internal review.",
      "This keeps the process low effort while preserving procurement clarity."
    ].join(" ");
  }

  return {
    objection,
    shortReply,
    longReply,
    source: "fallback",
    model: "fallback-rule"
  };
}

function parseObjectionResponse(text: string): { shortReply: string; longReply: string } | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    const shortReply = typeof record.shortReply === "string" ? record.shortReply.trim() : "";
    const longReply = typeof record.longReply === "string" ? record.longReply.trim() : "";
    if (!shortReply || !longReply) {
      return null;
    }
    return { shortReply: shortReply.slice(0, 500), longReply: longReply.slice(0, 2000) };
  } catch {
    return null;
  }
}

export async function generateObjectionReply(
  lead: LeadRecord,
  objection: LeadObjection
): Promise<LeadObjectionReplyOutput> {
  const { apiKey, model } = getAiConfig();
  if (!apiKey) {
    return fallbackObjectionReply(lead, objection);
  }

  const prompt = [
    "You are an enterprise account manager preparing objection responses.",
    "Generate strict JSON only with keys: shortReply, longReply.",
    "shortReply must be one short sentence (chat-ready).",
    "longReply must be two to three concise sentences.",
    "Tone: professional, calm, commercial clarity.",
    "Inputs:",
    JSON.stringify({
      objection,
      brand: lead.brand,
      category: lead.category,
      plan: lead.plan || lead.tier,
      qty: lead.qty,
      timeline: lead.timeline,
      city: lead.city
    })
  ].join("\n");

  const outputText = await callResponsesApi(prompt, apiKey, model);
  if (!outputText) {
    return fallbackObjectionReply(lead, objection);
  }

  const parsed = parseObjectionResponse(outputText);
  if (!parsed) {
    return fallbackObjectionReply(lead, objection);
  }

  return {
    objection,
    shortReply: parsed.shortReply,
    longReply: parsed.longReply,
    source: "ai",
    model
  };
}
