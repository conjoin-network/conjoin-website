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
  const toneClass = tone === "alt" ? "section-alt" : "";
  const sectionClass = `section-shell py-14 md:py-20 ${toneClass} section-revealed${
    className ? ` ${className}` : ""
  }`;

  return (
    <section id={id} className={sectionClass}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
