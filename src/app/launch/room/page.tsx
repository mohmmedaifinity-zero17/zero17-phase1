// src/app/launch/room/page.tsx
"use client";

import { useState } from "react";
import { Activity } from "lucide-react";

type LaunchSnapshot = {
  visitors: number;
  signups: number;
  errors: number;
  conversionRate: number;
  topCountries: string[];
};

export default function LaunchRoomPage() {
  const [snapshot, setSnapshot] = useState<LaunchSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  async function simulateLaunchRoom() {
    setLoading(true);
    setSnapshot(null);
    const res = await fetch("/api/launch/room", { method: "POST" });
    const json = await res.json();
    setSnapshot(json.snapshot ?? null);
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-3 py-1 text-[11px] font-semibold">
            <Activity size={14} />
            <span>Launch Room</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Watch your launch like a control tower.
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            This stub simulates a first-day launch snapshot. In future, Launch
            Room will connect to your analytics, logs and Growth OS experiments
            to show live impact.
          </p>
        </header>

        <section className="z17-card p-5 bg-white/90 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Simulate Launch Room</div>
              <div className="text-xs text-slate-500 max-w-md">
                Use this to verify the UX. Later, this will update in real time
                as traffic and conversions flow in.
              </div>
            </div>
            <button
              onClick={simulateLaunchRoom}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white text-xs font-semibold hover:bg-white hover:text-black transition disabled:opacity-60"
            >
              {loading ? "Simulating…" : "Run Launch Snapshot"}
            </button>
          </div>

          {snapshot && (
            <div className="mt-4 grid md:grid-cols-4 gap-3 text-sm">
              <MetricBox
                label="Visitors"
                value={snapshot.visitors.toString()}
              />
              <MetricBox label="Signups" value={snapshot.signups.toString()} />
              <MetricBox
                label="Conversion"
                value={`${snapshot.conversionRate.toFixed(1)}%`}
              />
              <MetricBox label="Errors" value={snapshot.errors.toString()} />
            </div>
          )}

          {snapshot && (
            <div className="mt-4 rounded-xl border p-3 bg-white/90 text-sm">
              <div className="text-xs uppercase text-slate-500 mb-1">
                Top countries
              </div>
              <ul className="flex flex-wrap gap-2 text-xs text-slate-700">
                {snapshot.topCountries.map((c, i) => (
                  <li
                    key={i}
                    className="px-2 py-1 rounded-full border border-slate-200 bg-slate-50"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3 bg-white/90 text-center">
      <div className="text-[11px] uppercase text-slate-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
