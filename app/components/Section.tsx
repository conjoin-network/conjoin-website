import type { ReactNode } from "react";
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
  const toneClass =
    tone === "alt" ? "bg-[var(--color-alt-bg)]" : "bg-transparent";
  const sectionClass = `py-16 md:py-24 ${toneClass} section-revealed${
    className ? ` ${className}` : ""
  }`;

  return (
    <section id={id} className={sectionClass}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
