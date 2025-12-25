"use client";

// src/app/builder/components/CanonicalRegistryPanel.tsx

import { useEffect, useState } from "react";
import type { BuilderProject, AgentEmployee } from "@/lib/builder/types";
import {
  CANONICAL,
  canonicalCounts,
  truthLedgerCounts,
} from "@/lib/builder/canonical";
import {
  Clock,
  History,
  ShieldCheck,
  Wand2,
  Bot,
  Upload,
  Palette,
} from "lucide-react";

type PatchEntry = {
  id: string;
  label?: string;
  description?: string;
  note?: string;
  createdAt?: string;
};

function pill(ok: boolean) {
  return ok
    ? "rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800"
    : "rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700";
}

function fmt(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

async function safeJson(res: Response) {
  return res.json().catch(() => ({}));
}

export default function CanonicalRegistryPanel({
  project,
}: {
  project: BuilderProject | null;
}) {
  const c = canonicalCounts(project);
  const t = truthLedgerCounts(project);

  const [toast, setToast] = useState("");
  const [localFrozen, setLocalFrozen] = useState<boolean>(!!project?.frozen);
  const [freezeReason, setFreezeReason] = useState<string>(
    project?.freezeReason || ""
  );
  const frozen = project?.frozen ?? localFrozen;

  useEffect(() => {
    setLocalFrozen(!!project?.frozen);
    setFreezeReason(project?.freezeReason || "");
  }, [project?.id, project?.frozen, project?.freezeReason]);

  async function toggleFreeze() {
    if (!project?.id) return;

    const next = !localFrozen;

    try {
      const res = await fetch(`/api/builder/projects/${project.id}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frozen: next,
          freezeReason: next
            ? freezeReason || "Stability lock: only safe actions allowed."
            : "",
        }),
      });

      const json = await safeJson(res);
      if (!res.ok)
        throw new Error(json?.error || "Failed to update freeze state");

      setLocalFrozen(next);
      setToast(next ? "Freeze mode enabled." : "Freeze mode disabled.");
      setTimeout(() => setToast(""), 2000);
    } catch (e: any) {
      setToast(e?.message || "Failed to toggle freeze");
      setTimeout(() => setToast(""), 2500);
    }
  }

  // ---------------- Patch History ----------------
  const [patches, setPatches] = useState<PatchEntry[]>([]);
  const [patchLabel, setPatchLabel] = useState("Snapshot");
  const [patchNote, setPatchNote] = useState("");
  const [patchBusy, setPatchBusy] = useState(false);

  async function loadPatches() {
    if (!project?.id) return;
    const res = await fetch(`/api/builder/projects/${project.id}/patches`, {
      method: "GET",
    });
    const json = await safeJson(res);
    if (res.ok) setPatches(Array.isArray(json?.patches) ? json.patches : []);
  }

  useEffect(() => {
    loadPatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  async function createPatch() {
    if (!project?.id) return;
    setPatchBusy(true);
    try {
      const res = await fetch(`/api/builder/projects/${project.id}/patches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          label: patchLabel,
          note: patchNote,
        }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Failed to create patch");
      await loadPatches();
      setPatchNote("");
      setToast("Patch saved.");
      setTimeout(() => setToast(""), 2000);
    } catch (e: any) {
      setToast(e?.message || "Patch save failed");
      setTimeout(() => setToast(""), 2500);
    } finally {
      setPatchBusy(false);
    }
  }

  async function rollbackPatch(patchId: string) {
    if (!project?.id) return;
    setPatchBusy(true);
    try {
      const res = await fetch(`/api/builder/projects/${project.id}/patches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rollback", patchId }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Rollback failed");
      setToast("Rollback applied. Refresh projects to re-sync the rail.");
      setTimeout(() => setToast(""), 2600);
      await loadPatches();
    } catch (e: any) {
      setToast(e?.message || "Rollback failed");
      setTimeout(() => setToast(""), 2500);
    } finally {
      setPatchBusy(false);
    }
  }

  // ---------------- Agent Factory (basic) ----------------
  const [agents, setAgents] = useState<AgentEmployee[]>([]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentForm, setAgentForm] = useState({
    name: "",
    role: "",
    objective: "",
  });

  async function loadAgents() {
    if (!project?.id) return;
    const res = await fetch(`/api/builder/projects/${project.id}/agents`, {
      method: "GET",
    });
    const json = await safeJson(res);
    if (res.ok) setAgents(Array.isArray(json?.agents) ? json.agents : []);
  }

  useEffect(() => {
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  async function createAgent() {
    if (!project?.id) return;
    setAgentBusy(true);
    try {
      const res = await fetch(`/api/builder/projects/${project.id}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentForm),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Failed to create agent");
      setAgentForm({ name: "", role: "", objective: "" });
      await loadAgents();
      setToast("Agent created (draft).");
      setTimeout(() => setToast(""), 2000);
    } catch (e: any) {
      setToast(e?.message || "Agent create failed");
      setTimeout(() => setToast(""), 2500);
    } finally {
      setAgentBusy(false);
    }
  }

  async function promoteAgent(agentId: string) {
    if (!project?.id) return;

    // freeze guard (prevents unsafe promotion while frozen)
    if (frozen) {
      setToast("Blocked: project is frozen. Disable freeze to promote.");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    setAgentBusy(true);
    try {
      const res = await fetch(
        `/api/builder/projects/${project.id}/agents/${agentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "promote" }),
        }
      );
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Promotion failed");
      await loadAgents();
      setToast("Agent promoted.");
      setTimeout(() => setToast(""), 2000);
    } catch (e: any) {
      setToast(e?.message || "Promotion failed");
      setTimeout(() => setToast(""), 2500);
    } finally {
      setAgentBusy(false);
    }
  }

  // ---------------- Inline Branding ----------------
  const branding = (project as any)?.branding || {};
  const [theme, setTheme] = useState<string>(branding.theme || "midnight");
  const [appName, setAppName] = useState<string>(
    branding.appName || project?.title || ""
  );
  const [tagline, setTagline] = useState<string>(branding.tagline || "");
  const [logoDataUrl, setLogoDataUrl] = useState<string>(
    branding.logoDataUrl || ""
  );
  const [brandBusy, setBrandBusy] = useState(false);

  useEffect(() => {
    setTheme(branding.theme || "midnight");
    setAppName(branding.appName || project?.title || "");
    setTagline(branding.tagline || "");
    setLogoDataUrl(branding.logoDataUrl || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  async function saveBranding(next?: Partial<typeof branding>) {
    if (!project?.id) return;
    setBrandBusy(true);
    try {
      const res = await fetch(`/api/builder/projects/${project.id}/patch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branding: { theme, appName, tagline, logoDataUrl, ...(next || {}) },
        }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Failed to save branding");
      setToast("Branding saved.");
      setTimeout(() => setToast(""), 2000);
    } catch (e: any) {
      setToast(e?.message || "Branding save failed");
      setTimeout(() => setToast(""), 2500);
    } finally {
      setBrandBusy(false);
    }
  }

  async function onLogoFile(file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setLogoDataUrl(dataUrl);
      await saveBranding({ logoDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            Canonical Registry
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Anti-chaos dashboard: artifacts + truth ledger + freeze + patches +
            agents + branding.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-slate-900">
            Readiness: {c.ready}/{c.total}
          </p>
          <p className="text-[11px] text-slate-600">{c.pct}% complete</p>
        </div>
      </div>

      {toast ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
          {toast}
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {/* Artifact readiness */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-900">
              Artifact readiness
            </p>
            <span className={pill(c.missing === 0)}>
              {c.missing === 0 ? "GREEN" : `${c.missing} missing`}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {CANONICAL.map((a) => {
              const ok = a.isReady(project);
              const hint = a.hint?.(project);
              return (
                <div
                  key={a.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {a.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-600">
                        {a.description}
                      </p>
                    </div>
                    <span className={pill(ok)}>{ok ? "READY" : "MISSING"}</span>
                  </div>
                  {!ok && hint ? (
                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                      {hint}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Truth Ledger + Freeze */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-900">Truth Ledger</p>
            <span className={pill(true)}>LIVE</span>
          </div>

          <div className="mt-3 grid gap-2">
            <StatCard label="Scan issues" value={t.scanIssues} />
            <StatCard label="Diagnostics items" value={t.diagItems} />
            <StatCard label="Fixes applied" value={t.applied} />
            <StatCard label="Improvements confirmed" value={t.improved} />
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Freeze Build
              </p>

              <button
                type="button"
                onClick={toggleFreeze}
                className={[
                  "rounded-xl border px-2 py-1 text-[11px] font-semibold",
                  frozen
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {frozen ? "Freeze ON" : "Freeze OFF"}
              </button>
            </div>

            <p className="mt-1 text-[11px] text-slate-600">
              When frozen, block risky actions (promotion, destructive changes).
            </p>

            <div className="mt-2">
              <label className="text-[10px] font-semibold text-slate-700">
                Freeze reason
              </label>
              <input
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                placeholder="Stability lock: only safe actions allowed."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Patch History */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <History className="h-4 w-4" /> Patch History (time-travel builds)
          </p>

          <button
            type="button"
            disabled={!project?.id || patchBusy}
            onClick={createPatch}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {patchBusy ? "Working..." : "Save Patch"}
          </button>
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-[10px] font-semibold text-slate-700">
              Label
            </label>
            <input
              value={patchLabel}
              onChange={(e) => setPatchLabel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-semibold text-slate-700">
              Note (optional)
            </label>
            <input
              value={patchNote}
              onChange={(e) => setPatchNote(e.target.value)}
              placeholder="What changed? Why this snapshot matters?"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {patches.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
              No patches yet. Save your first snapshot.
            </div>
          ) : (
            patches.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-900">
                      {p.label || p.description || "Patch"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> {fmt(p.createdAt)}
                    </p>
                    {p.note ? (
                      <p className="mt-1 text-[11px] text-slate-700">
                        {p.note}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    disabled={patchBusy || !project?.id}
                    onClick={() => rollbackPatch(p.id)}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Rollback
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agent Employee Factory */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <Bot className="h-4 w-4" /> Agent Employee Factory v1
          </p>

          <button
            type="button"
            disabled={!project?.id || agentBusy}
            onClick={createAgent}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {agentBusy ? "Working..." : "Create Agent"}
          </button>
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <div>
            <label className="text-[10px] font-semibold text-slate-700">
              Name
            </label>
            <input
              value={agentForm.name}
              onChange={(e) =>
                setAgentForm((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="e.g., Growth Analyst"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-700">
              Role
            </label>
            <input
              value={agentForm.role}
              onChange={(e) =>
                setAgentForm((s) => ({ ...s, role: e.target.value }))
              }
              placeholder="e.g., Metrics & Experiments"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-700">
              Objective
            </label>
            <input
              value={agentForm.objective}
              onChange={(e) =>
                setAgentForm((s) => ({ ...s, objective: e.target.value }))
              }
              placeholder="1 sentence mission"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {agents.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
              No agents yet. Create your first employee.
            </div>
          ) : (
            agents.slice(0, 8).map((a: any) => (
              <div
                key={a.id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-900">
                      {a.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      {a.role}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-700">
                      {a.objective}
                    </p>
                    <p className="mt-2 text-[10px] text-slate-500">
                      Mode: {String(a.mode || "draft").toUpperCase()}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      agentBusy ||
                      !project?.id ||
                      String(a.mode) === "production"
                    }
                    onClick={() => promoteAgent(a.id)}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Promote
                  </button>
                </div>

                {frozen ? (
                  <p className="mt-2 text-[11px] text-amber-700">
                    Promotion blocked while frozen.
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Promotion path: draft → shadow → production.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inline Preview Editor */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <Wand2 className="h-4 w-4" /> Inline Preview Editor (logo / text /
            theme)
          </p>

          <button
            type="button"
            disabled={!project?.id || brandBusy}
            onClick={() => saveBranding()}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {brandBusy ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-[10px] font-semibold text-slate-700 flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" /> Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="midnight">Midnight</option>
              <option value="aurora">Aurora</option>
              <option value="sunrise">Sunrise</option>
              <option value="mono">Mono</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-700">
              App Name
            </label>
            <input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-700">
              Tagline
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short promise line"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-[10px] font-semibold text-slate-700 flex items-center gap-2">
              <Upload className="h-3.5 w-3.5" /> Logo upload
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onLogoFile(e.target.files?.[0])}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-semibold text-slate-700">
              Preview
            </label>
            <div className="mt-1 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                {logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoDataUrl}
                    alt="logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {appName || "App Name"}
                </p>
                <p className="text-[11px] text-slate-600 truncate">
                  {tagline || "Tagline"}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Theme: {theme}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          Stores branding overrides in <code>project.branding</code>.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-xs text-slate-700">{value}</p>
    </div>
  );
}
