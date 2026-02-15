import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type SharedProps = {
  label: string;
  error?: string;
  hint?: string;
};

type InputProps = SharedProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = SharedProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const fieldClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-text-primary)] transition focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20";

export function Input({ label, error, hint, className = "", ...props }: InputProps) {
  return (
    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
      <span>{label}</span>
      <input className={`${fieldClass} ${className}`.trim()} {...props} />
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-[var(--color-text-secondary)]">{hint}</span> : null}
    </label>
  );
}

export function Textarea({ label, error, hint, className = "", ...props }: TextareaProps) {
  return (
    <label className="space-y-2 text-sm font-medium text-[var(--color-text-primary)]">
      <span>{label}</span>
      <textarea className={`${fieldClass} ${className}`.trim()} {...props} />
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-[var(--color-text-secondary)]">{hint}</span> : null}
    </label>
  );
}
