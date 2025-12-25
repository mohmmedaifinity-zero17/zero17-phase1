"use client";
import React from "react";

export default function QAReport({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="rounded-2xl border p-5 bg-white">
      <h3 className="text-lg font-semibold">QA Mini-Report</h3>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Score title="Readiness" value={data.readiness} />
        <Score title="Performance" value={data.checks.perf} />
        <Score title="Accessibility" value={data.checks.a11y} />
        <Score title="Security" value={data.checks.security} />
      </div>

      <List title="Auto-Fix Suggestions" items={data.suggestions} />
    </div>
  );
}

function Score({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border p-3 text-center">
      <div className="text-xs uppercase text-zinc-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4 rounded-xl border p-3 bg-white">
      <div className="text-xs uppercase text-zinc-500 mb-2">{title}</div>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
