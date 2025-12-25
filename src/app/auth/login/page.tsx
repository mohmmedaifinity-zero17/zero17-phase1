"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    // Ensure server sees the cookie
    router.push("/builder");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-300">
          Sign in once to unlock Builder Lab APIs.
        </p>

        <form onSubmit={signIn} className="mt-6 space-y-3">
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {err && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold hover:bg-sky-500 disabled:bg-slate-700"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/signup")}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold hover:bg-slate-800"
          >
            Create account
          </button>
        </form>
      </div>
    </main>
  );
}
