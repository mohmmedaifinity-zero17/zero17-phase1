"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signIn(provider: "google" | "github") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500">
        …
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => signIn("google")}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
        >
          Sign in with Google
        </button>
        <button
          onClick={() => signIn("github")}
          className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
        >
          GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-600">{user.email}</span>
      <button
        onClick={signOut}
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
      >
        Sign out
      </button>
    </div>
  );
}
