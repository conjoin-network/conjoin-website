"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Container from "./Container";

type SectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  tone?: "default" | "alt";
  id?: string;
};

export default function Section({
  children,
  className,
  containerClassName,
  id,
  tone = "default",
}: SectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const toneClass =
    tone === "alt" ? "bg-[var(--color-alt-bg)]" : "bg-transparent";
  const revealClass = revealed ? "section-revealed" : "";
  const sectionClass = `py-16 md:py-24 ${toneClass} ${revealClass}${
    className ? ` ${className}` : ""
  }`;

  return (
    <section id={id} ref={ref} className={sectionClass}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
