// src/app/launch/mentors/page.tsx
"use client";

import { useState } from "react";
import { Users, Cpu, LineChart, Layout, Scale } from "lucide-react";

type MentorAdvice = {
  role: string;
  summary: string;
  bullets: string[];
};

export default function LaunchMentorSquadPage() {
  const [advice, setAdvice] = useState<MentorAdvice[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function runMentorReview() {
    setLoading(true);
    setAdvice(null);
    const res = await fetch("/api/launch/mentors", { method: "POST" });
    const json = await res.json();
    setAdvice(json.mentors ?? null);
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] font-semibold">
            <Users size={14} />
            <span>Launch Mentor Squad</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Get a 4-mentor review on your launch.
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            A virtual CTO, CMO, Product lead & Legal sentry summarize what looks
            strong, what feels risky and what you should fix before going live.
          </p>
        </header>

        <section className="z17-card p-5 bg-white/90 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Run Mentor Review</div>
              <div className="text-xs text-slate-500 max-w-md">
                In this stub, we simulate advice. Later, this will read your
                Proof Pack, Preflight and Growth OS signals to generate a custom
                launch dossier.
              </div>
            </div>
            <button
              onClick={runMentorReview}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white text-xs font-semibold hover:bg-white hover:text-black transition disabled:opacity-60"
            >
              {loading ? "Reviewing…" : "Run Mentor Squad"}
            </button>
          </div>

          {advice && (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {advice.map((m) => (
                <div key={m.role} className="rounded-xl border p-3 bg-white/90">
                  <div className="flex items-center gap-2 mb-1">
                    {m.role === "CTO" && (
                      <Cpu size={14} className="text-sky-700" />
                    )}
                    {m.role === "CMO" && (
                      <LineChart size={14} className="text-emerald-700" />
                    )}
                    {m.role === "Product" && (
                      <Layout size={14} className="text-purple-700" />
                    )}
                    {m.role === "Legal" && (
                      <Scale size={14} className="text-red-600" />
                    )}
                    <div className="text-xs uppercase text-slate-500">
                      {m.role}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{m.summary}</div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                    {m.bullets.map((b, i) => (
                      <li key={`${m.role}-${i}`}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
