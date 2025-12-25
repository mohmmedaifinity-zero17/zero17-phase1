// src/hooks/useSupabaseUser.ts
"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export interface SupabaseUser {
  id: string;
  email?: string;
}

export function useSupabaseUser() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!isMounted) return;

      if (user) {
        setUser({ id: user.id, email: user.email ?? undefined });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event: string, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
