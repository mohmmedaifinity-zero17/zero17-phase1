export type ScoreInput = {
  idea: string;
  persona?: string;
  goal?: string;
  mustHaves?: string[];
};

export type ScalarScore = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;

export type ScoreResponse = {
  meta: {
    model: "slm-lite@v1";
    version: string;
    generatedAt: string;
  };
  scores: {
    risk: ScalarScore;
    opportunity: ScalarScore;
    ttfvDays: number;
    churnRisk: ScalarScore;
    confidence: ScalarScore;
  };
  inferences: {
    channelGuess: Array<
      "seo" | "social" | "community" | "partner" | "sales" | "product-led"
    >;
    copyAngle: Array<
      "speed" | "accuracy" | "trust" | "price" | "delight" | "enterprise"
    >;
  };
  redFlags: string[];
  mirror: string[];
  pulse: string[];
  rationale: string;
};









