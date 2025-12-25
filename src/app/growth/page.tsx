// src/app/growth/page.tsx
import GrowthOverview from "@/components/growth/GrowthOverview";

export const dynamic = "force-dynamic";

/**
 * Root entry for the Zero17 Growth OS.
 * Matches the overall Zero17 aesthetic:
 * - warm amber/rose base with subtle sky tint
 * - text-slate-900 base
 * - delegates all logic to GrowthOverview.
 */
export default function GrowthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-100 via-rose-50 to-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <GrowthOverview />
      </div>
    </main>
  );
}
