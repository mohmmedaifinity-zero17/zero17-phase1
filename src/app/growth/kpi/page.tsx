// src/app/growth/kpi/page.tsx
"use client";

import { useState } from "react";
import { Target } from "lucide-react";

type KpiResult = {
  cac: number;
  ltv: number;
  paybackMonths: number;
  runwayMonths: number;
  notes: string[];
};

export default function KpiPage() {
  const [inputs, setInputs] = useState({
    pricePerMonth: 49,
    grossMargin: 0.8,
    churnMonthly: 0.08,
    cac: 120,
    monthlyBurn: 1000,
    cashInBank: 5000,
  });
  const [result, setResult] = useState<KpiResult | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof inputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  async function compute() {
    setLoading(true);
    const res = await fetch("/api/growth/kpi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });
    const json = await res.json();
    setResult(json);
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <header className="space-y-1">
          <div className="text-xs uppercase text-slate-500">
            Growth OS • KPI Starter
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5" />
            KPI Cockpit
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Model your basic unit economics: CAC, LTV, payback and runway, so
            you know how aggressively you can grow.
          </p>
        </header>

        <section className="z17-card p-5 space-y-3 bg-white/85 text-xs">
          <div className="grid md:grid-cols-3 gap-3">
            <NumberField
              label="Price per month ($)"
              value={inputs.pricePerMonth}
              onChange={(v) => update("pricePerMonth", v)}
            />
            <NumberField
              label="Gross margin (0–1)"
              value={inputs.grossMargin}
              step={0.05}
              onChange={(v) => update("grossMargin", v)}
            />
            <NumberField
              label="Monthly churn (0–1)"
              value={inputs.churnMonthly}
              step={0.01}
              onChange={(v) => update("churnMonthly", v)}
            />
            <NumberField
              label="CAC ($)"
              value={inputs.cac}
              onChange={(v) => update("cac", v)}
            />
            <NumberField
              label="Monthly burn ($)"
              value={inputs.monthlyBurn}
              onChange={(v) => update("monthlyBurn", v)}
            />
            <NumberField
              label="Cash in bank ($)"
              value={inputs.cashInBank}
              onChange={(v) => update("cashInBank", v)}
            />
          </div>

          <button
            onClick={compute}
            disabled={loading}
            className="mt-3 px-4 py-2 rounded-xl border text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
          >
            {loading ? "Calculating…" : "Calculate KPIs"}
          </button>
        </section>

        {result && (
          <section className="space-y-4 text-xs text-slate-700">
            <div className="grid sm:grid-cols-4 gap-3">
              <KpiBox label="CAC" value={`$${result.cac.toFixed(2)}`} />
              <KpiBox label="LTV" value={`$${result.ltv.toFixed(2)}`} />
              <KpiBox
                label="Payback period"
                value={`${result.paybackMonths.toFixed(1)} months`}
              />
              <KpiBox
                label="Runway"
                value={`${result.runwayMonths.toFixed(1)} months`}
              />
            </div>
            <div className="z17-card p-4 bg-white/85">
              <div className="text-[11px] uppercase text-slate-500 mb-1">
                Notes
              </div>
              <ul className="list-disc pl-4 space-y-1">
                {result.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-500">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value || "0"))}
        className="border rounded-xl px-3 py-1.5 text-xs"
      />
    </label>
  );
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3 bg-white text-center">
      <div className="text-[11px] uppercase text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
