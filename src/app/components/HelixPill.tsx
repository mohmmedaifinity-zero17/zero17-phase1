"use client";

import { useEffect, useState } from "react";

type HelixResponse = { steps: string[] };

export default function HelixPill() {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  // fetch steps the first time we open
  useEffect(() => {
    if (!open || steps) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/helix/next", { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch HELIX steps");
        const data: HelixResponse = await res.json();
        setSteps(data.steps);
      } catch {
        // friendly fallback
        setSteps([
          "Go to Research Lab → Describe your idea",
          "Add 3–5 evidence links → Next",
          "Open Builder → pick MVP or Agent-Employee",
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, steps]);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        aria-label="Open HELIX guidance"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-50 rounded-full px-4 py-3 shadow-lg bg-black text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        HELIX
      </button>

      {/* Simple panel */}
      {open && (
        <div className="fixed right-4 bottom-20 z-50 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">What’s next?</h3>
            <button
              className="text-neutral-500 hover:text-black"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {loading && <p className="text-sm text-neutral-600">Thinking…</p>}

          {!loading && steps && (
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {steps.map((s, i) => (
                <li key={i} className="leading-snug">
                  {s}
                </li>
              ))}
            </ol>
          )}

          {!loading && !steps && (
            <p className="text-sm text-neutral-600">
              No guidance available right now.
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <a
              href="/lab"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Go to Research Lab
            </a>
            <a
              href="/builder"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Go to Builder
            </a>
          </div>
        </div>
      )}
    </>
  );
}
