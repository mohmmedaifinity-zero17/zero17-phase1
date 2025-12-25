// src/app/builder/BuilderShell.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import BuilderStepper from "./BuilderStepper";
import BuilderPreview from "./BuilderPreview";
import type {
  BuilderProject,
  BuilderBuildType,
  BuilderStatus,
  MultiLensSpec,
  FounderLens,
  ArchitectLens,
  QaLens,
  ClientLens,
  AgentLens,
  ArchitectureMap,
  ArchitectureScreen,
  ArchitectureEntity,
  ArchitectureInfra,
  TestPlan,
  ScanReport,
  ExportPlan,
  DeploymentPlan,
} from "@/lib/builder/types";

type CreateFormState = {
  title: string;
  description: string;
  build_type: BuilderBuildType;
};

const defaultForm: CreateFormState = {
  title: "",
  description: "",
  build_type: "app",
};

const STATUS_LABEL: Record<BuilderStatus, string> = {
  draft: "Draft",
  structured: "Structured",
  built: "Built",
  refined: "Refined",
  tested: "Tested",
  scanned: "Scanned",
  deployed: "Deployed",
  handed_off: "Handed Off",
};

type IntentSource = "raw_idea" | "research_blueprint";

export default function BuilderShell() {
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFormState>(defaultForm);
  const [creating, setCreating] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Spec-related state
  const [intentSource, setIntentSource] = useState<IntentSource>("raw_idea");
  const [rawIdea, setRawIdea] = useState("");
  const [specLoading, setSpecLoading] = useState(false);
  const [specSaving, setSpecSaving] = useState(false);
  const [specError, setSpecError] = useState<string | null>(null);
  const [spec, setSpec] = useState<MultiLensSpec | null>(null);

  // Architecture-related state
  const [architecture, setArchitecture] = useState<ArchitectureMap | null>(
    null
  );
  const [archLoading, setArchLoading] = useState(false);
  const [archSaving, setArchSaving] = useState(false);
  const [archError, setArchError] = useState<string | null>(null);

  // Build-related state
  const [buildLoading, setBuildLoading] = useState(false);

  // Refine-related state
  const [refineLoading, setRefineLoading] = useState(false);

  // Tests / Scan state
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsRunning, setTestsRunning] = useState(false);
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  // Export / Deployment state
  const [exportPlan, setExportPlan] = useState<ExportPlan | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [deploymentPlan, setDeploymentPlan] = useState<DeploymentPlan | null>(
    null
  );
  const [deploymentLoading, setDeploymentLoading] = useState(false);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null;

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/builder/projects", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load projects");
      }
      const data = (await res.json()) as BuilderProject[];
      setProjects(data);
      if (data.length > 0 && !activeProjectId) {
        setActiveProjectId(data[0].id);
      }
    } catch (err: any) {
      console.error("[BuilderShell] loadProjects error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/builder/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || "",
          build_type: form.build_type,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.error || `Failed to create project (status ${res.status})`;
        console.error("[BuilderShell] create project error:", msg);
        setError(msg);
        return;
      }

      const newProject = (await res.json()) as BuilderProject;

      if (!newProject || !newProject.id) {
        console.error("[BuilderShell] invalid project payload:", newProject);
        setError("Server returned invalid project payload");
        return;
      }

      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      setForm(defaultForm);
      setSpec(null);
      setArchitecture(null);
      setRawIdea("");
      setSpecError(null);
      setArchError(null);
      setTestPlan(null);
      setScanReport(null);
      setExportPlan(null);
      setDeploymentPlan(null);
    } catch (err: any) {
      console.error("[BuilderShell] create project exception:", err);
      setError(err.message || "Unexpected error while creating project");
    } finally {
      setCreating(false);
    }
  }

  function handleInputChange<K extends keyof CreateFormState>(
    key: K,
    value: CreateFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const fetchSpecForProject = useCallback(async (projectId: string) => {
    setSpecLoading(true);
    setSpecError(null);
    try {
      const res = await fetch(`/api/builder/spec?projectId=${projectId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        if (res.status === 404) {
          setSpec(null);
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load spec");
      }
      const data = (await res.json()) as MultiLensSpec | null;
      setSpec(data);
    } catch (err: any) {
      console.error(err);
      setSpecError(err.message || "Failed to load spec");
    } finally {
      setSpecLoading(false);
    }
  }, []);

  const fetchArchitectureForProject = useCallback(async (projectId: string) => {
    setArchLoading(true);
    setArchError(null);
    try {
      const res = await fetch(
        `/api/builder/architecture?projectId=${projectId}`,
        {
          cache: "no-store",
        }
      );
      if (!res.ok) {
        if (res.status === 404) {
          setArchitecture(null);
          return;
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load architecture");
      }
      const data = (await res.json()) as ArchitectureMap | null;
      setArchitecture(data);
    } catch (err: any) {
      console.error(err);
      setArchError(err.message || "Failed to load architecture");
    } finally {
      setArchLoading(false);
    }
  }, []);

  // Load projects on mount
  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  // Load spec + architecture + tests + scan + export + deployment when active project changes
  useEffect(() => {
    if (!activeProject) {
      setSpec(null);
      setArchitecture(null);
      setRawIdea("");
      setTestPlan(null);
      setScanReport(null);
      setExportPlan(null);
      setDeploymentPlan(null);
      return;
    }

    if (activeProject.spec_json) {
      setSpec(activeProject.spec_json);
    } else {
      void fetchSpecForProject(activeProject.id);
    }

    if (activeProject.architecture_json) {
      setArchitecture(activeProject.architecture_json);
    } else {
      void fetchArchitectureForProject(activeProject.id);
    }

    if (activeProject.test_plan_json) {
      setTestPlan(activeProject.test_plan_json as TestPlan);
    } else {
      setTestPlan(null);
    }

    if (activeProject.scan_report_json) {
      setScanReport(activeProject.scan_report_json as ScanReport);
    } else {
      setScanReport(null);
    }

    if (activeProject.export_plan_json) {
      setExportPlan(activeProject.export_plan_json as ExportPlan);
    } else {
      setExportPlan(null);
    }

    if (activeProject.deployment_plan_json) {
      setDeploymentPlan(activeProject.deployment_plan_json as DeploymentPlan);
    } else {
      setDeploymentPlan(null);
    }
  }, [activeProject, fetchSpecForProject, fetchArchitectureForProject]);

  async function handleGenerateSpec() {
    if (!activeProject) return;
    if (!rawIdea.trim()) {
      setSpecError("Please describe your idea before generating the spec.");
      return;
    }

    setSpecError(null);
    setSpecLoading(true);
    try {
      const res = await fetch("/api/builder/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          projectId: activeProject.id,
          rawIdea,
          buildType: activeProject.build_type,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate spec");
      }

      const data = (await res.json()) as MultiLensSpec;
      setSpec(data);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? { ...p, spec_json: data, status: "structured" }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setSpecError(err.message || "Something went wrong");
    } finally {
      setSpecLoading(false);
    }
  }

  async function handleSaveSpec() {
    if (!activeProject || !spec) return;
    setSpecError(null);
    setSpecSaving(true);

    try {
      const res = await fetch("/api/builder/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "save",
          projectId: activeProject.id,
          spec,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save spec");
      }

      const saved = (await res.json()) as MultiLensSpec;
      setSpec(saved);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                spec_json: saved,
                status: p.status === "draft" ? "structured" : p.status,
              }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setSpecError(err.message || "Something went wrong");
    } finally {
      setSpecSaving(false);
    }
  }

  async function handleGenerateArchitecture() {
    if (!activeProject) return;
    if (!spec) {
      setArchError(
        "Multi-Lens Spec is required before generating architecture."
      );
      return;
    }

    setArchError(null);
    setArchLoading(true);
    try {
      const res = await fetch("/api/builder/architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          projectId: activeProject.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate architecture");
      }

      const data = (await res.json()) as ArchitectureMap;
      setArchitecture(data);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id ? { ...p, architecture_json: data } : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setArchError(err.message || "Something went wrong");
    } finally {
      setArchLoading(false);
    }
  }

  async function handleSaveArchitecture() {
    if (!activeProject || !architecture) return;
    setArchError(null);
    setArchSaving(true);

    try {
      const res = await fetch("/api/builder/architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "save",
          projectId: activeProject.id,
          architecture,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save architecture");
      }

      const saved = (await res.json()) as ArchitectureMap;
      setArchitecture(saved);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                architecture_json: saved,
                status: p.status === "draft" ? "structured" : p.status,
              }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setArchError(err.message || "Something went wrong");
    } finally {
      setArchSaving(false);
    }
  }

  async function handleBuild() {
    if (!activeProject) return;
    if (!architecture) {
      setArchError(
        "Architecture Map is required before running the Build Engine."
      );
      return;
    }

    setArchError(null);
    setBuildLoading(true);

    try {
      const res = await fetch("/api/builder/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to run Build Engine");
      }

      const updated = (await res.json()) as {
        projectId: string;
        status: BuilderStatus;
      };

      setProjects((prev) =>
        prev.map((p) =>
          p.id === updated.projectId ? { ...p, status: updated.status } : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setArchError(err.message || "Something went wrong during build");
    } finally {
      setBuildLoading(false);
    }
  }

  async function handleRefine() {
    if (!activeProject) return;
    if (!architecture) {
      setArchError("Architecture Map is required before marking as refined.");
      return;
    }

    setArchError(null);
    setRefineLoading(true);

    try {
      await handleSaveArchitecture();

      const res = await fetch("/api/builder/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProject.id,
          note: "Refinement from Preview Surgery / Architecture editor.",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to mark project as refined");
      }

      const updated = (await res.json()) as BuilderProject;
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err: any) {
      console.error(err);
      setArchError(err.message || "Something went wrong during refine");
    } finally {
      setRefineLoading(false);
    }
  }

  // --- Tests handlers --------------------------------------------------

  async function handleGenerateTestPlan() {
    if (!activeProject) return;
    if (!spec) {
      setArchError(
        "Multi-Lens Spec with QA Lens is required before generating a Test Plan."
      );
      return;
    }

    setArchError(null);
    setTestsLoading(true);

    try {
      const res = await fetch("/api/builder/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProject.id,
          mode: "generate",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate Test Plan");
      }

      const plan = (await res.json()) as TestPlan;
      setTestPlan(plan);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id ? { ...p, test_plan_json: plan } : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setArchError(err.message || "Something went wrong generating Test Plan");
    } finally {
      setTestsLoading(false);
    }
  }

  async function handleRunTests() {
    if (!activeProject) return;
    if (!testPlan) {
      setArchError("Generate a Test Plan before running virtual tests.");
      return;
    }

    setArchError(null);
    setTestsRunning(true);

    try {
      const res = await fetch("/api/builder/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProject.id,
          mode: "run",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to run virtual tests");
      }

      const plan = (await res.json()) as TestPlan;
      setTestPlan(plan);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? { ...p, test_plan_json: plan, status: "tested" }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setArchError(err.message || "Something went wrong running tests");
    } finally {
      setTestsRunning(false);
    }
  }

  // --- Smart Scan handler ----------------------------------------------

  async function handleRunScan() {
    if (!activeProject) return;

    setArchError(null);
    setScanLoading(true);

    try {
      const res = await fetch("/api/builder/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProject.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to run Smart Scan");
      }

      const report = (await res.json()) as ScanReport;
      setScanReport(report);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? { ...p, scan_report_json: report, status: "scanned" }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setArchError(err.message || "Something went wrong during Smart Scan");
    } finally {
      setScanLoading(false);
    }
  }

  // --- Export / Deployment handlers ------------------------------------

  async function handleExportPlan() {
    if (!activeProject) return;
    if (!architecture) {
      setArchError(
        "Architecture Map is required before generating an Export Plan."
      );
      return;
    }

    setArchError(null);
    setExportLoading(true);

    try {
      const res = await fetch("/api/builder/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate Export Plan");
      }

      const plan = (await res.json()) as ExportPlan;
      setExportPlan(plan);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id ? { ...p, export_plan_json: plan } : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setArchError(
        err.message || "Something went wrong generating Export Plan"
      );
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeploymentPlan() {
    if (!activeProject) return;

    setArchError(null);
    setDeploymentLoading(true);

    try {
      const res = await fetch("/api/builder/deployment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate Deployment Plan");
      }

      const plan = (await res.json()) as DeploymentPlan;
      setDeploymentPlan(plan);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? { ...p, deployment_plan_json: plan, status: "deployed" }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setArchError(
        err.message || "Something went wrong generating Deployment Plan"
      );
    } finally {
      setDeploymentLoading(false);
    }
  }

  // --- Lens helpers ----------------------------------------------------

  function updateFounderLens(patch: Partial<FounderLens>) {
    setSpec((prev) =>
      prev
        ? {
            ...prev,
            founderLens: { ...prev.founderLens, ...patch },
          }
        : prev
    );
  }

  function updateArchitectLens(patch: Partial<ArchitectLens>) {
    setSpec((prev) =>
      prev
        ? {
            ...prev,
            architectLens: { ...prev.architectLens, ...patch },
          }
        : prev
    );
  }

  function updateQaLens(patch: Partial<QaLens>) {
    setSpec((prev) =>
      prev
        ? {
            ...prev,
            qaLens: { ...prev.qaLens, ...patch },
          }
        : prev
    );
  }

  function updateClientLens(patch: Partial<ClientLens>) {
    setSpec((prev) =>
      prev
        ? {
            ...prev,
            clientLens: { ...prev.clientLens, ...patch },
          }
        : prev
    );
  }

  function updateAgentLens(patch: Partial<AgentLens>) {
    setSpec((prev) =>
      prev
        ? {
            ...prev,
            agentLens: {
              ...(prev.agentLens ?? { agents: [] }),
              ...patch,
            },
          }
        : prev
    );
  }

  function updateArchitectureScreens(newScreens: ArchitectureScreen[]) {
    setArchitecture((prev) =>
      prev
        ? {
            ...prev,
            screens: newScreens,
          }
        : prev
    );
  }

  function updateArchitectureEntities(newEntities: ArchitectureEntity[]) {
    setArchitecture((prev) =>
      prev
        ? {
            ...prev,
            entities: newEntities,
          }
        : prev
    );
  }

  function updateArchitectureInfra(patch: Partial<ArchitectureInfra>) {
    setArchitecture((prev) =>
      prev
        ? {
            ...prev,
            infra: { ...prev.infra, ...patch },
          }
        : prev
    );
  }

  // Derived metrics
  const totalTests = testPlan?.cases.length ?? 0;
  const passedTests =
    testPlan?.cases.filter((c) => c.status === "virtual_pass").length ?? 0;
  const failedTests =
    testPlan?.cases.filter((c) => c.status === "virtual_fail").length ?? 0;

  const totalExportFiles = exportPlan?.files.length ?? 0;
  const totalDeploySteps = deploymentPlan?.steps.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Builder Lab</h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            From raw idea or Research Lab blueprint to fully tested, scanned,
            export-ready, and launch-ready systems. Zero17’s prompt-to-deploy
            engine.
          </p>
        </div>
        <button
          type="button"
          onClick={loadProjects}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
        >
          ⟳ Refresh
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-900/20 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[260px,minmax(0,1.8fr),minmax(0,1.3fr)]">
        {/* Left: Projects list + create */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="text-sm font-medium text-slate-200">Projects</h2>

          <div className="space-y-3">
            {loading && (
              <p className="text-xs text-slate-500">
                Loading your builder projects...
              </p>
            )}

            {!loading && projects.length === 0 && (
              <p className="text-xs text-slate-500">
                No builder projects yet. Create your first build below.
              </p>
            )}

            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setActiveProjectId(project.id);
                    setSpecError(null);
                    setArchError(null);
                  }}
                  className={[
                    "w-full rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                    activeProjectId === project.id
                      ? "border-sky-500/80 bg-sky-950/40 text-slate-50"
                      : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600 hover:bg-slate-900",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      {project.title}
                    </span>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                      {project.build_type}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="truncate">
                      {project.description || "No description"}
                    </span>
                    <span className="rounded-full border border-slate-700 px-1.5 py-0.5 text-[10px]">
                      {STATUS_LABEL[project.status]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* Create project form */}
          <form onSubmit={handleCreateProject} className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-slate-300">
              New Build
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Project title"
                value={form.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
              />
              <textarea
                placeholder="Short description (optional)"
                value={form.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={2}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
              />
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    "app",
                    "agent",
                    "dashboard",
                    "landing",
                    "client_project",
                  ] as BuilderBuildType[]
                ).map((type) => {
                  const isActive = form.build_type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange("build_type", type)}
                      className={[
                        "rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide",
                        isActive
                          ? "border-sky-500 bg-sky-900/40 text-sky-100"
                          : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-100",
                      ].join(" ")}
                    >
                      {type.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !form.title.trim()}
              className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {creating ? "Creating..." : "Create Builder Project"}
            </button>
          </form>
        </section>

        {/* Center: Build Rail */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-slate-200">Build Rail</h2>
            {activeProject && (
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                {STATUS_LABEL[activeProject.status]}
              </span>
            )}
          </div>

          <BuilderStepper activeProject={!!activeProject} />

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
            {!activeProject ? (
              <p>
                Select or create a project on the left to start the build
                sequence. This center panel hosts Intent, Multi-Lens Spec,
                Architecture, Build, Refine, Tests, Smart Scan, Export and
                Deployment.
              </p>
            ) : (
              <>
                {(specError || archError) && (
                  <div className="mb-3 space-y-2">
                    {specError && (
                      <div className="rounded-lg border border-red-500/50 bg-red-900/30 px-3 py-2 text-[11px] text-red-100">
                        {specError}
                      </div>
                    )}
                    {archError && (
                      <div className="rounded-lg border border-amber-500/50 bg-amber-900/20 px-3 py-2 text-[11px] text-amber-100">
                        {archError}
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      Phases 2–9 · Intent → Spec → Architecture → Build → Refine
                      → Test → Scan → Export → Deploy
                    </p>
                    <p>
                      Define the build, generate the Multi-Lens Spec, map it
                      into Architecture, run the Build Engine v1, refine it,
                      auto-test, scan for risks, then generate export &
                      deployment plans.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIntentSource("raw_idea")}
                      className={[
                        "rounded-full border px-3 py-1 text-[10px]",
                        intentSource === "raw_idea"
                          ? "border-sky-500 bg-sky-900/40 text-sky-100"
                          : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-100",
                      ].join(" ")}
                    >
                      Raw Idea
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntentSource("research_blueprint")}
                      className={[
                        "rounded-full border px-3 py-1 text-[10px]",
                        intentSource === "research_blueprint"
                          ? "border-emerald-500 bg-emerald-900/20 text-emerald-100"
                          : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-100",
                      ].join(" ")}
                    >
                      Research Lab Blueprint (later)
                    </button>
                  </div>
                </div>

                {intentSource === "raw_idea" && !spec && (
                  <div className="mb-4 space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Describe the build in your own words
                    </label>
                    <textarea
                      placeholder="Example: I want a SaaS that helps founders manage AI agents, daily tasks, and launch assets in one place."
                      value={rawIdea}
                      onChange={(e) => setRawIdea(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-500">
                        Builder Lab will transform this into a structured spec
                        across Founder, Architect, QA, Client and Agent lenses.
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerateSpec}
                        disabled={specLoading || !rawIdea.trim()}
                        className="inline-flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                      >
                        {specLoading
                          ? "Generating..."
                          : "Generate Multi-Lens Spec"}
                      </button>
                    </div>
                  </div>
                )}

                {spec && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Multi-Lens Spec
                      </p>
                      <button
                        type="button"
                        onClick={handleSaveSpec}
                        disabled={specSaving}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                      >
                        {specSaving ? "Saving..." : "Save Spec"}
                      </button>
                    </div>

                    {/* Founder lens */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Founder Lens
                      </p>
                      <div className="space-y-2">
                        <label className="block text-[11px] text-slate-400">
                          Problem
                        </label>
                        <textarea
                          rows={2}
                          value={spec.founderLens.problem}
                          onChange={(e) =>
                            updateFounderLens({ problem: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                        />
                        <label className="block text-[11px] text-slate-400">
                          Core Users (comma separated)
                        </label>
                        <input
                          type="text"
                          value={spec.founderLens.users.join(", ")}
                          onChange={(e) =>
                            updateFounderLens({
                              users: e.target.value
                                .split(",")
                                .map((v) => v.trim())
                                .filter(Boolean),
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                        />
                      </div>
                    </div>

                    {/* Architect lens */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Architect Lens
                      </p>
                      <div className="space-y-2">
                        <label className="block text-[11px] text-slate-400">
                          Entities (comma separated)
                        </label>
                        <input
                          type="text"
                          value={spec.architectLens.entities
                            .map((e) => e.name)
                            .join(", ")}
                          onChange={(e) =>
                            updateArchitectLens({
                              entities: e.target.value
                                .split(",")
                                .map((name) => ({
                                  name: name.trim(),
                                  description: "",
                                }))
                                .filter((e) => e.name),
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                        />
                        <label className="block text-[11px] text-slate-400">
                          External Integrations (comma separated)
                        </label>
                        <input
                          type="text"
                          value={spec.architectLens.externalIntegrations.join(
                            ", "
                          )}
                          onChange={(e) =>
                            updateArchitectLens({
                              externalIntegrations: e.target.value
                                .split(",")
                                .map((v) => v.trim())
                                .filter(Boolean),
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                        />
                      </div>
                    </div>

                    {/* QA lens */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        QA Lens
                      </p>
                      <div className="space-y-2">
                        <label className="block text-[11px] text-slate-400">
                          Acceptance Tests (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={spec.qaLens.acceptanceTests
                            .map((t) => t.description)
                            .join("\n")}
                          onChange={(e) =>
                            updateQaLens({
                              acceptanceTests: e.target.value
                                .split("\n")
                                .map((line, idx) => ({
                                  id: `acc_${idx}`,
                                  description: line.trim(),
                                }))
                                .filter((t) => t.description),
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                        />
                      </div>
                    </div>

                    {/* Client lens */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Client Lens
                      </p>
                      <div className="space-y-2">
                        <label className="block text-[11px] text-slate-400">
                          What You Get (one per line)
                        </label>
                        <textarea
                          rows={2}
                          value={spec.clientLens.whatYouGet.join("\n")}
                          onChange={(e) =>
                            updateClientLens({
                              whatYouGet: e.target.value
                                .split("\n")
                                .map((v) => v.trim())
                                .filter(Boolean),
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                        />
                        <label className="block text-[11px] text-slate-400">
                          ROI Narrative
                        </label>
                        <textarea
                          rows={2}
                          value={spec.clientLens.roiNarrative}
                          onChange={(e) =>
                            updateClientLens({
                              roiNarrative: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                        />
                      </div>
                    </div>

                    {/* Agent lens */}
                    {(spec.agentLens ||
                      activeProject.build_type === "agent" ||
                      activeProject.build_type === "dashboard") && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Agent Lens
                        </p>
                        <p className="mb-2 text-[11px] text-slate-500">
                          Define key agent roles (e.g., “Inbox Manager”, “Growth
                          Copilot”) and their capabilities.
                        </p>
                        <textarea
                          rows={2}
                          value={
                            spec.agentLens?.agents
                              .map((a) => a.name)
                              .join(", ") ?? ""
                          }
                          onChange={(e) =>
                            updateAgentLens({
                              agents: e.target.value
                                .split(",")
                                .map((name) => ({
                                  name: name.trim(),
                                  capabilities: [],
                                  escalationRules: [],
                                  riskLimits: [],
                                }))
                                .filter((a) => a.name),
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                        />
                      </div>
                    )}

                    {/* Architecture Map + Build + Refine */}
                    <div className="mt-4 space-y-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Architecture Map
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {!architecture && (
                            <button
                              type="button"
                              onClick={handleGenerateArchitecture}
                              disabled={archLoading}
                              className="inline-flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                            >
                              {archLoading
                                ? "Generating..."
                                : "Generate from Spec"}
                            </button>
                          )}
                          {architecture && (
                            <>
                              <button
                                type="button"
                                onClick={handleSaveArchitecture}
                                disabled={archSaving}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                              >
                                {archSaving ? "Saving..." : "Save Architecture"}
                              </button>
                              <button
                                type="button"
                                onClick={handleBuild}
                                disabled={buildLoading}
                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                              >
                                {buildLoading
                                  ? "Running Build..."
                                  : "Run Build Engine v1"}
                              </button>
                              <button
                                type="button"
                                onClick={handleRefine}
                                disabled={refineLoading}
                                className="inline-flex items-center gap-1 rounded-xl bg-fuchsia-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                              >
                                {refineLoading
                                  ? "Marking Refined..."
                                  : "Save & Mark Refined"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {!architecture && (
                        <p className="text-[11px] text-slate-500">
                          Once generated, the Architecture Map will show the
                          proposed screens, entities, APIs and infra. Refine it
                          before running Build, Tests, Scan and Export.
                        </p>
                      )}

                      {architecture && (
                        <div className="space-y-3">
                          {/* Screens */}
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Screens
                            </p>
                            <textarea
                              rows={3}
                              value={architecture.screens
                                .map((s) => `${s.name} — ${s.purpose}`)
                                .join("\n")}
                              onChange={(e) => {
                                const lines = e.target.value
                                  .split("\n")
                                  .map((l) => l.trim())
                                  .filter(Boolean);

                                const newScreens: ArchitectureScreen[] =
                                  lines.map((line, idx) => {
                                    const [name, purpose = ""] =
                                      line.split("—");
                                    return {
                                      id:
                                        architecture.screens[idx]?.id ??
                                        `screen_${idx}`,
                                      name: name.trim(),
                                      purpose: purpose.trim(),
                                    };
                                  });

                                updateArchitectureScreens(newScreens);
                              }}
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                            />
                          </div>

                          {/* Entities */}
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Entities
                            </p>
                            <textarea
                              rows={3}
                              value={architecture.entities
                                .map((e) => e.name)
                                .join("\n")}
                              onChange={(e) => {
                                const lines = e.target.value
                                  .split("\n")
                                  .map((l) => l.trim())
                                  .filter(Boolean);

                                const newEntities: ArchitectureEntity[] =
                                  lines.map((name, idx) => ({
                                    name,
                                    fields:
                                      architecture.entities[idx]?.fields ?? [],
                                  }));

                                updateArchitectureEntities(newEntities);
                              }}
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                            />
                          </div>

                          {/* Infra */}
                          <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Infra
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] text-slate-400">
                                  Database
                                </label>
                                <input
                                  type="text"
                                  value={architecture.infra.database}
                                  onChange={(e) =>
                                    updateArchitectureInfra({
                                      database: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-400">
                                  Hosting
                                </label>
                                <input
                                  type="text"
                                  value={architecture.infra.hosting}
                                  onChange={(e) =>
                                    updateArchitectureInfra({
                                      hosting: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-400">
                                  Auth Provider
                                </label>
                                <input
                                  type="text"
                                  value={architecture.infra.authProvider}
                                  onChange={(e) =>
                                    updateArchitectureInfra({
                                      authProvider: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-400">
                                  Billing Provider
                                </label>
                                <input
                                  type="text"
                                  value={
                                    architecture.infra.billingProvider ?? ""
                                  }
                                  onChange={(e) =>
                                    updateArchitectureInfra({
                                      billingProvider: e.target.value || null,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tests + Smart Scan */}
                    <div className="mt-2 space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Tests & Smart Scan
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {!testPlan && (
                            <button
                              type="button"
                              onClick={handleGenerateTestPlan}
                              disabled={testsLoading}
                              className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                            >
                              {testsLoading
                                ? "Generating..."
                                : "Generate Test Plan"}
                            </button>
                          )}
                          {testPlan && (
                            <button
                              type="button"
                              onClick={handleRunTests}
                              disabled={testsRunning}
                              className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                            >
                              {testsRunning
                                ? "Running Tests..."
                                : "Run Virtual Tests"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRunScan}
                            disabled={scanLoading}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                          >
                            {scanLoading ? "Scanning..." : "Run Smart Scan"}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            Test Coverage
                          </p>
                          {testPlan ? (
                            <>
                              <p className="text-[11px] text-slate-300">
                                {totalTests} cases · {passedTests} pass ·{" "}
                                {failedTests} flagged
                              </p>
                              {failedTests > 0 && (
                                <p className="text-[11px] text-amber-300">
                                  Focus on the virtual_fail tests first — they
                                  signal high-risk paths to harden.
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              No Test Plan yet. Generate from QA Lens to define
                              “done” before shipping.
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            Structural Risk
                          </p>
                          {scanReport ? (
                            <>
                              <p className="text-[11px] text-slate-300">
                                Smart Scan score:{" "}
                                <span className="font-semibold">
                                  {scanReport.score}/100
                                </span>{" "}
                                · {scanReport.issues.length} issue
                                {scanReport.issues.length === 1 ? "" : "s"}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {scanReport.summary}
                              </p>
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              Run Smart Scan to get a structural readiness score
                              and prioritized issues.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Export & Deployment */}
                    <div className="mt-2 space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Export & Launch
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={handleExportPlan}
                            disabled={exportLoading}
                            className="inline-flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                          >
                            {exportLoading
                              ? "Generating Export..."
                              : "Generate Export Plan"}
                          </button>
                          <button
                            type="button"
                            onClick={handleDeploymentPlan}
                            disabled={deploymentLoading}
                            className="inline-flex items-center gap-1 rounded-xl bg-lime-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-lime-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                          >
                            {deploymentLoading
                              ? "Building Launch Plan..."
                              : "Generate Deployment Plan"}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            Export Blueprint
                          </p>
                          {exportPlan ? (
                            <>
                              <p className="text-[11px] text-slate-300">
                                {totalExportFiles} files in export pack.
                              </p>
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                {exportPlan.summary}
                              </p>
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              Generate an Export Plan to see file-level layout
                              (pages, components, schema, tests, docs).
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            Deployment Checklist
                          </p>
                          {deploymentPlan ? (
                            <>
                              <p className="text-[11px] text-slate-300">
                                {totalDeploySteps} steps to production (
                                {deploymentPlan.targetEnv}).
                              </p>
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                {deploymentPlan.summary}
                              </p>
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              Generate a Deployment Plan for infra, auth, DB,
                              env, CI/CD, monitoring and launch tasks.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Right: Preview & Activity Panel */}
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-slate-200">
              Preview & Activity
            </h2>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-500">
              Build · Refine · Test · Scan · Export
            </span>
          </div>

          <BuilderPreview
            project={activeProject ?? null}
            spec={spec}
            architecture={architecture}
            onArchitectureChange={(arch) => setArchitecture(arch)}
          />

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Quality & Launch Activity
            </p>

            {!activeProject ? (
              <p className="mt-1 text-[11px] text-slate-500">
                Select a project to see its tests, scans, export and deployment
                signals.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-200">
                    Tests
                  </p>
                  {testPlan ? (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {totalTests} cases · {passedTests} virtual pass ·{" "}
                      {failedTests} virtual fail.
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Test Plan not generated yet.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-200">
                    Smart Scan
                  </p>
                  {scanReport ? (
                    <>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Score:{" "}
                        <span className="font-semibold">
                          {scanReport.score}/100
                        </span>{" "}
                        · {scanReport.issues.length} issue
                        {scanReport.issues.length === 1 ? "" : "s"}.
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                        {scanReport.summary}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Run Smart Scan to see structural readiness.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-200">
                    Export
                  </p>
                  {exportPlan ? (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {totalExportFiles} files planned · stack:{" "}
                      <span className="font-semibold">
                        {exportPlan.stackHint}
                      </span>
                      .
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Generate Export Plan to see the repo blueprint.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2">
                  <p className="text-[11px] font-semibold text-slate-200">
                    Deployment
                  </p>
                  {deploymentPlan ? (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {totalDeploySteps} steps to{" "}
                      <span className="font-semibold">
                        {deploymentPlan.targetEnv}
                      </span>{" "}
                      launch.
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Generate Deployment Plan for infra/auth/db/env/CI/launch
                      sequence.
                    </p>
                  )}
                </div>

                <p className="mt-1 text-[10px] text-slate-500">
                  Next evolution: wire Export Plan to real repo generation,
                  GitHub sync and CI pipelines so Builder Lab becomes a true
                  one-click “idea → repo → preview URL” engine.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
