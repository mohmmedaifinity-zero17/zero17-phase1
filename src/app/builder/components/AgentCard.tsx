"use client";

import Link from "next/link";
import AgentStatusRail from "@/app/builder/components/AgentStatusRail";

export default function AgentCard({
  row,
}: {
  row: {
    projectId: string;
    projectTitle: string;
    agentId: string;
    agentName: string;
    role?: string;
    status: "draft" | "shadow" | "production";
    pendingApproval: boolean;
  };
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {row.agentName}
            </p>

            {row.pendingApproval && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                Approval required
              </span>
            )}

            {row.status === "production" && !row.pendingApproval && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                Live
              </span>
            )}
          </div>

          <p className="mt-1 text-[11px] text-slate-600">
            Project:{" "}
            <span className="font-semibold text-slate-900">
              {row.projectTitle}
            </span>
          </p>

          {row.role ? (
            <p className="mt-0.5 text-[11px] text-slate-600">
              Role: <span className="text-slate-900">{row.role}</span>
            </p>
          ) : null}
        </div>

        <Link
          href="/builder"
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-900"
        >
          Open Builder
        </Link>
      </div>

      <AgentStatusRail status={row.status} />
    </div>
  );
}
