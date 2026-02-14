"use client";

import { useMemo, useState } from "react";
import Card from "@/app/components/Card";

const regionConfig = {
  India: {
    currency: "INR (₹)",
    line: "Commercial examples are evaluated in INR using vendor and services scope context."
  },
  Canada: {
    currency: "CAD ($)",
    line: "Commercial examples are evaluated in CAD for remote support and implementation pathways."
  }
} as const;

type RegionKey = keyof typeof regionConfig;

export default function CommercialModelClient() {
  const [region, setRegion] = useState<RegionKey>("India");
  const regionInfo = useMemo(() => regionConfig[region], [region]);

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <Card className="space-y-3 p-5">
        <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
          Country context
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value as RegionKey)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)]"
          >
            <option value="India">India</option>
            <option value="Canada">Canada</option>
          </select>
        </label>
        <p className="text-xs text-[var(--color-text-secondary)]">Currency context: {regionInfo.currency}</p>
      </Card>

      <Card className="space-y-3 p-5">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Quote-led examples</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">{regionInfo.line}</p>
        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li>Licensing examples are scoped by user/device count and support tier.</li>
          <li>Implementation scope is documented with deliverables and acceptance checkpoints.</li>
          <li>Renewal and support terms are included in proposal notes before confirmation.</li>
        </ul>
      </Card>
    </div>
  );
}
