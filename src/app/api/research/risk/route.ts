// src/app/api/research/risk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  EvidenceBundle,
  ResearchIdea,
  RiskFlag,
  RiskProfile,
  SynthesisState,
  AutoRealityScan,
} from "@/lib/research/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = body.idea as ResearchIdea | undefined;
    const evidence = (body.evidence as EvidenceBundle | null) ?? null;
    const synthesis = (body.synthesis as SynthesisState | null) ?? null;

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const auto = evidence?.autoScan as AutoRealityScan | null;

    const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO REALITY SCAN:
${auto ? JSON.stringify(auto, null, 2) : "none"}

SYNTHESIS / MATRIX FEATURES:
${JSON.stringify(synthesis || {}, null, 2)}
`;

    const userPrompt = `
You are the RISK & COMPLIANCE RADAR inside Zero17.

Goal:
- Give a compact but serious risk map.
- You're not a lawyer, but you're informed and conservative.

Risk dimensions to scan:

- Legal/compliance:
  - scraping
  - regulated industries (health, finance, kids, workplace surveillance, etc.)
  - data residency, GDPR/CCPA-ish zones
- Platform / API:
  - over-reliance on single platform
  - TOS violations
- PII / trust / ethics:
  - deceptive UX
  - dark patterns
  - privacy risk
- Reliability / ops:
  - complexity that can blow up in production
- Financial:
  - business model fragility, hidden costs.

Your output:

1) overall: "low" | "medium" | "high" | "unknown"
2) flags: array of risk flags:
   - type: short label, e.g. "pii", "platform", "legal", "ops", "financial"
   - severity: "low" | "medium" | "high"
   - summary: 2–4 sentences, very clear.
   - mitigation: 1–3 sentences suggesting a safer alternative (Safe-Mode).

Context:
${helper}

Return JSON ONLY:

{
  "overall": "low" | "medium" | "high" | "unknown",
  "flags": [
    {
      "type": string,
      "severity": "low" | "medium" | "high",
      "summary": string,
      "mitigation": string
    }
  ]
}

- If risk is genuinely low, you can say "low" and give a few minor things to watch.
- Do NOT freak out the founder unnecessarily.
- Do NOT claim you are a lawyer.
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are Zero17's Risk Radar. Output ONLY JSON.",
        },
        { role: "user", content: userPrompt },
      ],
    });

    const raw =
      completion.output[0] &&
      "content" in completion.output[0] &&
      Array.isArray(completion.output[0].content) &&
      completion.output[0].content[0] &&
      "type" in completion.output[0].content[0] &&
      completion.output[0].content[0].type === "output_text" &&
      "text" in completion.output[0].content[0]
        ? completion.output[0].content[0].text
        : "{}";

    const parsed = JSON.parse(raw) as RiskProfile;

    // Basic safety
    if (!["low", "medium", "high", "unknown"].includes(parsed.overall)) {
      parsed.overall = "unknown";
    }
    parsed.flags = (parsed.flags || []).map((f: RiskFlag) => ({
      type: f.type || "unknown",
      severity: (["low", "medium", "high"].includes(f.severity)
        ? f.severity
        : "medium") as RiskFlag["severity"],
      summary: f.summary || "",
      mitigation: f.mitigation || "",
    }));

    return NextResponse.json({ risks: parsed });
  } catch (err: any) {
    console.error("[Zero17] Risk route error:", err);
    return NextResponse.json(
      {
        error: "Failed to compute risks",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
