type AccordionItem = {
  id: string;
  title: string;
  content: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <details key={item.id} className="group rounded-xl border border-[var(--color-border)] bg-white p-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--color-text-primary)]">
            {item.title}
          </summary>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
