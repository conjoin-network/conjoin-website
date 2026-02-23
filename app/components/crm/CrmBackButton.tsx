"use client";

import { useRouter } from "next/navigation";

type CrmBackButtonProps = {
  fallbackHref: string;
};

export default function CrmBackButton({ fallbackHref }: CrmBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
      className="inline-flex min-h-9 items-center rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      aria-label="Go back"
    >
      Back
    </button>
  );
}
