"use client";

import { useState } from "react";

export default function PromotionApprovalPanel({
  projectId,
  approvals,
  frozen,
  freezeReason,
  onChanged,
}: {
  projectId: string;
  approvals?: any[];
  frozen?: boolean;
  freezeReason?: string;
  onChanged?: () => void;
}) {
  const [msg, setMsg] = useState<string | null>(null);

  const pending = (approvals || []).filter((a) => a.status === "pending");
  const blocked = !!frozen;

  async function decide(requestId: string, decision: "approved" | "denied") {
    setMsg(null);

    if (blocked) {
      setMsg(
        freezeReason || "Project is frozen. Approval actions are blocked."
      );
      return;
    }

    const res = await fetch("/api/builder/agents/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, requestId, decision }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || "Approval failed");
      return;
    }

    setMsg(
      decision === "approved" ? "Promotion approved." : "Promotion denied."
    );
    onChanged?.();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            Promotion approvals
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Human sign-off required for Production promotions.
          </p>
        </div>

        <div className="text-right text-[11px] text-slate-600">
          Pending:{" "}
          <span className="font-semibold text-slate-900">{pending.length}</span>
        </div>
      </div>

      {blocked && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
          <span className="font-semibold">Freeze mode is ON.</span> Promotion
          approvals are blocked.
          {freezeReason ? (
            <div className="mt-1 opacity-90">{freezeReason}</div>
          ) : null}
        </div>
      )}

      {pending.length === 0 ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          No pending approvals.
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {pending.map((a: any) => (
            <div
              key={a.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-900">
                    {a.type.toUpperCase()} • {a.agentId}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    {a.reason || "Approval required"}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>

              <pre className="mt-2 max-h-32 overflow-auto rounded bg-white p-2 text-[10px]">
                {JSON.stringify(a.metrics || {}, null, 2)}
              </pre>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => decide(a.id, "approved")}
                  disabled={blocked}
                  className={[
                    "rounded-xl px-3 py-1.5 text-xs font-semibold text-white",
                    blocked
                      ? "bg-slate-400"
                      : "bg-emerald-600 hover:bg-emerald-500",
                  ].join(" ")}
                >
                  Approve
                </button>
                <button
                  onClick={() => decide(a.id, "denied")}
                  disabled={blocked}
                  className={[
                    "rounded-xl px-3 py-1.5 text-xs font-semibold text-white",
                    blocked ? "bg-slate-400" : "bg-rose-600 hover:bg-rose-500",
                  ].join(" ")}
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {msg && <div className="mt-3 text-[11px] text-slate-700">{msg}</div>}
    </div>
  );
}
