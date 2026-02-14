import type { Metadata } from "next";
import RequestQuoteWizard from "@/app/request-quote/RequestQuoteWizard";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Request Quote | Microsoft, Seqrite and OEM Procurement",
  description:
    "Step-by-step quote wizard for Microsoft users/seats, Seqrite endpoints/servers, and generic OEM procurement requirements.",
  path: "/request-quote"
});

export default function RequestQuotePage() {
  return <RequestQuoteWizard />;
}
