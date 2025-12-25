import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST() {
  const buildId = `build-${Math.random().toString(36).slice(2, 10)}`;
  const timestamp = new Date().toISOString();

  const contractObj = { id: buildId, timestamp, scope: "launch-v1" };
  const depsObj = {
    deps: ["next@14", "react@18", "supabase-js"],
    lockfile: "pnpm-lock.yaml",
  };
  const preflightObj = { overallScore: 84, goNoGo: "TUNE" };
  const proofObj = {
    packVersion: "pow-pack-v2",
    projectName: "zero17-sample-project",
  };

  const contract = crypto
    .createHash("sha256")
    .update(JSON.stringify(contractObj))
    .digest("hex");
  const dependencies = crypto
    .createHash("sha256")
    .update(JSON.stringify(depsObj))
    .digest("hex");
  const preflight = crypto
    .createHash("sha256")
    .update(JSON.stringify(preflightObj))
    .digest("hex");
  const proofPack = crypto
    .createHash("sha256")
    .update(JSON.stringify(proofObj))
    .digest("hex");
  const combined = crypto
    .createHash("sha256")
    .update(contract + dependencies + preflight + proofPack)
    .digest("hex");

  const result = {
    buildId,
    timestamp,
    hashes: {
      contract,
      dependencies,
      preflight,
      proofPack,
      combined,
    },
  };

  return NextResponse.json(result, { status: 200 });
}
