"use client";

import { useState, type ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  defaultId?: string;
};

export function Tabs({ items, defaultId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultId ?? items[0]?.id ?? "");
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="Tabs" className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = item.id === activeItem?.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={`min-h-10 rounded-xl border px-3 text-sm font-semibold transition ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-alt-bg)] text-[var(--color-text-primary)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/30"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
        {activeItem?.content}
      </div>
    </div>
  );
}
