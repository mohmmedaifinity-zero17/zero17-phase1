"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SignInPage() {
  const supabase = createClientComponentClient();

  async function signIn(provider: "google" | "github") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });

    if (error) alert(error.message);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-lg font-semibold text-slate-900">
          Sign in to Zero17
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to save projects, run full labs, export Proof Packs, and
          deploy flows.
        </p>

        <div className="mt-4 grid gap-2">
          <button
            onClick={() => signIn("google")}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Continue with Google
          </button>

          <button
            onClick={() => signIn("github")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Continue with GitHub
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">
            Demo mode is available
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Without sign-in, projects reset on refresh and heavy exports are
            locked.
          </p>
        </div>
      </div>
    </main>
  );
}
