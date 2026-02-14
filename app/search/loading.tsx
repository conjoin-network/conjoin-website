import Section from "@/app/components/Section";
import Card from "@/app/components/Card";

export default function SearchLoading() {
  return (
    <Section tone="alt" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="mx-auto h-10 w-40 animate-pulse rounded bg-slate-200" />
        <Card className="space-y-3 p-4 md:p-5">
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
        </Card>
        <Card className="space-y-2 p-4">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`search-loading-row-${index}`} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </Card>
      </div>
    </Section>
  );
}
