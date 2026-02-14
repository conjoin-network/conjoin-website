import type { Metadata } from "next";
import RequestQuoteWizard from "@/app/request-quote/RequestQuoteWizard";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Request Quote | Microsoft & Seqrite 5-Step RFQ",
  description:
    "Five-step RFQ wizard: choose brand, choose product, users/devices, deployment type, and contact details.",
  path: "/request-quote"
});

export default function RequestQuotePage() {
  return <RequestQuoteWizard />;
}
