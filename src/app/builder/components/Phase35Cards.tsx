"use client";

import { useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";
import { updateProject } from "@/lib/builder/client/updateProject";
import RunTestsCard from "@/app/builder/components/RunTestsCard";
import RefineCard from "@/app/builder/components/RefineCard";

/**
 * Phase 3–6:
 * 3. Codegen plan        -> export_plan_json
 * 4. Refine              -> (handled by RefineCard)
 * 5. Virtual tests       -> (handled by RunTestsCard)
 * 6. Deploy blueprint    -> ops_json (deploy plan)
 */

export default function Phase35Cards({
  activeProject,
  setProjectsAction,
}: {
  activeProject: BuilderProject | null;
  setProjectsAction: React.Dispatch<React.SetStateAction<BuilderProject[]>>;
}) {
  const [codegenLoading, setCodegenLoading] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  const [codegenError, setCodegenError] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  async function runCodegen() {
    if (!activeProject) return;
    setCodegenLoading(true);
    setCodegenError(null);

    try {
      /**
       * 🔒 PHASE 3 — CODEGEN PLAN
       * Deterministic scaffold plan.
       * Stored into export_plan_json.
       */
      const scaffoldPlan = {
        generatedAt: new Date().toISOString(),
        strategy: "deterministic-planner",
        fileTree: [
          "src/app/page.tsx",
          "src/app/api",
          "src/components",
          "src/lib",
        ],
        commands: ["npm install", "npm run dev"],
        notes:
          "Planner-first scaffold. Codegen execution happens later in Build Factory.",
      };

      const result = await updateProject({
        projectId: activeProject.id,
        status: "planned",
        artifacts: {
          export_plan_json: scaffoldPlan,
        },
        meta: {
          module: "phase3_codegen_plan",
          note: "Generated deterministic codegen scaffold plan",
          actor: "system",
        },
      });

      if (result?.project) {
        setProjectsAction((prev) =>
          prev.map((x) => (x.id === result.project.id ? result.project : x))
        );
      }
    } catch (e: any) {
      setCodegenError(e?.message || "Codegen plan failed");
    } finally {
      setCodegenLoading(false);
    }
  }

  async function runDeployBlueprint() {
    if (!activeProject) return;
    setDeployLoading(true);
    setDeployError(null);

    try {
      /**
       * 🔒 PHASE 6 — DEPLOY BLUEPRINT
       * Stored into ops_json.
       */
      const deployBlueprint = {
        platform: "vercel",
        repo: "github",
        envVars: ["DATABASE_URL", "NEXTAUTH_SECRET"],
        migrations: ["prisma migrate deploy"],
        smokeTests: ["health-check", "auth-flow"],
        notes: "This is a blueprint only. Execution happens post-build.",
        generatedAt: new Date().toISOString(),
      };

      const result = await updateProject({
        projectId: activeProject.id,
        status: "deployment_planned",
        artifacts: {
          ops_json: deployBlueprint,
        },
        meta: {
          module: "phase6_deploy_blueprint",
          note: "Deploy checklist and infra plan drafted",
          actor: "system",
        },
      });

      if (result?.project) {
        setProjectsAction((prev) =>
          prev.map((x) => (x.id === result.project.id ? result.project : x))
        );
      }
    } catch (e: any) {
      setDeployError(e?.message || "Deploy blueprint failed");
    } finally {
      setDeployLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-800">
          3–6. Codegen plan, refine, tests, deploy blueprint
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Deterministic planning → refinement → virtual reliability → deploy
          blueprint.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* 3. Codegen */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                3. Codegen plan
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Generates a deterministic scaffold plan into{" "}
                <span className="font-mono">export_plan_json</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={runCodegen}
              disabled={!activeProject || codegenLoading}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:bg-slate-300"
            >
              {codegenLoading ? "Generating..." : "Generate plan"}
            </button>
          </div>

          {codegenError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {codegenError}
            </div>
          )}

          <p className="mt-3 text-[11px] text-slate-500">
            Planner-first. Actual execution happens later inside Build Factory.
          </p>
        </div>

        {/* 4. Refine */}
        <RefineCard
          project={activeProject}
          onProjectUpdatedAction={(p) => {
            setProjectsAction((prev) =>
              prev.map((x) => (x.id === p.id ? p : x))
            );
          }}
        />

        {/* 5. Virtual tests */}
        <RunTestsCard
          project={activeProject}
          onProjectUpdatedAction={(p: BuilderProject) => {
            setProjectsAction((prev) =>
              prev.map((x) => (x.id === p.id ? p : x))
            );
          }}
        />

        {/* 6. Deploy blueprint */}
        <div className="rounded-2xl border border-slate-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                6. Deploy blueprint
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Drafts a deploy checklist into{" "}
                <span className="font-mono">ops_json</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={runDeployBlueprint}
              disabled={!activeProject || deployLoading}
              className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:bg-slate-300"
            >
              {deployLoading ? "Drafting..." : "Deploy plan"}
            </button>
          </div>

          {deployError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {deployError}
            </div>
          )}

          <p className="mt-3 text-[11px] text-slate-500">
            Blueprint only. No infra is touched yet.
          </p>
        </div>
      </div>
    </div>
  );
}
