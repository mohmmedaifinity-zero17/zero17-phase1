// src/lib/research/validationMemory.ts
import {
  ResearchIdea,
  ScoreBundle,
  ValidationDecision,
  ValidationRecord,
  ValidationMemorySummary,
} from "./types";

// These are stubs. Later: connect to Supabase or your DB.

export async function recordValidationRun(args: {
  idea: ResearchIdea;
  scores: ScoreBundle | null;
  decision: ValidationDecision;
  shortNote: string;
}): Promise<ValidationRecord> {
  const now = new Date().toISOString();
  const rec: ValidationRecord = {
    id: crypto.randomUUID(),
    ideaId: crypto.randomUUID(), // later: stable idea id
    ideaTitle: args.idea.title,
    createdAt: now,
    decision: args.decision,
    buildabilityIndex: args.scores?.buildabilityIndex ?? null,
    signalPulse: args.scores?.signalPulse ?? null,
    shortNote: args.shortNote,
    outcomeLater: null,
  };

  // TODO: persist rec to DB
  return rec;
}

export async function getValidationMemorySummary(
  idea: ResearchIdea
): Promise<ValidationMemorySummary> {
  // TODO: fetch from DB; for now, empty
  return {
    recentRecords: [],
    similarPastIdeas: [],
  };
}
