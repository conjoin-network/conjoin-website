type ToastProps = {
  tone?: "success" | "error" | "info";
  message: string;
};

const toneClasses: Record<NonNullable<ToastProps["tone"]>, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-blue-200 bg-blue-50 text-blue-700"
};

export function Toast({ tone = "info", message }: ToastProps) {
  return <p className={`rounded-xl border px-3 py-2 text-sm ${toneClasses[tone]}`}>{message}</p>;
}
