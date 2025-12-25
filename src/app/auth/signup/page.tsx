"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setMsg("Check your email to confirm, then you’ll be redirected back.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-slate-300">
          Confirm your email, then you’ll be able to create Builder projects.
        </p>

        <form onSubmit={signUp} className="mt-6 space-y-3">
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
              placeholder="Minimum 6 characters"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          {err && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          )}
          {msg && (
            <div className="rounded-xl border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
              {msg}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold hover:bg-sky-500 disabled:bg-slate-700"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold hover:bg-slate-800"
          >
            Back to sign in
          </button>
        </form>
      </div>
    </main>
  );
}
