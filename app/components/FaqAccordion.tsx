type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="surface-card group px-5 py-4"
        >
          <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--color-text-primary)]">
            {item.question}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
