// src/app/research/page.tsx
import ResearchOverview from "@/components/research/ResearchOverview";

export const dynamic = "force-dynamic";

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-rose-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ResearchOverview />
      </div>
    </main>
  );
}
