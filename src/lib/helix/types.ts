// src/lib/helix/types.ts

export type HelixEventKind =
  | "research_run"
  | "growth_sprint"
  | "builder_spec"
  | "builder_blueprint"
  | "launch_plan"
  | "launch_assets"
  | "sprint"
  | "other";

export type HelixEventSource =
  | "research"
  | "builder"
  | "launch"
  | "growth"
  | "helix"
  | "system"
  | string;

export interface HelixEventMetadata {
  [key: string]: any;
}

export interface HelixEvent {
  id: string;
  user_id: string;
  source: HelixEventSource;
  kind: HelixEventKind;
  title: string;
  summary: string;
  next_move_summary?: string | null;
  metadata?: HelixEventMetadata | null;
  created_at: string;
}

/**
 * Output of the Helix Weekly Review engine.
 * This is what /api/helix/review returns and what the Helix UI renders.
 */
export interface HelixReviewTruth {
  title: string;
  detail: string;
}

export interface HelixReviewMove {
  title: string;
  detail: string;
  pillar: "research" | "builder" | "launch" | "growth" | "system";
}

export interface HelixReview {
  generatedAt: string;
  truths: HelixReviewTruth[];
  moves: HelixReviewMove[];
  riskFlags?: string[];
}
