// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  Beaker,
  Hammer,
  Rocket,
  LineChart,
  Bot,
  Compass,
  Sparkles,
  FolderKanban,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-amber-50 to-rose-50 text-slate-900">
      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          {/* Logo / wordmark */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-sky-200 via-amber-200 to-rose-200 shadow-md">
              <Image
                src="/zero17-mark.png"
                alt="Zero17"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                <span className="bg-gradient-to-r from-sky-800 via-slate-900 to-sky-700 bg-clip-text text-transparent">
                  Zero17
                </span>
              </h1>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                Founder Operating System
              </p>
            </div>
          </div>

          <p className="max-w-xl text-base text-slate-700 md:text-lg">
            Build, test, launch and grow products like the world’s top 0.1%
            founders. Zero17 is your business solar system — one OS for{" "}
            <span className="font-semibold text-slate-900">
              Research → Build → Launch → Growth.
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-500"
            >
              <Beaker className="h-4 w-4" />
              Open Research Lab
            </Link>

            <Link
              href="/builder"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white"
            >
              <Hammer className="h-3.5 w-3.5 text-emerald-600" />
              Go to Builder Lab
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Resume last project
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 text-[11px] text-slate-600">
            <Badge color="bg-sky-500" label="QIE & Market OS Simulator" />
            <Badge color="bg-emerald-500" label="Build Factory & Auto-Tests" />
            <Badge color="bg-amber-500" label="Proof Packs & Truth Ledger" />
            <Badge color="bg-teal-500" label="Growth Chief & Oracle" />
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-200/60 blur-3xl" />
          <div className="absolute -bottom-8 -left-4 h-32 w-32 rounded-full bg-amber-200/70 blur-3xl" />

          <div className="relative space-y-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Compass className="h-4 w-4 text-purple-500" />
                <span>Idea → Build → Launch → Growth</span>
              </div>
              <div className="text-[10px] text-slate-400">Zero17 v3.0</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <PillarMiniCard
                icon={<Beaker className="h-3.5 w-3.5 text-sky-600" />}
                label="Research Lab"
                desc="QIE, simulations & blueprint."
                color="from-sky-100 to-sky-50"
              />
              <PillarMiniCard
                icon={<Hammer className="h-3.5 w-3.5 text-emerald-600" />}
                label="Builder Lab"
                desc="Spec → build → tests → docs."
                color="from-emerald-100 to-emerald-50"
              />
              <PillarMiniCard
                icon={<Rocket className="h-3.5 w-3.5 text-amber-600" />}
                label="Launch Engine"
                desc="Preflight, deploy & proof."
                color="from-amber-100 to-amber-50"
              />
              <PillarMiniCard
                icon={<LineChart className="h-3.5 w-3.5 text-teal-600" />}
                label="Growth OS"
                desc="Sprints, loops & oracle."
                color="from-teal-100 to-teal-50"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-[11px] text-slate-50">
              <div>
                <div className="font-semibold">HELIX is watching.</div>
                <div className="text-slate-300">
                  One OS loop. Every move recorded. No chaos.
                </div>
              </div>
              <Link
                href="/helix"
                className="inline-flex items-center gap-1 rounded-full bg-purple-500 px-3 py-1 text-[10px] font-semibold hover:bg-purple-400"
              >
                View HELIX
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN PILLARS */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-2 lg:grid-cols-4">
        <PillarCard
          href="/research"
          icon={<Beaker className="h-5 w-5 text-sky-600" />}
          title="Research Lab"
          subtitle="Quantum Idea Engine"
          body="Turn raw ideas into world-class theses with QIE, Atomic Lab and Blueprint v2."
          pill="Start in Lab"
          pillColor="bg-sky-600 hover:bg-sky-500"
        />
        <PillarCard
          href="/builder"
          icon={<Hammer className="h-5 w-5 text-emerald-600" />}
          title="Builder Lab"
          subtitle="Spec → Build → Tests"
          body="Build with a stable Supabase rail: phases 1–10, docs pack, diagnostics, autofix."
          pill="Go to Builder"
          pillColor="bg-emerald-600 hover:bg-emerald-500"
        />
        <PillarCard
          href="/launch"
          icon={<Rocket className="h-5 w-5 text-amber-600" />}
          title="Launch Engine"
          subtitle="Domains & Proof"
          body="Ship with confidence using Preflight, domains, Proof Pack and Truth Ledger."
          pill="Open Launch"
          pillColor="bg-amber-600 hover:bg-amber-500"
        />
        <PillarCard
          href="/growth"
          icon={<LineChart className="h-5 w-5 text-teal-600" />}
          title="Growth OS"
          subtitle="Sprints & Oracle"
          body="Let Growth Chief, Sprints, Flywheel and Oracle turn your product into a compounding loop."
          pill="Enter Growth OS"
          pillColor="bg-teal-600 hover:bg-teal-500"
        />
      </section>

      {/* AGENT EMPLOYEES */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Bot className="h-5 w-5 text-slate-700" />
              Agent employees
            </h2>
            <p className="text-xs text-slate-600">
              A virtual growth & product team built from the world’s top 0.01%
              archetypes.
            </p>
          </div>
          <Link
            href="/growth"
            className="hidden items-center gap-1 rounded-full border border-slate-300 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-white md:inline-flex"
          >
            Open Agent hub
          </Link>
        </div>

        <div className="grid gap-4 text-[11px] sm:grid-cols-2 lg:grid-cols-4">
          {[
            "ICP Architect",
            "Offer Scientist",
            "Narrative Architect",
            "Proof Producer",
            "Performance Strategist",
            "Campaign Engineer",
            "Activation Scientist",
            "Flywheel Architect",
            "Growth Analyst",
            "Growth Chief",
          ].map((role) => (
            <div
              key={role}
              className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm"
            >
              <Bot className="mt-0.5 h-3.5 w-3.5 text-sky-600" />
              <div>
                <div className="text-[12px] font-semibold text-slate-900">
                  {role}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">
                  Configurable specialist that plugs into Growth OS sprints and
                  experiments.
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/80 px-5 py-4 text-[12px] shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <FolderKanban className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                Projects & Proof-of-Work
              </div>
              <div className="text-[11px] text-slate-600">
                All your MVPs, agents and experiments in one timeline. Each
                build automatically gains a Proof Pack and Truth Ledger entry.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              Open Projects
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white",
        color,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function PillarMiniCard({
  icon,
  label,
  desc,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-slate-200 bg-gradient-to-br px-3 py-3 shadow-sm",
        color,
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-white/60 bg-white/70">
          {icon}
        </span>
        <div>
          <div className="text-[11px] font-semibold text-slate-900">
            {label}
          </div>
          <div className="text-[10px] text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function PillarCard({
  href,
  icon,
  title,
  subtitle,
  body,
  pill,
  pillColor,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  body: string;
  pill: string;
  pillColor: string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/80">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-bold text-slate-900">{title}</div>
        <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
          {subtitle}
        </div>
        <div className="mt-3 text-[12px] leading-relaxed text-slate-700">
          {body}
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={href}
          className={[
            "inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition",
            pillColor,
          ].join(" ")}
        >
          {pill}
        </Link>
      </div>
    </div>
  );
}
