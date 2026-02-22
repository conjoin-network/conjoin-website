import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      rfq: {
        quoteEndpoint: "/api/quote",
        leadEndpoint: "/api/leads",
        hasGa: Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim()),
        hasAdsTag: Boolean(
          process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() ||
            process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID?.trim() ||
            process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim()
        ),
        hasGtm: Boolean(process.env.NEXT_PUBLIC_GTM_ID?.trim()),
        hasSmtp: Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim()),
        hasStorage: Boolean((process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL)?.trim())
      },
      generatedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
