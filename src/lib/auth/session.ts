"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/browser";

export type SessionState = {
  status: "loading" | "signed-out" | "signed-in";
  user: User | null;
  displayName: string | null;
};

const LOADING: SessionState = {
  status: "loading",
  user: null,
  displayName: null,
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>(LOADING);
  const profileFor = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const client = getBrowserClient();

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      if (!user) {
        profileFor.current = null;
        setState({ status: "signed-out", user: null, displayName: null });
        return;
      }
      const sameUser = profileFor.current === user.id;
      setState((prev) => ({
        status: "signed-in",
        user,
        displayName: sameUser ? prev.displayName : null,
      }));
      if (sameUser) return;
      profileFor.current = user.id;
      // Not awaited inside the auth callback: Supabase may deadlock on it.
      void Promise.resolve(
        client
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle(),
      ).then(({ data: profile }) => {
        if (cancelled || profileFor.current !== user.id) return;
        setState((prev) => ({
          ...prev,
          displayName: profile?.display_name ?? null,
        }));
      });
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
