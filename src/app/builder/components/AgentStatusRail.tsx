"use client";

type Status = "draft" | "shadow" | "production";

function dot(active: boolean) {
  return active
    ? "h-2.5 w-2.5 rounded-full bg-slate-900"
    : "h-2.5 w-2.5 rounded-full bg-slate-300";
}

function label(active: boolean) {
  return active
    ? "text-[11px] font-semibold text-slate-900"
    : "text-[11px] text-slate-600";
}

export default function AgentStatusRail({ status }: { status: Status }) {
  const steps: Status[] = ["draft", "shadow", "production"];

  const idx = steps.indexOf(status);
  const isActive = (i: number) => i <= idx;

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2">
      <p className="text-[10px] font-semibold text-slate-700">Lifecycle</p>

      <div className="mt-2 grid grid-cols-3 gap-2 items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={dot(isActive(i))} />
            <span className={label(isActive(i))}>{s.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
