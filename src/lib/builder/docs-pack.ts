// src/lib/builder/docs-pack.ts

import type { BuilderProject } from "@/lib/builder/types";

export type DocsPack = {
  generatedAt: string;
  packVersion: string;

  overview_md: string;
  product_brief_md: string;
  architecture_md: string;
  api_contracts_md: string;
  data_model_md: string;
  qa_testplan_md: string;
  deploy_checklist_md: string;
  client_pack_md: string;

  blueprint_json: any;
};

function mdHeader(title: string) {
  return `# ${title}\n\n`;
}

function safeJson(v: any) {
  try {
    return v ?? null;
  } catch {
    return null;
  }
}

function asList(items: string[]) {
  if (!items?.length) return "- (none)\n";
  return items.map((i) => `- ${i}`).join("\n") + "\n";
}

export function generateDocsPack(project: BuilderProject): DocsPack {
  const now = new Date().toISOString();

  const spec: any = (project as any).spec_json ?? null;
  const arch: any = (project as any).architecture_json ?? null;
  const tests: any = (project as any).test_plan_json ?? null;
  const scan: any = (project as any).scan_report_json ?? null;

  const title = project.title || "Untitled Project";

  const founderProblem = spec?.founderLens?.problem ?? "(missing)";
  const users = spec?.founderLens?.users ?? [];
  const coreFlows = spec?.founderLens?.coreFlows ?? [];
  const valueProps = spec?.clientLens?.whatYouGet ?? [];
  const roi = spec?.clientLens?.roiNarrative ?? "(missing)";
  const acceptanceTests = spec?.qaLens?.acceptanceTests ?? [];

  const screens = arch?.screens ?? [];
  const entities = arch?.entities ?? [];
  const apis = arch?.apis ?? [];
  const infra = arch?.infra ?? {};

  const testCases = tests?.cases ?? [];
  const scanIssues = scan?.issues ?? [];
  const scanScore = scan?.score ?? null;

  const overview_md =
    mdHeader(`${title} — Overview`) +
    `**Build Type:** ${project.build_type}\n\n` +
    `**Status:** ${project.status}\n\n` +
    `**Generated:** ${now}\n\n` +
    `## One-liner\n\n` +
    `${spec?.founderLens?.oneLiner ?? "(missing)"}\n\n` +
    `## Problem\n\n` +
    `${founderProblem}\n\n` +
    `## Target Users\n\n` +
    asList(Array.isArray(users) ? users : []) +
    `## Core Flows\n\n` +
    asList(Array.isArray(coreFlows) ? coreFlows : []);

  const product_brief_md =
    mdHeader(`${title} — Product Brief`) +
    `## What users get\n\n` +
    asList(Array.isArray(valueProps) ? valueProps : []) +
    `## ROI narrative\n\n` +
    `${roi}\n\n` +
    `## Pricing / packaging (draft)\n\n` +
    `${spec?.clientLens?.pricingDraft ?? "- (missing)\n"}\n\n` +
    `## Risk & constraints\n\n` +
    asList(spec?.qaLens?.risks ?? []);

  const architecture_md =
    mdHeader(`${title} — Architecture`) +
    `## Infra\n\n` +
    `- Auth: ${infra?.authProvider ?? "(missing)"}\n` +
    `- Database: ${infra?.database ?? "(missing)"}\n` +
    `- Hosting: ${infra?.hosting ?? "(missing)"}\n` +
    `- Storage: ${infra?.storage ?? "(missing)"}\n` +
    `- Billing: ${infra?.billingProvider ?? "(none)"}\n\n` +
    `## Screens\n\n` +
    (screens?.length
      ? screens
          .map(
            (s: any) =>
              `- **${s.name ?? s.title ?? "Screen"}** — ${s.purpose ?? ""}`
          )
          .join("\n") + "\n"
      : "- (none)\n") +
    `\n## APIs\n\n` +
    (apis?.length
      ? apis
          .map(
            (a: any) =>
              `- **${a.method ?? "GET"} ${a.path ?? "/"}** — ${a.purpose ?? ""}`
          )
          .join("\n") + "\n"
      : "- (none)\n");

  const api_contracts_md =
    mdHeader(`${title} — API Contracts`) +
    (apis?.length
      ? apis
          .map((a: any, idx: number) => {
            const req = a.requestSchema
              ? "```json\n" +
                JSON.stringify(a.requestSchema, null, 2) +
                "\n```\n"
              : "(missing)";
            const res = a.responseSchema
              ? "```json\n" +
                JSON.stringify(a.responseSchema, null, 2) +
                "\n```\n"
              : "(missing)";
            return (
              `## ${idx + 1}. ${a.method ?? "GET"} ${a.path ?? "/"}\n\n` +
              `**Purpose:** ${a.purpose ?? "(missing)"}\n\n` +
              `**Auth:** ${a.auth ?? "(missing)"}\n\n` +
              `### Request\n\n${req}\n\n` +
              `### Response\n\n${res}\n\n`
            );
          })
          .join("\n")
      : "No APIs defined.\n");

  const data_model_md =
    mdHeader(`${title} — Data Model`) +
    (entities?.length
      ? entities
          .map((e: any, idx: number) => {
            const fields = e.fields?.length
              ? e.fields
                  .map(
                    (f: any) =>
                      `- ${f.name}: ${f.type}${f.required ? " (required)" : ""}`
                  )
                  .join("\n")
              : "- (no fields defined)";
            return `## ${idx + 1}. ${e.name ?? "Entity"}\n\n${fields}\n\n`;
          })
          .join("\n")
      : "No entities defined.\n");

  const qa_testplan_md =
    mdHeader(`${title} — QA & Test Plan`) +
    `## Acceptance tests (from QA Lens)\n\n` +
    (acceptanceTests?.length
      ? acceptanceTests
          .map((t: any) => `- ${t.description ?? String(t)}`)
          .join("\n") + "\n"
      : "- (none)\n") +
    `\n## Phase 6 Test Plan (virtual sweep)\n\n` +
    (testCases?.length
      ? testCases
          .map(
            (c: any) => `- **${c.title}** — ${c.area} / ${c.risk} / ${c.status}`
          )
          .join("\n") + "\n"
      : "- (not generated yet)\n") +
    `\n## Phase 7 Scan signal\n\n` +
    `- Score: ${scanScore ?? "(not scanned yet)"}\n` +
    `- Issues: ${scanIssues?.length ?? 0}\n`;

  const deploy_checklist_md =
    mdHeader(`${title} — Deploy Checklist`) +
    `## Preflight\n\n` +
    `- [ ] ENV vars defined (Supabase URL, anon key, service role if needed)\n` +
    `- [ ] DB migrations applied\n` +
    `- [ ] Auth enabled + RLS policies verified\n` +
    `- [ ] Smoke test: create project, run tests, run scan\n\n` +
    `## Vercel / Hosting\n\n` +
    `- [ ] Build succeeds in CI\n` +
    `- [ ] Preview deployments enabled\n` +
    `- [ ] Observability: error tracking + logs\n\n` +
    `## Post-deploy\n\n` +
    `- [ ] Run Phase 6 tests\n` +
    `- [ ] Run Phase 7 scan\n` +
    `- [ ] Fix any High/Critical issues\n`;

  const client_pack_md =
    mdHeader(`${title} — Client Pack`) +
    `## What you get\n\n` +
    asList(Array.isArray(valueProps) ? valueProps : []) +
    `## Scope\n\n` +
    asList(Array.isArray(coreFlows) ? coreFlows : []) +
    `## Delivery format\n\n` +
    `- Hosted app + source code\n` +
    `- Setup guide + admin guide\n` +
    `- QA report + scan report\n\n` +
    `## Quality proof\n\n` +
    `- Phase 6 Test Plan generated\n` +
    `- Phase 7 Scan Score: ${scanScore ?? "(pending)"}\n` +
    `- Issues: ${scanIssues?.length ?? 0}\n\n` +
    `## Notes / assumptions\n\n` +
    `- This pack is generated from the current spec + architecture state.\n`;

  const blueprint_json = {
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      build_type: project.build_type,
      status: project.status,
      created_at: project.created_at,
      updated_at: project.updated_at,
    },
    spec_json: safeJson((project as any).spec_json),
    architecture_json: safeJson((project as any).architecture_json),
    test_plan_json: safeJson((project as any).test_plan_json),
    scan_report_json: safeJson((project as any).scan_report_json),
  };

  return {
    generatedAt: now,
    packVersion: "v1",
    overview_md,
    product_brief_md,
    architecture_md,
    api_contracts_md,
    data_model_md,
    qa_testplan_md,
    deploy_checklist_md,
    client_pack_md,
    blueprint_json,
  };
}
