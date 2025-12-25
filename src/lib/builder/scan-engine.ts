// src/lib/builder/docs-pack.ts

import type { BuilderProject, DocsPack } from "@/lib/builder/types";

function mdHeader(t: string) {
  return `# ${t}\n\n`;
}

function list(items: string[] | undefined | null) {
  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) return "- (none)\n";
  return arr.map((x) => `- ${x}`).join("\n") + "\n";
}

export function generateDocsPack(project: BuilderProject): DocsPack {
  const now = new Date().toISOString();
  const spec: any = project.spec_json ?? null;
  const arch: any = project.architecture_json ?? null;
  const testPlan: any = (project as any).test_plan_json ?? null;
  const scan: any = (project as any).scan_report_json ?? null;

  const title = project.title || "Untitled";

  const overview_md =
    mdHeader(`${title} — Overview`) +
    `**Build Type:** ${project.build_type}\n\n` +
    `**Status:** ${project.status}\n\n` +
    `**Generated:** ${now}\n\n` +
    `## One-liner\n\n${spec?.founderLens?.oneLiner ?? "(missing)"}\n\n` +
    `## Problem\n\n${spec?.founderLens?.problem ?? "(missing)"}\n\n` +
    `## Users\n\n${list(spec?.founderLens?.users)}\n` +
    `## Core flows\n\n${list(spec?.founderLens?.coreFlows)}\n`;

  const product_brief_md =
    mdHeader(`${title} — Product Brief`) +
    `## What you get\n\n${list(spec?.clientLens?.whatYouGet)}\n` +
    `## ROI narrative\n\n${spec?.clientLens?.roiNarrative ?? "(missing)"}\n\n` +
    `## Pricing draft\n\n${spec?.clientLens?.pricingDraft ?? "(missing)"}\n\n`;

  const infra = arch?.infra ?? {};
  const screens = Array.isArray(arch?.screens) ? arch.screens : [];
  const entities = Array.isArray(arch?.entities) ? arch.entities : [];
  const apis = Array.isArray(arch?.apis) ? arch.apis : [];

  const architecture_md =
    mdHeader(`${title} — Architecture`) +
    `## Infra\n\n` +
    `- Auth: ${infra?.authProvider ?? "(missing)"}\n` +
    `- Database: ${infra?.database ?? "(missing)"}\n` +
    `- Hosting: ${infra?.hosting ?? "(missing)"}\n` +
    `- Storage: ${infra?.storage ?? "(missing)"}\n\n` +
    `## Screens\n\n` +
    (screens.length
      ? screens
          .map(
            (s: any) =>
              `- **${s.name ?? s.title ?? "Screen"}** — ${s.purpose ?? ""}`
          )
          .join("\n") + "\n"
      : "- (none)\n") +
    `\n## Entities\n\n` +
    (entities.length
      ? entities
          .map(
            (e: any) => `- **${e.name ?? "Entity"}** — ${e.description ?? ""}`
          )
          .join("\n") + "\n"
      : "- (none)\n") +
    `\n## APIs\n\n` +
    (apis.length
      ? apis
          .map(
            (a: any) =>
              `- **${a.method ?? "GET"} ${a.path ?? "/"}** — ${a.purpose ?? ""}`
          )
          .join("\n") + "\n"
      : "- (none)\n");

  const api_contracts_md =
    mdHeader(`${title} — API Contracts`) +
    (apis.length
      ? apis
          .map((a: any, i: number) => {
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
              `## ${i + 1}. ${a.method ?? "GET"} ${a.path ?? "/"}\n\n` +
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
    (entities.length
      ? entities
          .map((e: any, i: number) => {
            const fields = Array.isArray(e.fields) ? e.fields : [];
            const fieldLines =
              fields.length === 0
                ? "- (no fields defined)\n"
                : fields
                    .map(
                      (f: any) =>
                        `- ${f.name}: ${f.type}${f.required ? " (required)" : ""}`
                    )
                    .join("\n") + "\n";
            return `## ${i + 1}. ${e.name ?? "Entity"}\n\n${fieldLines}\n`;
          })
          .join("\n")
      : "No entities defined.\n");

  const qa_testplan_md =
    mdHeader(`${title} — QA & Test Plan`) +
    `## Acceptance tests\n\n` +
    (Array.isArray(spec?.qaLens?.acceptanceTests) &&
    spec.qaLens.acceptanceTests.length
      ? spec.qaLens.acceptanceTests
          .map((t: any) => `- ${t.description ?? String(t)}`)
          .join("\n") + "\n"
      : "- (none)\n") +
    `\n## Virtual test sweep (Phase 6)\n\n` +
    (Array.isArray(testPlan?.cases) && testPlan.cases.length
      ? testPlan.cases
          .map(
            (c: any) => `- **${c.title}** — ${c.status} (${c.area}/${c.risk})`
          )
          .join("\n") + "\n"
      : "- (not generated yet)\n") +
    `\n## Smart Scan (Phase 7)\n\n` +
    `- Score: ${typeof scan?.score === "number" ? `${scan.score}/100` : "(not scanned yet)"}\n` +
    `- Issues: ${Array.isArray(scan?.issues) ? scan.issues.length : 0}\n`;

  const deploy_checklist_md =
    mdHeader(`${title} — Deploy Checklist`) +
    `## Preflight\n\n` +
    `- [ ] ENV vars set\n` +
    `- [ ] DB migrations applied\n` +
    `- [ ] Auth + RLS verified\n` +
    `- [ ] Smoke test executed\n\n` +
    `## Deploy\n\n` +
    `- [ ] Build succeeds\n` +
    `- [ ] Preview deployments on\n` +
    `- [ ] Error tracking/logging enabled\n\n` +
    `## Post-deploy\n\n` +
    `- [ ] Re-run tests\n` +
    `- [ ] Re-run scan\n` +
    `- [ ] Fix high/critical issues\n`;

  const client_pack_md =
    mdHeader(`${title} — Client Pack`) +
    `## What you get\n\n${list(spec?.clientLens?.whatYouGet)}\n` +
    `## Core flows\n\n${list(spec?.founderLens?.coreFlows)}\n` +
    `## Trust signals\n\n` +
    `- Virtual tests generated\n` +
    `- Scan score: ${typeof scan?.score === "number" ? `${scan.score}/100` : "(pending)"}\n\n`;

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
    spec_json: project.spec_json ?? null,
    architecture_json: project.architecture_json ?? null,
    test_plan_json: (project as any).test_plan_json ?? null,
    scan_report_json: (project as any).scan_report_json ?? null,
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
