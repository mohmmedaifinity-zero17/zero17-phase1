// src/lib/research/types.ts

// ─────────────────────────────────────────────
// Core idea & constraints
// ─────────────────────────────────────────────

export type MarketType =
  | "consumer"
  | "prosumer"
  | "smb"
  | "enterprise"
  | "unknown";

export interface ConstraintProfile {
  timeHorizonMonths: number | null;
  monthlyBudgetUsd: number | null;
  teamSize: "solo" | "duo" | "small" | "unknown";
}

export interface ResearchIdea {
  title: string;
  description: string;
  icp: string;
  outcome: string;
  marketType: MarketType;
  constraints: ConstraintProfile | null;
  // Optional: user declares they have no access to real users yet
  theoryMode?: boolean;
}

// ─────────────────────────────────────────────
// Evidence (Demand Receipts + Competitors)
// ─────────────────────────────────────────────

export type DemandSource = "dm" | "email" | "call" | "note";
export type DemandTag = "pain" | "feature_request" | "pricing" | "other";

export interface DemandReceipt {
  id: string;
  source: DemandSource;
  rawText: string;
  tag: DemandTag;
}

export interface CompetitorRef {
  id: string;
  name: string;
  url: string;
  notes?: string;
}

// 🔥 NEW: Auto competitor + auto reality scan types

export interface AutoCompetitor {
  name: string;
  category: string;
  description: string;
  angle: string; // their wedge / position
  pricingBand: string; // e.g. "Free–$30/mo", "Mid-ticket", "Enterprise"
  strength: string;
  weakness: string;
}

export interface AutoRealityScan {
  brutalSummary: string; // the hard truth about this idea & market
  categoryShape: string; // how the category is structured today
  demandSignals: string[]; // likely patterns of real demand
  gapsAndWedges: string[]; // places founder could wedge in
  futureThreats: string[]; // what could kill it in 12–36 months
  suggestedProof: string[]; // what to validate next with users/data
  autoCompetitors: AutoCompetitor[];
}
// 🔁 UPGRADED EvidenceBundle

export interface EvidenceBundle {
  receipts: DemandReceipt[];
  competitors: CompetitorRef[];
  autoScan?: AutoRealityScan | null; // 🧠 new auto brain snapshot
}
// ─────────────────────────────────────────────
// Matrix / Synthesis
// ─────────────────────────────────────────────

export type MatrixTimeframe = "near_term" | "mid_term" | "moonshot";

export type MatrixType =
  | "product_feature"
  | "interaction_pattern"
  | "business_model"
  | "ecosystem_move";

export type MatrixDifficulty = "light" | "moderate" | "heavy";

export interface MatrixFeature {
  label: string; // short codename
  timeframe: MatrixTimeframe;
  type: MatrixType;
  difficulty: MatrixDifficulty;
  description: string;
  whyInteresting: string;
  dependencies: string[];
}

export interface SynthesisState {
  fusionFeatures: string[]; // parity / strategic features user accepted
  mutationPatterns: string[]; // cross-category patterns adopted
  matrixFeatures: MatrixFeature[]; // structured Matrix features from Break The Matrix
}

// ─────────────────────────────────────────────
// Scores & Smart Metrics
// ─────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high" | "unknown";

export interface ScoreSubBundle {
  problemCertainty?: number;
  demandEvidence?: number;
  categoryMomentum?: number;
  icpClarity?: number;
  moatPotential?: number;
  dataAdvantage?: number;
  buildComplexity?: number;
  complianceLoad?: number;
  growthPathClarity?: number;
  revenueShape?: number;
}

export interface ProofStack {
  receiptsCount: number;
  competitorsCount: number;
  blueprintsCount: number; // from Validation Memory in future
}

export interface ScoreBundle {
  buildabilityIndex: number | null; // 0–100
  signalPulse: number | null; // 0–100
  subScores: ScoreSubBundle;
  riskLevel: RiskLevel;
  proofStack: ProofStack | null;
}

// ─────────────────────────────────────────────
// Risk / Compliance
// ─────────────────────────────────────────────

export interface RiskFlag {
  type: "legal" | "platform" | "pii" | "ethics" | "ops" | "financial" | "other";
  severity: "low" | "medium" | "high";
  summary: string;
  mitigation?: string;
}

export interface RiskProfile {
  overall: RiskLevel;
  flags: RiskFlag[];
}

// ─────────────────────────────────────────────
// Blueprint / Strategic Plan
// ─────────────────────────────────────────────

export interface Blueprint {
  id?: string;
  summary: string; // story block
  phase0Scope: string;
  phase1Scope: string;
  phase2Scope: string;
  featureStack: {
    core: string[];
    distinctive: string[];
    matrixOptional: string[];
  };
  systemPlan: string;
  gtmSeedPlan: string;
  decisionNote: string; // Validation Chief verdict
}

// ─────────────────────────────────────────────
// Success-Story Mirror
// ─────────────────────────────────────────────

export interface MirrorArchetype {
  name: string; // e.g. "Perplexity x Notion hybrid"
  description: string; // how it maps to this idea
  similarity: number; // 0–100 similarity index
  lessons: string[]; // what they did right
  warnings: string[]; // what went wrong / pitfalls
}

export interface SuccessMirror {
  primaryArchetype: MirrorArchetype | null;
  secondaryArchetypes: MirrorArchetype[];
  narrativeSummary: string; // short story-style mirror summary
  checkpoints: string[]; // concrete milestones founder should watch
}

// ─────────────────────────────────────────────
// Validation Memory
// ─────────────────────────────────────────────

export type ValidationDecision = "built" | "parked" | "killed" | "exploring";

export interface ValidationRecord {
  id: string;
  ideaId: string;
  ideaTitle: string;
  createdAt: string; // ISO
  decision: ValidationDecision;
  buildabilityIndex: number | null;
  signalPulse: number | null;
  shortNote: string;
  outcomeLater?: string | null; // user-updated outcome
}

export interface ValidationMemorySummary {
  recentRecords: ValidationRecord[];
  similarPastIdeas: ValidationRecord[];
}
