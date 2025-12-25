"use client";

import { useState } from "react";

export default function AgentFactoryPanel() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<any>(null);

  async function buildAgent() {
    const res = await fetch("/api/builder/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: jd }),
    });

    const json = await res.json();
    setResult(json);
  }

  return (
    <div className="mt-6 rounded-xl border bg-white p-4">
      <p className="text-xs font-semibold">Agent Employee Factory</p>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste full job description here…"
        className="mt-2 w-full rounded border px-2 py-1 text-xs"
        rows={6}
      />

      <button
        onClick={buildAgent}
        className="mt-3 rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
      >
        Build Agent
      </button>

      {result && (
        <pre className="mt-3 rounded bg-slate-50 p-2 text-[11px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
