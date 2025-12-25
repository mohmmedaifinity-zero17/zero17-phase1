import { computeScores } from "@/lib/slm";

describe("SLM-lite score contract", () => {
  it("returns bounded scores and required fields", () => {
    const res = computeScores({
      idea: "AI agent that automates newsletter growth for indie creators",
      persona: "Indie creators",
      goal: "Collect emails and publish weekly",
      mustHaves: ["auth", "email capture"],
    });

    expect(res.meta.model).toBe("slm-lite@v1");
    expect(typeof res.meta.generatedAt).toBe("string");

    expect(res.scores.risk).toBeGreaterThanOrEqual(0);
    expect(res.scores.risk).toBeLessThanOrEqual(100);
    expect(res.scores.opportunity).toBeGreaterThanOrEqual(0);
    expect(res.scores.opportunity).toBeLessThanOrEqual(100);
    expect(res.scores.confidence).toBeGreaterThanOrEqual(0);
    expect(res.scores.confidence).toBeLessThanOrEqual(100);

    expect(res.scores.ttfvDays).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.inferences.channelGuess)).toBe(true);
    expect(Array.isArray(res.inferences.copyAngle)).toBe(true);
    expect(Array.isArray(res.redFlags)).toBe(true);
    expect(Array.isArray(res.mirror)).toBe(true);
    expect(typeof res.rationale).toBe("string");
  });

  it("raises risk for regulated domains", () => {
    const res = computeScores({
      idea: "Fintech lending platform with KYC and AML for SMBs",
    });
    expect(res.scores.risk).toBeGreaterThanOrEqual(70);
    expect(res.redFlags.join(" ")).toMatch(/KYC|AML|compliance/i);
  });
});
