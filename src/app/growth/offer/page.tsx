// src/app/growth/offer/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  DollarSign,
  Sparkles,
  Wand2,
  Clipboard,
} from "lucide-react";

export default function OfferPage() {
  const [icp, setIcp] = useState("");
  const [problem, setProblem] = useState("");
  const [outcome, setOutcome] = useState("");
  const [price, setPrice] = useState("");
  const [offerType, setOfferType] = useState<"service" | "product" | "saas">(
    "saas"
  );
  const [riskReversal, setRiskReversal] = useState("no-cure-no-pay");
  const [copied, setCopied] = useState(false);

  const snapshot = useMemo(() => {
    if (!icp && !problem && !outcome && !price) return "";
    return (
      `For ${icp || "my ideal customer"}, I solve "${
        problem || "their painful problem"
      }" by offering a ${
        offerType === "service"
          ? "done-for-you service"
          : offerType === "product"
            ? "one-time product"
            : "simple subscription tool"
      } that helps them ${outcome || "reach a clear result"}.\n\n` +
      `Pricing: ${price || "TBD"} with ${
        riskReversal === "no-cure-no-pay"
          ? "a simple 'no result, no pay' style guarantee"
          : riskReversal === "trial"
            ? "a short, low-risk trial"
            : "a friendly refund window"
      }.`
    );
  }, [icp, problem, outcome, price, offerType, riskReversal]);

  async function copySnapshot() {
    if (!snapshot) return;
    try {
      await navigator.clipboard.writeText(snapshot);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Back link */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/growth"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-black"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Growth OS
          </Link>
        </div>

        {/* Heading */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-semibold">Monetization & Offer Lab</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            Make one clean offer that a 5-year-old can understand. This powers
            Masterbrain, Sprint Engine, Performance Lab and Oracle.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: inputs */}
          <section className="z17-card bg-white/90 p-4 space-y-3">
            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Who is this for? (ICP)
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="Example: solo AI founders building MVPs"
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                What is the painful problem?
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="Example: they waste months trying to validate ideas and ship MVPs alone."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                What result will they get?
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="Example: launch a working AI MVP + growth engine in under 30 days."
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">Offer type</label>
              <div className="flex flex-wrap gap-1">
                <OfferChip
                  active={offerType === "service"}
                  label="Done-for-you service"
                  onClick={() => setOfferType("service")}
                />
                <OfferChip
                  active={offerType === "product"}
                  label="One-time product"
                  onClick={() => setOfferType("product")}
                />
                <OfferChip
                  active={offerType === "saas"}
                  label="SaaS / subscription"
                  onClick={() => setOfferType("saas")}
                />
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Price (or range)
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="Example: ₹15,000 launch package / $97 per month"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Risk reversal
              </label>
              <div className="flex flex-wrap gap-1">
                <RiskChip
                  active={riskReversal === "no-cure-no-pay"}
                  label="No result, no pay"
                  onClick={() => setRiskReversal("no-cure-no-pay")}
                />
                <RiskChip
                  active={riskReversal === "trial"}
                  label="Short trial first"
                  onClick={() => setRiskReversal("trial")}
                />
                <RiskChip
                  active={riskReversal === "refund"}
                  label="Refund window"
                  onClick={() => setRiskReversal("refund")}
                />
              </div>
            </div>
          </section>

          {/* Right: snapshot + advanced guidance */}
          <section className="z17-card bg-slate-950 text-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <div className="text-sm font-semibold">Offer snapshot</div>
            </div>

            {!snapshot && (
              <p className="text-[11px] text-slate-100">
                Fill the fields on the left. You&apos;ll see a one-paragraph
                offer description here that you can paste into your website, DM
                scripts and landing pages.
              </p>
            )}

            {snapshot && (
              <pre className="whitespace-pre-wrap text-[11px] text-slate-50 bg-slate-900 rounded-2xl px-3 py-2 border border-slate-700">
                {snapshot}
              </pre>
            )}

            <div className="flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                disabled={!snapshot}
                onClick={copySnapshot}
                className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-slate-900 px-3 py-1.5 font-semibold hover:bg-amber-300 disabled:opacity-50"
              >
                <Clipboard className="w-3 h-3" />
                {copied ? "Copied!" : "Copy snapshot"}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-slate-800 text-slate-50 px-3 py-1.5 font-semibold hover:bg-slate-700"
              >
                <Wand2 className="w-3 h-3" />
                Make this offer 10× clearer
              </button>
            </div>

            <div className="mt-2 border-t border-slate-800 pt-2 space-y-1">
              <div className="text-[11px] font-semibold text-amber-300">
                Quick sanity checklist
              </div>
              <ul className="list-disc pl-4 text-[10px] text-slate-100 space-y-0.5">
                <li>Can a friend repeat your offer in one sentence?</li>
                <li>
                  Does the outcome sound like a result, not a feature (eg. “30
                  demos” vs “dashboard”)?
                </li>
                <li>
                  Is the price &amp; risk simple enough for a fast yes/no?
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function OfferChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-[11px] border ${
        active
          ? "bg-amber-500 text-slate-900 border-amber-500"
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function RiskChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-[11px] border ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
