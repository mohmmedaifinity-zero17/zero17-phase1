"use client";

import { useState } from "react";

type ProofPack = {
  meta: {
    projectName: string;
    variant: string;
    generatedAt: string;
    version: string;
  };
  buildStory: {
    summary: string;
    what: string;
    why: string;
    how: string;
    future: string;
  };
  architecture: {
    components: string[];
    dataFlow: string[];
    risks: string[];
  };
  visuals: {
    heroPrompt: string;
    collagePrompt: string;
    diagramPrompt: string;
  };
  founderCard: {
    id: string;
    launches: number;
    xpLevel: string;
  };
};

export default function ProofPage() {
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<ProofPack | null>(null);

  async function generatePack() {
    setLoading(true);
    setPack(null);
    const res = await fetch("/api/launch/proof", { method: "POST" });
    const json = (await res.json()) as ProofPack;
    setPack(json);
    setLoading(false);
  }

  function downloadJSON() {
    if (!pack) return;
    const blob = new Blob([JSON.stringify(pack, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pack.meta.projectName}-pow-pack-v2.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-2">
        <div className="text-xs uppercase text-slate-500">
          Launch Engine • Proof-of-Work Vault
        </div>
        <h1 className="text-3xl font-bold">
          Capture proof that you built something real.
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Build story, architecture, visuals and a founder identity card — all
          in a single pack you can share with clients, hiring managers,
          investors or future you.
        </p>
      </header>

      <section className="z17-card p-5 space-y-3">
        <button
          onClick={generatePack}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white text-sm font-medium hover:bg-white hover:text-black transition disabled:opacity-50"
        >
          {loading ? "Preparing proof-of-work…" : "Generate Proof Pack v2"}
        </button>

        {pack && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase text-slate-500">Project</div>
                <div className="text-sm font-semibold">
                  {pack.meta.projectName} • {pack.meta.variant}
                </div>
                <div className="text-[11px] text-slate-500">
                  Generated {new Date(pack.meta.generatedAt).toLocaleString()} •{" "}
                  {pack.meta.version}
                </div>
              </div>
              <button
                onClick={downloadJSON}
                className="px-3 py-2 rounded-xl border border-slate-900 bg-white text-xs font-medium hover:bg-slate-900 hover:text-white transition"
              >
                Download JSON
              </button>
            </div>

            <Panel
              title="Build story"
              items={[
                `Summary: ${pack.buildStory.summary}`,
                `What: ${pack.buildStory.what}`,
                `Why: ${pack.buildStory.why}`,
                `How: ${pack.buildStory.how}`,
                `Future: ${pack.buildStory.future}`,
              ]}
            />

            <Panel
              title="Architecture"
              items={[
                `Components: ${pack.architecture.components.join(", ")}`,
                `Data flow: ${pack.architecture.dataFlow.join(" → ")}`,
                `Risks: ${pack.architecture.risks.join("; ")}`,
              ]}
            />

            <Panel
              title="Visual prompts (for image tools)"
              items={[
                `Hero: ${pack.visuals.heroPrompt}`,
                `Collage: ${pack.visuals.collagePrompt}`,
                `Diagram: ${pack.visuals.diagramPrompt}`,
              ]}
            />

            <Panel
              title="Founder card"
              items={[
                `ID: ${pack.founderCard.id}`,
                `Launches: ${pack.founderCard.launches}`,
                `XP level: ${pack.founderCard.xpLevel}`,
              ]}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-[11px] uppercase text-slate-500 mb-1">{title}</div>
      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
        {items.map((x, i) => (
          <li key={`${title}-${i}`}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
