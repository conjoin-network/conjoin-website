import { NextResponse } from "next/server";
import { LEADS_EMAIL } from "@/lib/contact";

type LeadPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  requirement?: string;
  users?: string | number;
  message?: string;
};

const requiredFields: Array<keyof LeadPayload> = [
  "name",
  "company",
  "email",
  "phone",
  "requirement",
  "users",
];

const hasValue = (value: LeadPayload[keyof LeadPayload]) => {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return false;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadPayload;

    const invalid = requiredFields.some((field) => !hasValue(payload?.[field]));

    if (invalid) {
      return NextResponse.json(
        { ok: false, message: "Invalid request." },
        { status: 400 }
      );
    }

    console.log("NEW LEAD:", payload);
    // TODO: Send lead notification to leads@conjoinnetwork.com (SMTP/M365 Graph integration).
    console.info("LEAD_NOTIFICATION_TODO", JSON.stringify({ destination: LEADS_EMAIL }));

    return NextResponse.json({
      ok: true,
      message: "Request received. We will contact you shortly.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}
