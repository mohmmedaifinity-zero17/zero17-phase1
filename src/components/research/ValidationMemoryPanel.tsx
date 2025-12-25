// src/components/research/ValidationMemoryPanel.tsx
"use client";

import { useState } from "react";
import {
  EvidenceBundle,
  ResearchIdea,
  SynthesisState,
  ScoreBundle,
  RiskProfile,
  Blueprint,
} from "@/lib/research/types";

interface MemoryMatch {
  id: string;
  createdAt: string;
  title: string;
  similarity: number;
  summary: string;
  buildabilityIndex: number | null;
  signalPulse: number | null;
  decisionNote: string | null;
}

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
  synthesis: SynthesisState | null;
  scores: ScoreBundle | null;
  risks: RiskProfile | null;
  blueprint: Blueprint | null;
  userId: string | null;
}

export default function ValidationMemoryPanel({
  idea,
  evidence,
  synthesis,
  scores,
  risks,
  blueprint,
  userId,
}: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matches, setMatches] = useState<MemoryMatch[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canSave = !!idea && !!scores && !!blueprint && !!userId; // require user + scores + blueprint

  const handleSave = async () => {
    if (!canSave || !userId) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/research/memory/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          idea,
          evidence,
          synthesis,
          scores,
          risks,
          blueprint,
          scenarioKey: null,
        }),
      });

      if (!res.ok) {
        console.error("ValidationMemory save error:", await res.text());
        setMessage("Something went wrong saving this run. Try again later.");
        setIsSaving(false);
        return;
      }

      setMessage("Saved this run to your Validation Memory.");
    } catch (err) {
      console.error("ValidationMemory save fetch error:", err);
      setMessage("Network error while saving. Try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLookup = async () => {
    if (!idea || !userId) return;
    setIsLoadingMatches(true);
    setMessage(null);

    try {
      const res = await fetch("/api/research/memory/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, idea }),
      });

      if (!res.ok) {
        console.error("ValidationMemory lookup error:", await res.text());
        setIsLoadingMatches(false);
        return;
      }

      const data = (await res.json()) as { matches: MemoryMatch[] };
      setMatches(data.matches || []);
    } catch (err) {
      console.error("ValidationMemory lookup fetch error:", err);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  return (
    <section className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-semibold text-slate-900">
            Validation Memory
          </h3>
          <p className="text-[10px] text-slate-600">
            Save this run and see how today&apos;s idea rhymes with your past
            bets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLookup}
            disabled={!idea || !userId || isLoadingMatches}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[10px] font-semibold text-slate-800 disabled:opacity-50"
          >
            {isLoadingMatches ? "Scanning past..." : "Find similar past ideas"}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="rounded-full border border-emerald-700 bg-emerald-700 px-3 py-1 text-[10px] font-semibold text-emerald-50 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save this run"}
          </button>
        </div>
      </div>

      {message && <p className="mb-2 text-[10px] text-slate-600">{message}</p>}

      {!userId && (
        <p className="text-[10px] text-slate-500">
          Sign in to start building your long-term Validation Memory.
        </p>
      )}

      {idea && !matches && userId && (
        <p className="text-[10px] text-slate-500">
          Save this run or search for similar past ideas to see patterns over
          time.
        </p>
      )}

      {idea && matches && (
        <div className="mt-2 space-y-2 text-[10px]">
          {matches.length === 0 ? (
            <p className="text-slate-500">
              No strongly similar past ideas yet. This might be your first
              exploration in this shape.
            </p>
          ) : (
            matches.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white p-2"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <div className="text-[10px] font-semibold text-slate-900">
                      {m.title || "Untitled idea"}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      {new Date(m.createdAt).toLocaleString()} ·{" "}
                      {m.buildabilityIndex != null
                        ? `Buildability ${m.buildabilityIndex}/100`
                        : "No score"}
                      {m.signalPulse != null
                        ? ` · Pulse ${m.signalPulse}/100`
                        : ""}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2 py-[1px] text-[9px] font-semibold text-slate-50">
                    {m.similarity}/100 match
                  </span>
                </div>
                <p className="mb-1 text-[10px] text-slate-700">{m.summary}</p>
                {m.decisionNote && (
                  <p className="text-[9px] text-slate-500">
                    Past decision: {m.decisionNote}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
