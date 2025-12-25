// src/lib/growth/types.ts

export type ProductStage =
  | "idea"
  | "pre-launch"
  | "beta"
  | "live-early"
  | "live-scaling";

export type ProductType =
  | "saas"
  | "agency"
  | "info-product"
  | "community"
  | "tool"
  | "other";

export type GrowthSkill =
  | "cold-outreach"
  | "content"
  | "paid-ads"
  | "partnerships"
  | "seo"
  | "ops"
  | "product";

export type GrowthMasterbrainInput = {
  productType: ProductType;
  icpDescription: string;
  pricePoint: string;
  currentStage: ProductStage;
  currentMRR?: number | null;
  timePerWeekHours: number;
  budgetPerMonth: string;
  skills: GrowthSkill[];
  constraints: string;
};

export type GrowthArchetype = {
  id: string;
  label: string;
  description: string;
  famousExamples: string[];
};

export type GrowthEngineName =
  | "outbound"
  | "organic-content"
  | "referrals"
  | "paid"
  | "product-led"
  | "community";

export type GrowthMasterbrainOutput = {
  primaryEngine: GrowthEngineName;
  secondaryEngine: GrowthEngineName | null;
  growthArchetype: GrowthArchetype;
  northStarMetric: string;
  weeklyTarget: string;
  threatRadar: string[];
  moatMap: string[];
  notes: string;
};

export type GrowthSnapshot = {
  buildStageLabel: string;
  growthTemperature: "cold" | "warming" | "hot";
  riskFlags: string[];
  strengths: string[];
  focusNarrative: string;
};

export type GrowthSprintDayTask = {
  day: number;
  title: string;
  coreAction: string;
  quickWin: string;
  scriptSummary: string;
};

export type GrowthSprintPlan = {
  id?: string;
  userId?: string;
  weekOf: string;
  focusSummary: string;
  primaryEngine: GrowthEngineName;
  secondaryEngine: GrowthEngineName | null;
  northStarMetric: string;
  targetValue: string;
  tasks: GrowthSprintDayTask[];
  createdAt?: string;
  updatedAt?: string;
};

export type PulseEventType =
  | "metric_change"
  | "user_story"
  | "experiment"
  | "good_news"
  | "bad_news";

export type PulseEvent = {
  id: string;
  type: PulseEventType;
  title: string;
  detail: string;
  impact: "positive" | "negative" | "neutral";
  createdAt: string;
};

export type GrowthDNAArchetypeSample = {
  id: string;
  label: string;
  companyExamples: string[];
  description: string;
  whyMatch: string;
  keyMoves: string[];
};

export type GrowthDNAPlan = {
  primaryArchetypeSummary: string;
  mergedPlaybookSummary: string;
  archetypes: GrowthDNAArchetypeSample[];
  sevenDayPlan: {
    day: number;
    title: string;
    focus: string;
    actions: string[];
  }[];
  notes: string;
};

// ⭐ NEW – Monetization, Loops, Objections

export type MonetizationPlay = {
  id: string;
  label: string;
  description: string;
  pricingShape: string; // e.g. "freemium", "usage-based", "tiered SaaS"
  targetSegment: string;
  pros: string[];
  cons: string[];
  whenToUse: string;
};

export type MonetizationPlan = {
  headline: string;
  summary: string;
  plays: MonetizationPlay[];
  launchSequence: {
    step: number;
    title: string;
    details: string;
  }[];
  guardrails: string[];
};

export type GrowthLoopNode = {
  id: string;
  label: string;
  role: "input" | "activation" | "value" | "output" | "referral";
  description: string;
};

export type GrowthLoop = {
  id: string;
  name: string;
  narrative: string;
  nodes: GrowthLoopNode[];
  riskNotes: string[];
};

export type LoopDesignPlan = {
  headline: string;
  loops: GrowthLoop[];
  implementationSteps: {
    step: number;
    title: string;
    details: string;
  }[];
};

export type ObjectionItem = {
  id: string;
  objection: string;
  severity: "low" | "medium" | "high";
  rebuttal: string;
  proofIdeas: string[];
};

export type ObjectionPlaybook = {
  headline: string;
  summary: string;
  objections: ObjectionItem[];
  fieldScripts: string[]; // lines founder can literally use in DMs/calls
};

// ⭐ Dominion Autopilot combined result

export type DominionAutopilotResult = {
  masterbrain: GrowthMasterbrainOutput;
  dna: GrowthDNAPlan;
  sprint: GrowthSprintPlan;
  snapshot: GrowthSnapshot;
  pulseDefaults: PulseEvent[];
  monetization: MonetizationPlan;
  loops: LoopDesignPlan;
  objections: ObjectionPlaybook;
};
