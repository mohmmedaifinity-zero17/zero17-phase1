import { NextResponse } from "next/server";
import {
  Agents,
  AgentRuns,
  AgentEvals,
  Artifacts,
  Dashboards,
  Metrics,
} from "@/lib/zero17-db";

export async function POST() {
  try {
    // Replace with a real project_id that exists in your "projects" table
    const project_id = "00000000-0000-0000-0000-000000000001";

    const agent = await Agents.create({
      project_id,
      name: "Zero17 Builder Bot",
      recipe_yaml: "steps:\n  - scaffold\n  - refactor\n  - deploy",
      policies: { allowDeploy: true },
    });

    const run = await AgentRuns.create({
      agent_id: agent.id,
      inputs: { idea: "AI dashboard MVP" },
      outputs: { files: ["app/page.tsx"] },
      passed: true,
      kpis: { time_minutes: 12 },
    });

    const evalRow = await AgentEvals.upsert({
      agent_id: agent.id,
      fixtures: { sample: true },
      redteam: { prompt_injection: "low" },
      last_passed_at: new Date().toISOString(),
      sla: { p95: "2s" },
    });

    const artifact = await Artifacts.add({
      project_id,
      type: "preview-url",
      path: "https://zero17-preview.vercel.app",
      meta: { commit: "abc123" },
    });

    const dashboard = await Dashboards.upsert({
      project_id,
      domain: "founder",
      config: { widgets: ["visits", "signups"] },
    });

    const metric = await Metrics.add({
      project_id,
      name: "time_saved_minutes",
      value: 90,
      meta: { flow: "idea-to-launch" },
    });

    return NextResponse.json({
      status: "ok",
      agent,
      run,
      eval: evalRow,
      artifact,
      dashboard,
      metric,
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
