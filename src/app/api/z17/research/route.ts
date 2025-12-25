// src/app/api/z17/research/route.ts
import { NextResponse } from "next/server";

type Mode =
  | "qie"
  | "atomic"
  | "sim"
  | "blueprint"
  | "boardroom"
  | "whatif"
  | "investor";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = (body.mode || "qie") as Mode;
    const idea: string = body.idea || "";
    const icp: string = body.icp || "";
    const stage: string = body.stage || "prelaunch";

    if (!idea.trim()) {
      return NextResponse.json(
        { ok: false, error: "Missing idea in request body" },
        { status: 400 }
      );
    }

    // For now, return deterministic mock structures.
    // Later: plug in your LLM calls here using OPENAI_API_KEY etc.
    switch (mode) {
      case "qie":
        return NextResponse.json({
          ok: true,
          mode,
          idea,
          icp,
          stage,
          parity: [
            "Matches current best-in-class UX for the category.",
            "Covers core feature parity demanded by ICP.",
          ],
          differentiation: [
            "Focuses on solo founders in emerging markets.",
            "Bakes in growth engine instead of add-on analytics.",
          ],
          invention: [
            "Introduces a God-mode OS that compresses research → build → growth.",
          ],
          starFeatures: [
            "Quantum Idea Engine that invents new category moves.",
            "Agent employees with a full growth department in one pipeline.",
            "Truth Ledger and Proof-of-Work Packs as default output.",
          ],
          unfairAdvantages: [
            "Tight integration with agents + build + growth.",
            "One unified OS vs scattered tools.",
          ],
        });

      case "atomic":
        return NextResponse.json({
          ok: true,
          mode,
          blocks: {
            problemProof:
              "Founders lose months context-switching between research, build, and growth tools.",
            userPsychology:
              "They crave a trusted co-founder brain that thinks for them but still lets them decide.",
            categoryFrictions:
              "Most AI tools are either code-focused or marketing-focused, not an OS.",
            unseenOpportunities: [
              "Own the 'founder OS' narrative end-to-end.",
              "Become the de-facto place where proof lives.",
            ],
            riskMap: ["Execution complexity", "Education curve", "API costs"],
          },
          nextMoves: [
            "Tighten the primary ICP and messaging before building extra pillars.",
            "Prove one killer workflow (idea → MVP → launch) before adding more complexity.",
          ],
        });

      case "sim":
        return NextResponse.json({
          ok: true,
          mode,
          demandHeat:
            "Demand for founder-focused AI copilots and OSs is rising fast in 2025–2027.",
          competitorMoves: [
            "Big players will ship shallow founder dashboards.",
            "Niche tools will pick off single workflows (only launch, only growth).",
          ],
          growthCurve:
            "If you nail one wedge (Zero17 for solo AI founders), you can realistically hit 5–20k MRR within 12–18 months with compounding proof.",
          unitEconomics: {
            targetCAC:
              "₹2,000–₹4,000 per paying founder via content + referrals.",
            payback: "1–2 months with ₹3k+ entry plans.",
            comments:
              "Bundling build + growth increases perceived value and justifies higher pricing.",
          },
        });

      case "blueprint":
        return NextResponse.json({
          ok: true,
          mode,
          headline: "Zero17 – Founder Operating System v1 Blueprint",
          scope: [
            "Research Lab v4.0 (idea → proof → blueprint)",
            "Builder Lab (MVP + QA + deploy)",
            "Launch Engine (proof + ledger + assets)",
            "Growth OS (offers, proof, agents, loops)",
          ],
          mvpCut: [
            "Focus v1 on AI founders building MVPs and agents.",
            "Ship full idea → MVP → launch → growth loop for one tight ICP.",
          ],
          dataModel: [
            "Projects",
            "Research Snapshots",
            "Build Artifacts",
            "Launch Proof",
            "Growth Experiments",
          ],
          risks: [
            "Over-building v1 instead of shipping a sharp core.",
            "Under-investing in UX and clarity.",
          ],
          timeline: [
            "30 days solo to v1 (using Cursor + ChatGPT).",
            "60–90 days to polish, gather proof, and tune pricing.",
          ],
        });

      case "boardroom":
        return NextResponse.json({
          ok: true,
          mode,
          voices: [
            {
              role: "CTO",
              stance:
                "Technically feasible if we keep v1 scope tight and reuse patterns in Builder and Growth.",
            },
            {
              role: "CPO",
              stance:
                "We must obsess over one golden workflow, not try to be everything on day one.",
            },
            {
              role: "VC",
              stance:
                "If this becomes the default founder OS, it is a massive category. But we need proof that founders come back daily.",
            },
            {
              role: "Growth Lead",
              stance:
                "We need a Wedge → Hook → Habit loop. The Research Lab is the wedge; daily HELIX + Growth OS is the habit.",
            },
          ],
          summary:
            "The boardroom agrees: focus on one insane core experience, then scale horizontally.",
        });

      case "whatif":
        return NextResponse.json({
          ok: true,
          mode,
          scenarios: [
            {
              label: "What if you target only agency owners?",
              impact:
                "Fewer but higher-ticket customers, different features (client reporting, white-labeling).",
            },
            {
              label: "What if you ship only Research Lab + Builder first?",
              impact:
                "Faster time-to-market, but growth differentiation becomes weaker until Growth OS is ready.",
            },
          ],
          recommendation:
            "Pick one ICP and one flagship workflow. Use What-If mode to explore, but keep v1 brutally focused.",
        });

      case "investor":
        return NextResponse.json({
          ok: true,
          mode,
          pitchHeadline: "Zero17 – The Operating System for Solo AI Founders",
          narrative:
            "Founders are drowning in tools and starving for proof. Zero17 compresses idea → MVP → launch → growth into one OS, with proof at every step.",
          slides: [
            "1. Problem & Opportunity",
            "2. Product (Research Lab, Builder, Launch, Growth OS)",
            "3. Proof & Traction (PoW packs, daily use, agents)",
            "4. Business Model & Economics",
            "5. Vision – the default Founder OS for the next decade",
          ],
          nextSteps: [
            "Ship v1 and gather vivid founder case studies.",
            "Use Investor Pack as a way to clarify your own story.",
          ],
        });

      default:
        return NextResponse.json({ ok: false, error: "Unknown mode" });
    }
  } catch (err) {
    console.error("Research API error", err);
    return NextResponse.json(
      { ok: false, error: "Internal error in research engine" },
      { status: 500 }
    );
  }
}
