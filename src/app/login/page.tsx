// src/app/login/page.tsx

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-slate-900">Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your Builder v2 requires authentication (Supabase). Plug your
            existing auth UI here, or change the redirect path in Builder v2 to
            your actual auth route.
          </p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            If you already have an auth route like{" "}
            <span className="font-mono">/auth</span> or{" "}
            <span className="font-mono">/signin</span>, update the redirect in:
            <div className="mt-2 font-mono text-xs">
              src/app/builder/v2/page.tsx
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
