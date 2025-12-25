// src/app/growth/brand/page.tsx
"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { AssignToAgent } from "@/components/agents/AssignToAgent";

type BrandResult = {
  nameIdeas: string[];
  taglines: string[];
  toneWords: string[];
  colorDirections: string[];
  narrative: string;
};

export default function BrandPage() {
  const [inputs, setInputs] = useState({
    product: "",
    audience: "",
  });
  const [result, setResult] = useState<BrandResult | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof inputs>(key: K, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  async function buildBrand() {
    setLoading(true);
    const res = await fetch("/api/growth/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });
    const json = await res.json();
    setResult(json);
    setLoading(false);
  }

  const summaryForAgent =
    result &&
    `Refine brand identity for product "${inputs.product || "Zero17 product"}" targeting "${
      inputs.audience || "solo founders"
    }" with chosen names, taglines and tone.`;

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <header className="space-y-1">
          <div className="text-xs uppercase text-slate-500">
            Growth OS • Brand Identity Forge
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Brand Blueprint
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Define your brand in terms of name, taglines, tone, colors and core
            narrative — so you can show up consistent everywhere.
          </p>
        </header>

        <section className="z17-card p-5 space-y-3 bg-white/85">
          <input
            className="w-full border rounded-xl px-3 py-2 text-sm"
            placeholder="What are you building?"
            value={inputs.product}
            onChange={(e) => update("product", e.target.value)}
          />
          <input
            className="w-full border rounded-xl px-3 py-2 text-sm"
            placeholder="Who is it primarily for?"
            value={inputs.audience}
            onChange={(e) => update("audience", e.target.value)}
          />
          <button
            onClick={buildBrand}
            disabled={loading}
            className="px-4 py-2 rounded-xl border text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
          >
            {loading ? "Crafting…" : "Generate Brand Blueprint"}
          </button>
        </section>

        {result && (
          <section className="space-y-4 text-xs text-slate-700">
            <CardList title="Name ideas" items={result.nameIdeas} />
            <CardList title="Taglines" items={result.taglines} />
            <CardList title="Tone words" items={result.toneWords} />
            <CardList title="Color directions" items={result.colorDirections} />
            <div className="z17-card p-4 bg-white/85">
              <div className="text-[11px] uppercase text-slate-500 mb-1">
                Core narrative
              </div>
              <p>{result.narrative}</p>
            </div>

            {summaryForAgent && (
              <AssignToAgent
                source="growth.brand"
                summary={summaryForAgent}
                defaultAgentId="content-social"
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function CardList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="z17-card p-4 bg-white/85">
      <div className="text-[11px] uppercase text-slate-500 mb-1">{title}</div>
      <ul className="list-disc pl-4 space-y-1">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
