"use client";

import { useEffect, useMemo, useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";
import type { CockpitMetrics } from "@/lib/builder/cockpit-metrics";

export default function CockpitPanel({
  project,
}: {
  project: BuilderProject | null;
}) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<CockpitMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const badge = useMemo(() => metrics?.overall.badge ?? "red", [metrics]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!project) {
        setMetrics(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/builder/cockpit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: project.id }),
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "Failed to load cockpit metrics");
        if (mounted) setMetrics(json as CockpitMetrics);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [project]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">8. OS Cockpit</p>
          <p className="mt-1 text-xs text-slate-600">
            Live readiness metrics (Spec → Architecture → Tests → Scan) with
            next-best actions.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={badgePill(badge)}>{badge.toUpperCase()}</span>
          <span className="text-[10px] text-slate-500">
            {project ? `${project.status}` : "No project selected"}
          </span>
        </div>
      </div>

      {!project && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Select a project to view cockpit signals.
        </div>
      )}

      {project && loading && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Loading cockpit…
        </div>
      )}

      {project && error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {project && metrics && (
        <div className="mt-4 space-y-4">
          {/* Overall */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Overall readiness
                </p>
                <p className="text-[11px] text-slate-500">
                  Aggregated from Spec, Architecture, Tests, Scan.
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {metrics.overall.score}/100
              </p>
            </div>
            <Progress value={metrics.overall.score} />
          </div>

          {/* Four pillars */}
          <div className="grid gap-3 md:grid-cols-2">
            <Pillar
              title="Spec"
              subtitle="Completeness of intent & definition"
              score={metrics.spec.score}
              lines={metrics.spec.missing}
            />
            <Pillar
              title="Architecture"
              subtitle={`Screens: ${metrics.architecture.counts.screens}, Entities: ${metrics.architecture.counts.entities}, APIs: ${metrics.architecture.counts.apis}`}
              score={metrics.architecture.score}
              lines={metrics.architecture.missing}
            />
            <Pillar
              title="Tests"
              subtitle={`Total: ${metrics.tests.total}, Pass: ${metrics.tests.pass}, Fail: ${metrics.tests.fail}`}
              score={metrics.tests.score}
              lines={metrics.tests.missing}
            />
            <Pillar
              title="Scan"
              subtitle={`Issues: ${metrics.scan.issues}`}
              score={metrics.scan.score}
              lines={metrics.scan.missing}
            />
          </div>

          {/* Next actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold text-slate-700">
              Next best actions
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {metrics.overall.nextBestActions.map((a, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="mt-[2px] h-2 w-2 rounded-full bg-slate-400" />
                  <span>{a}</span>
                </li>
              ))}
              {metrics.overall.nextBestActions.length === 0 && (
                <li className="text-slate-500">No actions — looks clean.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-slate-800"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function Pillar({
  title,
  subtitle,
  score,
  lines,
}: {
  title: string;
  subtitle: string;
  score: number;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <p className="text-sm font-semibold text-slate-800">{score}/100</p>
      </div>

      <Progress value={score} />

      {lines.length > 0 ? (
        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          <p className="text-[11px] font-semibold text-slate-700">Gaps</p>
          <ul className="mt-1 space-y-1 text-[11px] text-slate-600">
            {lines.slice(0, 4).map((l, idx) => (
              <li key={idx}>• {l}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-slate-500">No gaps detected.</p>
      )}
    </div>
  );
}

function badgePill(badge: "red" | "amber" | "green") {
  if (badge === "green")
    return "rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700";
  if (badge === "amber")
    return "rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700";
  return "rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700";
}
