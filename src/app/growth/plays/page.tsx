// src/app/growth/plays/page.tsx
"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AssignToAgent } from "@/components/agents/AssignToAgent";

type Playbook = {
  id: string;
  name: string;
  inspiredBy: string;
  timeline: string;
  steps: string[];
  metrics: string[];
};

export default function PlaysPage() {
  const [segment, setSegment] = useState("saas");
  const [plays, setPlays] = useState<Playbook[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadPlays() {
    setLoading(true);
    const res = await fetch("/api/growth/plays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segment }),
    });
    const json = await res.json();
    setPlays(json.playbooks);
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <header className="space-y-1">
          <div className="text-xs uppercase text-slate-500">
            Growth OS • Case-Study Playbooks
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Growth Playbooks
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Pick a pattern inspired by real companies (Typedream, Framer,
            Gumroad, Beehiiv, Notion, etc.) and follow a clear 7–30 day plan.
          </p>
        </header>

        <section className="z17-card p-5 space-y-3 bg-white/85 text-xs">
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-[11px] text-slate-500">
              Select your motion
            </label>
            <select
              className="border rounded-xl px-3 py-1.5 text-xs"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
            >
              <option value="saas">SaaS launch</option>
              <option value="solo">Solo builder services</option>
              <option value="newsletter">Newsletter / content product</option>
              <option value="community">Community / cohort</option>
            </select>
            <button
              onClick={loadPlays}
              disabled={loading}
              className="px-4 py-2 rounded-xl border text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load playbooks"}
            </button>
          </div>
        </section>

        {plays && (
          <section className="space-y-4 text-xs text-slate-700">
            {plays.map((p) => {
              const summaryForAgent = `Run and adapt the playbook "${p.name}" (${p.timeline}) inspired by ${p.inspiredBy} for current product and ICP.`;
              return (
                <div key={p.id} className="z17-card p-4 bg-white/85 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Inspired by: {p.inspiredBy} • Timeline: {p.timeline}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-slate-500 mb-1">
                      Steps
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      {p.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-slate-500 mb-1">
                      Metrics to watch
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      {p.metrics.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <AssignToAgent
                    source={`growth.play.${p.id}`}
                    summary={summaryForAgent}
                    defaultAgentId="growth-chief"
                  />
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
