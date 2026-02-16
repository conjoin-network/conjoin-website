type PartnerDisclaimerProps = {
  className?: string;
  lastVerified?: string;
  sourceLabel?: string;
};

export default function PartnerDisclaimer({
  className,
  lastVerified,
  sourceLabel
}: PartnerDisclaimerProps) {
  void lastVerified;
  void sourceLabel;

  return (
    <aside
      className={`rounded-xl border border-[var(--color-border)] bg-white/85 px-4 py-3 text-xs leading-relaxed text-[var(--color-text-secondary)] ${
        className ?? ""
      }`.trim()}
    >
      <p>All product names, logos, and brands are trademarks of their respective owners.</p>
      <p className="mt-1">
        Specifications and inclusions shown are sourced from OEM documentation and may change.
      </p>
      <p className="mt-1">Final licensing and terms are governed by the OEM.</p>
      <p className="mt-1">
        Conjoin Network is a reseller/partner; no affiliation is implied beyond authorized sales/channel
        relationships.
      </p>
      <p className="mt-2 text-[11px]">Last verified: 12 Feb 2026 • Source: OEM documentation</p>
    </aside>
  );
}
