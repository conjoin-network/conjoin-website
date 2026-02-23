import { notFound } from "next/navigation";
import type { Metadata } from "next";
import M365RoiLandingPage from "@/app/components/M365RoiLandingPage";
import { getM365RoiPlan } from "@/lib/m365-roi-data";
import { buildMetadata } from "@/lib/seo";

const slug = "m365-business-premium-chandigarh";
const plan = getM365RoiPlan(slug);

export const metadata: Metadata = plan
  ? buildMetadata({
      title: plan.title,
      description: plan.description,
      path: `/${slug}`
    })
  : {};

export default function M365BusinessPremiumChandigarhPage() {
  if (!plan) {
    notFound();
  }
  return <M365RoiLandingPage plan={plan} />;
}
