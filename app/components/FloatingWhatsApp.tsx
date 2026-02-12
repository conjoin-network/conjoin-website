"use client";

import { usePathname } from "next/navigation";
import { buildQuoteMessage, getWhatsAppLink } from "@/lib/whatsapp";

function inferBrand(pathname: string) {
  if (pathname.includes("microsoft")) {
    return "Microsoft";
  }
  if (pathname.includes("seqrite")) {
    return "Seqrite";
  }
  if (pathname.includes("cisco")) {
    return "Cisco";
  }
  return "IT solutions";
}

function inferCity(pathname: string) {
  if (pathname.startsWith("/locations/")) {
    const slug = pathname.split("/")[2] ?? "";
    if (slug) {
      return slug.replace(/-/g, " ");
    }
  }
  return "Chandigarh";
}

export default function FloatingWhatsApp() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return null;
  }

  const brand = inferBrand(pathname);
  const city = inferCity(pathname);
  const requirement = pathname.startsWith("/products/") ? "Product advisory" : "Quote support";
  const href = getWhatsAppLink(buildQuoteMessage({ brand, city, requirement }));

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="interactive-btn fixed bottom-5 right-5 z-40 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-whatsapp)] px-4 text-sm font-semibold text-white shadow-[0_12px_25px_-15px_rgba(18,140,126,0.9)]"
    >
      WhatsApp
    </a>
  );
}
