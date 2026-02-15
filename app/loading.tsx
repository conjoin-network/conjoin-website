export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6">
        <div className="h-10 w-10 animate-pulse rounded-full border border-slate-600 bg-slate-800/75" />
      </div>
    </div>
  );
}
