"use client";

import { useMemo, useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";
import { updateProject } from "@/app/builder/lib/updateProject";

type LensKey = "founder" | "product" | "tech" | "ux" | "launch";

const LENSES: { key: LensKey; title: string; hint: string }[] = [
  {
    key: "founder",
    title: "Founder Lens",
    hint: "Problem → target user → desired outcome → why now",
  },
  {
    key: "product",
    title: "Product Lens",
    hint: "Core features → non-goals → scope boundaries",
  },
  {
    key: "tech",
    title: "Tech Lens",
    hint: "Stack → data model → constraints → integrations",
  },
  {
    key: "ux",
    title: "UX Lens",
    hint: "Primary flows → copy tone → friction removal",
  },
  {
    key: "launch",
    title: "Launch Lens",
    hint: "Pricing → success metric → distribution plan",
  },
];

function safeJson(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "{}";
  }
}

export default function Phase1SpecCard({
  project,
  onProjectUpdatedAction,
}: {
  project: BuilderProject | null;
  onProjectUpdatedAction: (p: BuilderProject) => void;
}) {
  const [active, setActive] = useState<LensKey>("founder");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const spec = (project?.spec_json ?? null) as any;

  const draft = useMemo(() => {
    const base = spec && typeof spec === "object" ? { ...spec } : {};
    for (const l of LENSES) base[l.key] = base[l.key] ?? {};
    return base;
  }, [spec]);

  const [text, setText] = useState(() => safeJson(draft[active]));

  function selectLens(k: LensKey) {
    setActive(k);
    setText(safeJson(draft[k]));
    setErr(null);
  }

  async function save() {
    if (!project) return;
    setSaving(true);
    setErr(null);

    try {
      let parsed: any = {};
      try {
        parsed = JSON.parse(text || "{}");
      } catch {
        throw new Error("Lens JSON is invalid. Fix JSON formatting and retry.");
      }

      const nextSpec = { ...draft, [active]: parsed };

      const updated = await updateProject(project.id, {
        spec_json: nextSpec,
        status: "structured",
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
            1. Intent & Multi-Lens Spec
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Fill lenses. We store everything into{" "}
            <span className="font-mono">spec_json</span>.
          </p>
        </div>

        <button
          onClick={save}
          disabled={!project || saving}
          className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:bg-slate-300"
        >
          {saving ? "Saving..." : "Save lens"}
        </button>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {err}
        </div>
      )}

      <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          {LENSES.map((l) => (
            <button
              key={l.key}
              onClick={() => selectLens(l.key)}
              className={[
                "w-full rounded-xl border px-3 py-2 text-left",
                active === l.key
                  ? "border-sky-300 bg-sky-50"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <p className="text-xs font-semibold text-slate-800">{l.title}</p>
              <p className="mt-1 text-[11px] text-slate-500">{l.hint}</p>
            </button>
          ))}
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-700">
            {LENSES.find((x) => x.key === active)?.title}
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-[11px] text-slate-800 outline-none focus:border-sky-400"
            spellCheck={false}
          />
          <p className="mt-2 text-[11px] text-slate-500">
            Tip: keep lens JSON small & concrete. We will later generate code,
            tests, deploy plan, docs, and diagnostics from it.
          </p>
        </div>
      </div>
    </div>
  );
}
