// src/components/growth/SprintEnginePanel.tsx
"use client";

import { useEffect, useState } from "react";
import type {
  GrowthMasterbrainOutput,
  GrowthSprintPlan,
  GrowthSprintDayTask,
} from "@/lib/growth/types";

type Props = {
  masterbrain: GrowthMasterbrainOutput | null;
  sprint: GrowthSprintPlan | null;
  onSprintChangeAction: (s: GrowthSprintPlan | null) => void;
  onStepChangeAction: (s: 1 | 2 | 3) => void;
};

export default function SprintEnginePanel({
  masterbrain,
  sprint,
  onSprintChangeAction,
  onStepChangeAction,
}: Props) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sprint && masterbrain) {
      const monday = getCurrentWeekMondayISO();
      const tasks: GrowthSprintDayTask[] = Array.from({ length: 7 }).map(
        (_, idx) => ({
          day: idx + 1,
          title: `Day ${idx + 1}`,
          coreAction: "",
          quickWin: "",
          scriptSummary: "",
        })
      );

      const autoPlan: GrowthSprintPlan = {
        weekOf: monday,
        focusSummary: `7-day sprint focused on ${masterbrain.primaryEngine.toUpperCase()} to push ${masterbrain.northStarMetric}.`,
        primaryEngine: masterbrain.primaryEngine,
        secondaryEngine: masterbrain.secondaryEngine,
        northStarMetric: masterbrain.northStarMetric,
        targetValue: masterbrain.weeklyTarget,
        tasks,
      };

      onSprintChangeAction(autoPlan);
    }
  }, [masterbrain, sprint, onSprintChangeAction]);

  const saveSprint = async () => {
    if (!sprint) return;
    setSaving(true);
    try {
      const res = await fetch("/api/growth/sprint", {
        method: "POST",
        body: JSON.stringify(sprint),
      });
      if (!res.ok) throw new Error("Failed to save sprint");
      const data = (await res.json()) as GrowthSprintPlan;
      onSprintChangeAction(data);
      onStepChangeAction(3);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateTask = (day: number, partial: Partial<GrowthSprintDayTask>) => {
    if (!sprint) return;
    const tasks = sprint.tasks.map((t) =>
      t.day === day ? { ...t, ...partial } : t
    );
    onSprintChangeAction({ ...sprint, tasks });
  };

  return (
    <section
      id="growth-step-2"
      className="rounded-2xl bg-white/80 p-5 shadow-sm border border-slate-200"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-200">
              STEP 2 · 7-DAY SPRINT ENGINE
            </span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            Lock your 7-day survival sprint.
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Convert Masterbrain’s strategy into seven brutal, realistic days of
            action. One core move per day. No growth theatre.
          </p>
        </div>
      </div>

      {!sprint && (
        <p className="text-xs text-slate-500">
          Run Growth Masterbrain first to auto-generate a sprint plan.
        </p>
      )}

      {sprint && (
        <>
          <div className="mb-3 text-xs text-slate-700">
            <div className="font-semibold">
              Week of {sprint.weekOf} — {sprint.focusSummary}
            </div>
            <div className="mt-1 text-[11px]">
              Engine:{" "}
              <span className="font-semibold">
                {sprint.primaryEngine.toUpperCase()}
              </span>
              {sprint.secondaryEngine && (
                <>
                  {" "}
                  · Support:{" "}
                  <span className="font-semibold">
                    {sprint.secondaryEngine.toUpperCase()}
                  </span>
                </>
              )}
            </div>
            <div className="mt-1 text-[11px]">
              North star:{" "}
              <span className="font-semibold">{sprint.northStarMetric}</span> —
              target:{" "}
              <span className="font-semibold text-emerald-700">
                {sprint.targetValue}
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {sprint.tasks.map((task) => (
              <div
                key={task.day}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
              >
                <div className="text-[11px] font-semibold text-slate-800">
                  Day {task.day}
                </div>
                <div className="mt-2">
                  <label className="text-[10px] font-medium text-slate-700">
                    Core action
                  </label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                    placeholder="e.g. 20 targeted DMs to ICP, asking one sharp question..."
                    value={task.coreAction}
                    onChange={(e) =>
                      updateTask(task.day, { coreAction: e.target.value })
                    }
                  />
                </div>
                <div className="mt-2">
                  <label className="text-[10px] font-medium text-slate-700">
                    1-hour win
                  </label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                    placeholder="e.g. Refine DM opener, send 5 to warm leads..."
                    value={task.quickWin}
                    onChange={(e) =>
                      updateTask(task.day, { quickWin: e.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              Keep each day brutally simple. The OS cares more that you finish
              the sprint than that it looks impressive.
            </p>
            <button
              onClick={saveSprint}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-50 shadow-sm hover:bg-black disabled:opacity-60"
            >
              {saving ? "Saving sprint..." : "Save sprint & move to Proof"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function getCurrentWeekMondayISO() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}
