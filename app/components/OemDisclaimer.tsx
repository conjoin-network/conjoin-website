import PartnerDisclaimer from "@/app/components/PartnerDisclaimer";

type OemDisclaimerProps = {
  lastVerified?: string;
  sourceLabel?: string;
};

export default function OemDisclaimer({ lastVerified, sourceLabel }: OemDisclaimerProps) {
  return <PartnerDisclaimer lastVerified={lastVerified} sourceLabel={sourceLabel} />;
}
