"use client";

type Diff = {
  added?: string[];
  removed?: string[];
};

export default function CodeDiffViewer({ diff }: { diff?: Diff }) {
  if (!diff) {
    return (
      <div className="rounded border bg-slate-50 p-3 text-xs text-slate-600">
        No code changes detected.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-3 space-y-3">
      <p className="text-xs font-semibold">Auto-Fix Diff</p>

      {diff.added?.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-emerald-700">Added</p>
          <pre className="mt-1 rounded bg-emerald-50 p-2 text-[11px] overflow-auto">
            {diff.added.join("")}
          </pre>
        </div>
      )}

      {diff.removed?.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-rose-700">Removed</p>
          <pre className="mt-1 rounded bg-rose-50 p-2 text-[11px] overflow-auto">
            {diff.removed.join("")}
          </pre>
        </div>
      )}
    </div>
  );
}
