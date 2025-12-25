// src/app/api/builder/proof/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

type FactoryResult = {
  projectName: string;
  variant: "speed" | "strategic";
  appliedFixes: string[];
  checks: {
    hasIssues?: boolean;
    perf: number;
    a11y: number;
    security: number;
    codeQuality: number;
    issues?: string[];
  };
  readiness: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectName, variant, factoryResult } = body as {
      projectName: string;
      variant: "speed" | "strategic";
      factoryResult: FactoryResult | null;
    };

    if (!projectName || !variant) {
      return NextResponse.json(
        { error: "projectName and variant are required" },
        { status: 400 }
      );
    }

    if (!factoryResult) {
      return NextResponse.json(
        { error: "factoryResult missing. Run Build Factory first." },
        { status: 400 }
      );
    }

    const generatedAt = new Date().toISOString();

    const strengths: string[] = [];
    const risks: string[] = [];

    if (factoryResult.checks.perf >= 80)
      strengths.push("Good performance baseline");
    else risks.push("Performance below target");

    if (factoryResult.checks.a11y >= 80)
      strengths.push("Accessibility looks solid");
    else risks.push("Accessibility needs attention");

    if (factoryResult.checks.security >= 80)
      strengths.push("No obvious security weaknesses");
    else risks.push("Security review required before production");

    if (factoryResult.checks.codeQuality >= 80)
      strengths.push("Code quality is healthy");
    else risks.push("Refactor recommended for long-term maintainability");

    const basePack = {
      meta: {
        id: `${projectName}-${variant}-${Date.now()}`,
        projectName,
        variant,
        generatedAt,
        version: "pow-pack@v1",
      },
      factory: factoryResult,
      summary: {
        readiness: factoryResult.readiness,
        strengths,
        risks,
      },
      checklist: [
        "Connect real auth provider",
        "Hook production database",
        "Configure environment variables",
        "Add analytics + monitoring",
        "Run manual QA on critical flows",
      ],
    };

    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(basePack))
      .digest("hex");

    const packWithHash = { ...basePack, hash };

    return NextResponse.json(packWithHash, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Proof pack generation failed" },
      { status: 500 }
    );
  }
}
