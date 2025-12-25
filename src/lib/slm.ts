import { ScoreInput, ScoreResponse, ScalarScore } from "@/types/slm";

const highRisk = [
  /medical|health|hipaa/i,
  /fintech|trading|lending|kyc/i,
  /kids|minor/i,
];
const strongSignals = [
  /automation|agent|workflow/i,
  /translation|localization/i,
  /analytics|dashboard/i,
  /b2b/i,
  /niche/i,
];
const enterpriseHints = [/sso|saml|audit|compliance|sla|multi-tenant/i];
const fastTTFV = [/landing page|waitlist|lead gen|notion/i];

function bucket(n: number): ScalarScore {
  const s = Math.max(0, Math.min(100, Math.round(n / 10) * 10)) as ScalarScore;
  return s;
}

export function computeScores(input: ScoreInput): ScoreResponse {
  const idea = input.idea.trim();
  const lower = idea.toLowerCase();

  let risk = 30;
  if (highRisk.some((r) => r.test(idea))) risk += 40;
  if (enterpriseHints.some((r) => r.test(idea))) risk += 10;
  risk = Math.min(100, risk);

  let opportunity = 50;
  if (strongSignals.some((r) => r.test(idea))) opportunity += 30;
  if (lower.includes("ai") || lower.includes("agent")) opportunity += 10;
  opportunity = Math.min(100, opportunity);

  const isSpecific =
    /for\s+([a-z]+)\s+(teams|founders|agencies|students|creators)/i.test(
      idea
    ) || /for\s+\w+\s+in\s+\w+/.test(idea);
  let churnRisk = isSpecific ? 30 : 60;
  if (enterpriseHints.some((r) => r.test(idea))) churnRisk -= 10;
  churnRisk = Math.max(0, Math.min(100, churnRisk));

  let confidence = 40;
  const hasPersona = !!input.persona && input.persona.length > 2;
  const hasGoal = !!input.goal && input.goal.length > 2;
  const hasMusts = (input.mustHaves ?? []).length > 0;
  if (hasPersona) confidence += 15;
  if (hasGoal) confidence += 15;
  if (hasMusts) confidence += 10;
  if (isSpecific) confidence += 10;
  confidence = Math.min(100, confidence);

  let ttfvDays = 10;
  if (fastTTFV.some((r) => r.test(idea))) ttfvDays = 2;
  else if (lower.includes("dashboard") || lower.includes("notion"))
    ttfvDays = 5;
  else if (enterpriseHints.some((r) => r.test(idea))) ttfvDays = 21;

  const channels: ScoreResponse["inferences"]["channelGuess"] = [];
  if (lower.includes("seo") || lower.includes("docs")) channels.push("seo");
  if (
    lower.includes("community") ||
    lower.includes("discord") ||
    lower.includes("slack")
  )
    channels.push("community");
  if (lower.includes("integration") || lower.includes("partners"))
    channels.push("partner");
  if (lower.includes("sales") || lower.includes("enterprise"))
    channels.push("sales");
  if (channels.length === 0) channels.push("social", "product-led");

  const copy: ScoreResponse["inferences"]["copyAngle"] = [];
  if (ttfvDays <= 5) copy.push("speed");
  if (risk >= 70) copy.push("trust");
  if (opportunity >= 80) copy.push("delight");
  if (enterpriseHints.some((r) => r.test(idea))) copy.push("enterprise");
  if (copy.length === 0) copy.push("accuracy");

  const redFlags: string[] = [];
  if (highRisk[0].test(idea)) redFlags.push("Healthcare data → HIPAA/PHI risk");
  if (highRisk[1].test(idea)) redFlags.push("Fintech/KYC/AML obligations");
  if (highRisk[2].test(idea))
    redFlags.push("COPPA/child-protection constraints");
  if (enterpriseHints.some((r) => r.test(idea)))
    redFlags.push("Enterprise compliance expectations (SSO/SOC2)");

  const mirror: string[] = [];
  if (/website|landing/i.test(idea)) mirror.push("Typedream", "Framer");
  if (/payments|checkout/i.test(idea)) mirror.push("Gumroad", "LemonSqueezy");
  if (/newsletter|blog|content/i.test(idea)) mirror.push("Beehiiv", "Ghost");
  if (mirror.length === 0) mirror.push("Notion", "Zapier");

  const pulse: string[] = [];
  if (lower.includes("agent"))
    pulse.push("Agent frameworks trending: orchestration & evals");
  if (lower.includes("translation"))
    pulse.push("Localization spikes in SaaS for SEO");
  if (lower.includes("analytics") || lower.includes("dashboard"))
    pulse.push("Founders demand self-serve analytics");

  const rationale = [
    `Risk=${risk} due to domain keywords & compliance hints`,
    `Opportunity=${opportunity} from demand signals & AI/agent context`,
    `TTFV≈${ttfvDays}d based on surface and deployment path`,
    `Confidence=${confidence} influenced by persona/goal specificity`,
  ].join(" • ");

  return {
    meta: {
      model: "slm-lite@v1",
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
    },
    scores: {
      risk: bucket(risk),
      opportunity: bucket(opportunity),
      ttfvDays,
      churnRisk: bucket(churnRisk),
      confidence: bucket(confidence),
    },
    inferences: {
      channelGuess: channels,
      copyAngle: copy,
    },
    redFlags,
    mirror,
    pulse,
    rationale,
  };
}
