// src/components/research/researchSnapshot.ts

export type ResearchSnapshot = {
  idea: string;
  icp: string;
  outcome: string;
  mustHaves: string;
  tone: string;
  marketType: string;
  stage: string;
  blueprintHeadline: string;
  lastQieSummary: string;
  updatedAt: string;
};

const STORAGE_KEY = "zero17_research_snapshot_v3";

export function loadResearchSnapshot(): ResearchSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResearchSnapshot;
  } catch {
    return null;
  }
}

export function saveResearchSnapshot(partial: Partial<ResearchSnapshot>) {
  if (typeof window === "undefined") return;
  const existing = loadResearchSnapshot();
  const snapshot: ResearchSnapshot = {
    idea: existing?.idea || "",
    icp: existing?.icp || "",
    outcome: existing?.outcome || "",
    mustHaves: existing?.mustHaves || "",
    tone: existing?.tone || "Practical",
    marketType: existing?.marketType || "SMB",
    stage: existing?.stage || "Idea",
    blueprintHeadline: existing?.blueprintHeadline || "",
    lastQieSummary: existing?.lastQieSummary || "",
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearResearchSnapshot() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
