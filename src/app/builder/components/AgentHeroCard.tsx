"use client";

import Link from "next/link";
import { Bot, ArrowRight, ShieldCheck } from "lucide-react";

export default function AgentHeroCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-4">
      {/* subtle glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative flex items-start gap-4">
        {/* Icon capsule */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-600/90 p-3 text-white shadow-sm">
          <Bot className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              AI Employee Factory
            </p>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <ShieldCheck className="h-3 w-3" />
              System-grade
            </span>
          </div>

          <p className="mt-1 max-w-[520px] text-xs text-slate-700">
            Design AI employees from real job descriptions. Progress them safely
            through{" "}
            <span className="font-semibold text-slate-900">
              Draft → Shadow → Production
            </span>{" "}
            with evaluation and control.
          </p>

          <Link
            href="/builder/agents"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Open Agent Factory
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
