// src/app/launch/gtm/page.tsx
"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";

type GTMPlan = {
  headline: string;
  positioning: string;
  channels: string[];
  next7Days: string[];
};

export default function LaunchGtmKitPage() {
  const [audience, setAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [plan, setPlan] = useState<GTMPlan | null>(null);
  const [loading, setLoading] = useState(false);

  async function generatePlan() {
    setLoading(true);
    setPlan(null);
    const res = await fetch("/api/launch/gtm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, offer }),
    });
    const json = await res.json();
    setPlan(json.plan ?? null);
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-600 text-white px-3 py-1 text-[11px] font-semibold">
            <Megaphone size={14} />
            <span>Launch GTM Kit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Turn your product into a launch campaign.
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Describe who you&apos;re launching to and what you&apos;re offering.
            Zero17 drafts a mini GTM plan you can refine and publish from Growth
            OS.
          </p>
        </header>

        <section className="z17-card p-5 bg-white/90 space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">
                Target audience
              </label>
              <textarea
                className="w-full min-h-[90px] rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                placeholder="Example: Solo SaaS founders with 10–100 paying users who struggle to ship marketing consistently."
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">
                Offer / promise
              </label>
              <textarea
                className="w-full min-h-[90px] rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                placeholder="Example: An AI launch OS that compresses idea → launch → growth into one guided flow."
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white text-xs font-semibold hover:bg-white hover:text-black transition disabled:opacity-60"
          >
            {loading ? "Generating plan…" : "Generate GTM Plan"}
          </button>

          {plan && (
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border p-3 bg-white/90">
                <div className="text-xs uppercase text-slate-500 mb-1">
                  Launch headline
                </div>
                <div className="text-sm font-semibold">{plan.headline}</div>

                <div className="mt-3 text-xs uppercase text-slate-500 mb-1">
                  Positioning
                </div>
                <p className="text-xs text-slate-700">{plan.positioning}</p>
              </div>
              <div className="rounded-xl border p-3 bg-white/90">
                <div className="text-xs uppercase text-slate-500 mb-1">
                  Channels to hit
                </div>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  {plan.channels.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>

                <div className="mt-3 text-xs uppercase text-slate-500 mb-1">
                  Next 7 days
                </div>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  {plan.next7Days.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
