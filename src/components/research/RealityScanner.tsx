// src/components/research/RealityScanner.tsx
"use client";

import { useState } from "react";
import {
  AutoRealityScan,
  CompetitorRef,
  DemandReceipt,
  DemandSource,
  DemandTag,
  EvidenceBundle,
} from "@/lib/research/types";
import { ResearchIdea } from "@/lib/research/types";

interface Props {
  evidence: EvidenceBundle | null;
  onEvidenceChange: (bundle: EvidenceBundle) => void;
}

export default function RealityScanner({ evidence, onEvidenceChange }: Props) {
  const [autoScan, setAutoScan] = useState<AutoRealityScan | null>(
    evidence?.autoScan ?? null
  );
  const [isAutoBusy, setIsAutoBusy] = useState(false);

  const [local, setLocal] = useState<EvidenceBundle>(
    evidence ?? { receipts: [], competitors: [], autoScan: null }
  );

  const update = (bundle: EvidenceBundle) => {
    setLocal(bundle);
    onEvidenceChange(bundle);
  };

  // ─────────────────────────────────────────
  // AUTO REALITY SCAN – main brain
  // ─────────────────────────────────────────

  const handleAutoScan = async (idea: ResearchIdea | null) => {
    if (!idea) return;
    setIsAutoBusy(true);
    try {
      const res = await fetch("/api/research/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, evidence: local }),
      });
      if (!res.ok) {
        console.error("Evidence API error:", await res.text());
        setIsAutoBusy(false);
        return;
      }
      const data = (await res.json()) as { scan: AutoRealityScan };

      // Map auto competitors into CompetitorRef for other engines
      const autoCompetitorsRefs: CompetitorRef[] = (
        data.scan.autoCompetitors ?? []
      ).map((c, idx) => ({
        id: `auto-${idx}`,
        name: c.name,
        url: "", // can be filled later; this is conceptual
        notes: `${c.category} · ${c.angle}`,
      }));

      const merged: EvidenceBundle = {
        ...local,
        autoScan: data.scan,
        competitors:
          local.competitors.length > 0
            ? local.competitors
            : autoCompetitorsRefs, // prefer user overrides, else auto
      };

      setAutoScan(data.scan);
      update(merged);
    } catch (err) {
      console.error("Auto reality scan error:", err);
    } finally {
      setIsAutoBusy(false);
    }
  };

  // ─────────────────────────────────────────
  // MANUAL RECEIPTS / COMPETITORS (optional)
  // ─────────────────────────────────────────

  const addReceipt = () => {
    const next: DemandReceipt = {
      id: crypto.randomUUID(),
      source: "dm",
      tag: "pain",
      rawText: "",
    };
    update({ ...local, receipts: [...local.receipts, next] });
  };

  const updateReceipt = (id: string, patch: Partial<DemandReceipt>) => {
    const receipts = local.receipts.map((r) =>
      r.id === id ? { ...r, ...patch } : r
    );
    update({ ...local, receipts });
  };

  const removeReceipt = (id: string) => {
    update({ ...local, receipts: local.receipts.filter((r) => r.id !== id) });
  };

  const addCompetitor = () => {
    const next: CompetitorRef = {
      id: crypto.randomUUID(),
      name: "",
      url: "",
      notes: "",
    };
    update({ ...local, competitors: [...local.competitors, next] });
  };

  const updateCompetitor = (id: string, patch: Partial<CompetitorRef>) => {
    const competitors = local.competitors.map((c) =>
      c.id === id ? { ...c, ...patch } : c
    );
    update({ ...local, competitors });
  };

  const removeCompetitor = (id: string) => {
    update({
      ...local,
      competitors: local.competitors.filter((c) => c.id !== id),
    });
  };

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Reality Scanner · Auto & Manual Evidence
          </h2>
          <p className="text-[11px] text-slate-600">
            Let the Lab auto-map your market, competitors and brutal reality.
            Manual receipts are optional — the scanner can still operate from
            your Origin Frame.
          </p>
        </div>
      </div>

      {/* AUTO REALITY SCAN */}
      <AutoScanCard
        autoScan={autoScan}
        isBusy={isAutoBusy}
        onRun={(idea) => handleAutoScan(idea)}
      />

      {/* Divider */}
      <div className="my-3 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

      {/* OPTIONAL MANUAL INPUTS */}
      <ManualEvidenceBlock
        local={local}
        addReceipt={addReceipt}
        updateReceipt={updateReceipt}
        removeReceipt={removeReceipt}
        addCompetitor={addCompetitor}
        updateCompetitor={updateCompetitor}
        removeCompetitor={removeCompetitor}
      />
    </section>
  );
}

// ─────────────────────────────────────────────
// AUTO SCAN CARD COMPONENT
// ─────────────────────────────────────────────

function AutoScanCard({
  autoScan,
  isBusy,
  onRun,
}: {
  autoScan: AutoRealityScan | null;
  isBusy: boolean;
  onRun: (idea: ResearchIdea | null) => void;
}) {
  // We don't have idea here directly – we grab it via window store pattern in parent.
  // Simpler: we let the parent pass idea indirectly. To keep it simple here, we just
  // look up latest idea from global state with a custom event, but that's overkill.
  // Instead: we rely on ValidationChiefRail telling the user to fill Origin first.
  // For now, we expose a global window hook for idea, or we cheat by
  // requiring OriginFrame to already be filled and rely on /evidence route checking it.
  // To not overcomplicate, we call onRun with (window as any).__zero17Idea if present.

  const doRun = () => {
    const globalIdea = (window as any).__zero17Idea as
      | ResearchIdea
      | null
      | undefined;
    onRun(globalIdea ?? null);
  };

  return (
    <div className="mb-3 rounded-xl border border-emerald-200 bg-white/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Auto Reality Scan · Brutal terrain map
          </span>
          <p className="text-[10px] text-slate-600">
            One click: infer competitors, category shape, gaps, future threats
            and a proof checklist — like a private war-room session.
          </p>
        </div>
        <button
          onClick={doRun}
          disabled={isBusy}
          className="rounded-full border border-emerald-700 bg-emerald-700 px-4 py-1.5 text-[11px] font-semibold text-emerald-50 disabled:opacity-60"
        >
          {isBusy ? "Scanning reality…" : "Run Auto Reality Scan"}
        </button>
      </div>

      {!autoScan && (
        <p className="text-[10px] text-slate-500">
          Fill your idea in Origin Frame first. The scanner will use that plus
          any receipts/competitors you add to generate a brutal, structured map.
        </p>
      )}

      {autoScan && (
        <div className="mt-2 grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)] text-[11px]">
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-900 p-3 text-slate-50">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                Brutal summary
              </span>
              <p className="mt-1 whitespace-pre-line text-[11px]">
                {autoScan.brutalSummary}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                Category shape
              </span>
              <p className="mt-1 whitespace-pre-line text-[11px] text-slate-800">
                {autoScan.categoryShape}
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <BulletCard
                title="Demand signals"
                items={autoScan.demandSignals}
              />
              <BulletCard
                title="Gaps & wedges"
                items={autoScan.gapsAndWedges}
                variant="wedge"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <BulletCard
                title="Future threats (12–36m)"
                items={autoScan.futureThreats}
                variant="threat"
              />
              <BulletCard
                title="Proof checklist"
                items={autoScan.suggestedProof}
                variant="proof"
              />
            </div>
          </div>

          {/* Competitor analysis – unique style */}
          <div className="space-y-2 rounded-lg bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Competitor war-room
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-[2px] text-[9px] font-semibold text-emerald-800">
                {autoScan.autoCompetitors.length} archetypes
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              These are NOT just clones. Each card shows the angle, pricing band
              and where they’re strong vs weak — so you can see where Zero17 can
              wedge.
            </p>
            <div className="mt-2 space-y-2 max-h-64 overflow-auto pr-1">
              {autoScan.autoCompetitors.map((c, idx) => (
                <CompetitorCard key={idx} c={c} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helpers

function BulletCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: "wedge" | "threat" | "proof";
}) {
  const badgeColor =
    variant === "wedge"
      ? "bg-emerald-100 text-emerald-800"
      : variant === "threat"
        ? "bg-rose-100 text-rose-800"
        : variant === "proof"
          ? "bg-sky-100 text-sky-800"
          : "bg-slate-100 text-slate-700";

  return (
    <div className="rounded-lg bg-white/80 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {title}
        </span>
        <span
          className={`rounded-full px-2 py-[1px] text-[9px] font-semibold ${badgeColor}`}
        >
          {items.length} pts
        </span>
      </div>
      <ul className="space-y-1 text-[10px] text-slate-800">
        {items.map((x, i) => (
          <li key={i}>• {x}</li>
        ))}
        {items.length === 0 && (
          <li className="text-slate-400">No signals yet.</li>
        )}
      </ul>
    </div>
  );
}

function CompetitorCard({
  c,
}: {
  c: AutoRealityScan["autoCompetitors"][number];
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px]">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold text-slate-900">
            {c.name}
          </div>
          <div className="text-[9px] text-slate-500">{c.category}</div>
        </div>
        <div className="text-right text-[9px] text-slate-600">
          <div className="font-semibold">{c.pricingBand}</div>
          <div className="italic text-[9px] text-slate-500">{c.angle}</div>
        </div>
      </div>
      <p className="text-[10px] text-slate-800">{c.description}</p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-emerald-50 px-2 py-1">
          <div className="text-[9px] font-semibold text-emerald-800">
            They win by
          </div>
          <div className="text-[9px] text-emerald-900">{c.strength}</div>
        </div>
        <div className="rounded-md bg-rose-50 px-2 py-1">
          <div className="text-[9px] font-semibold text-rose-800">
            They are weak at
          </div>
          <div className="text-[9px] text-rose-900">{c.weakness}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MANUAL EVIDENCE BLOCK
// ─────────────────────────────────────────────

function ManualEvidenceBlock({
  local,
  addReceipt,
  updateReceipt,
  removeReceipt,
  addCompetitor,
  updateCompetitor,
  removeCompetitor,
}: {
  local: EvidenceBundle;
  addReceipt: () => void;
  updateReceipt: (id: string, patch: Partial<DemandReceipt>) => void;
  removeReceipt: (id: string) => void;
  addCompetitor: () => void;
  updateCompetitor: (id: string, patch: Partial<CompetitorRef>) => void;
  removeCompetitor: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 text-[11px]">
      {/* Demand receipts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Optional · Demand receipts
          </span>
          <button
            onClick={addReceipt}
            className="rounded-full border border-emerald-600 bg-emerald-600 px-3 py-1 text-[10px] font-semibold text-emerald-50"
          >
            + Add receipt
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          Paste exact words from DMs, emails or calls. Auto Scanner still works
          without this, but proof will be sharper if you add a few.
        </p>

        <div className="space-y-2">
          {local.receipts.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-emerald-100 bg-white/80 p-2"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <select
                  value={r.source}
                  onChange={(e) =>
                    updateReceipt(r.id, {
                      source: e.target.value as DemandSource,
                    })
                  }
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-800"
                >
                  <option value="dm">DM</option>
                  <option value="email">Email</option>
                  <option value="call">Call</option>
                  <option value="note">Note</option>
                </select>
                <select
                  value={r.tag}
                  onChange={(e) =>
                    updateReceipt(r.id, { tag: e.target.value as DemandTag })
                  }
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-800"
                >
                  <option value="pain">Pain</option>
                  <option value="feature_request">Feature</option>
                  <option value="pricing">Pricing</option>
                  <option value="other">Other</option>
                </select>
                <button
                  onClick={() => removeReceipt(r.id)}
                  className="text-[10px] text-slate-400 hover:text-slate-700"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={r.rawText}
                onChange={(e) =>
                  updateReceipt(r.id, { rawText: e.target.value })
                }
                rows={2}
                placeholder="Paste the exact words they used…"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          ))}
          {local.receipts.length === 0 && (
            <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-3 text-[10px] text-emerald-700">
              Empty is fine for now. 2–3 real quotes later will turn this into a
              founder-grade proof engine.
            </div>
          )}
        </div>
      </div>

      {/* Competitors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Optional · Exact competitors
          </span>
          <button
            onClick={addCompetitor}
            className="rounded-full border border-emerald-600 bg-white px-3 py-1 text-[10px] font-semibold text-emerald-700"
          >
            + Add competitor
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          Use this if you want to override or extend the auto competitor map
          with specific URLs and notes.
        </p>

        <div className="space-y-2">
          {local.competitors.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-emerald-100 bg-white/80 p-2"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <input
                  value={c.name}
                  onChange={(e) =>
                    updateCompetitor(c.id, { name: e.target.value })
                  }
                  placeholder="Name"
                  className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                />
                <button
                  onClick={() => removeCompetitor(c.id)}
                  className="text-[10px] text-slate-400 hover:text-slate-700"
                >
                  Remove
                </button>
              </div>
              <input
                value={c.url}
                onChange={(e) =>
                  updateCompetitor(c.id, { url: e.target.value })
                }
                placeholder="https://…"
                className="mb-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
              />
              <textarea
                value={c.notes ?? ""}
                onChange={(e) =>
                  updateCompetitor(c.id, { notes: e.target.value })
                }
                rows={2}
                placeholder="Optional notes about their positioning, pricing, or UX."
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          ))}
          {local.competitors.length === 0 && (
            <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-3 text-[10px] text-emerald-700">
              Auto Scanner already synthesizes competitors; add specific ones
              here if you want Zero17 to study exact URLs later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
