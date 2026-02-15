"use client";

import { useEffect } from "react";

const SCROLL_THRESHOLD_PX = 8;

export default function HeaderScrollState() {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      root.dataset.headerScrolled = window.scrollY > SCROLL_THRESHOLD_PX ? "true" : "false";
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });

    return () => {
      window.removeEventListener("scroll", sync);
      delete root.dataset.headerScrolled;
    };
  }, []);

  return null;
}
