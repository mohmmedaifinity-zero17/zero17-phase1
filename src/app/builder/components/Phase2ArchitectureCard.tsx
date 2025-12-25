"use client";

import { useMemo, useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";
import { updateProject } from "@/app/builder/lib/updateProject";

function safeJson(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "{}";
  }
}

const DEFAULT_ARCH = {
  entities: [],
  agents: [],
  infra: {
    authProvider: "supabase",
    database: "supabase-postgres",
    hosting: "vercel",
    queue: "none",
  },
};

export default function Phase2ArchitectureCard({
  project,
  onProjectUpdatedAction,
}: {
  project: BuilderProject | null;
  onProjectUpdatedAction: (p: BuilderProject) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const current = useMemo(() => {
    const a = project?.architecture_json;
    return a && typeof a === "object" ? a : DEFAULT_ARCH;
  }, [project]);

  const [text, setText] = useState(() => safeJson(current));

  async function save() {
    if (!project) return;
    setSaving(true);
    setErr(null);

    try {
      let parsed: any;
      try {
        parsed = JSON.parse(text || "{}");
      } catch {
        throw new Error(
          "Architecture JSON is invalid. Fix formatting and retry."
        );
      }

      const updated = await updateProject(project.id, {
        architecture_json: parsed,
        status: "architected",
      });

      onProjectUpdatedAction(updated);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">
            2. Architecture & Agent Employees
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Entities + agents + infra (stored in{" "}
            <span className="font-mono">architecture_json</span>).
          </p>
        </div>

        <button
          onClick={save}
          disabled={!project || saving}
          className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-300"
        >
          {saving ? "Saving..." : "Save architecture"}
        </button>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {err}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-[11px] text-slate-800 outline-none focus:border-indigo-400"
        spellCheck={false}
      />
      <p className="mt-2 text-[11px] text-slate-500">
        Keep it explicit: entities, key fields, relationships, agent missions +
        tools.
      </p>
    </div>
  );
}
