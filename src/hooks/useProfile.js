// agent-notes: { ctx: "Custom hook for Supabase profile persistence with anonymous auth and local fallback", deps: ["@supabase/supabase-js", "react"], state: "active", last: "anti@2026-10-01" }
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  "https://rkktmjgzfuoymdvgdhda.supabase.co";

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJra3Rtamd6ZnVveW1kdmdkaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTY4NzEsImV4cCI6MjA5OTgzMjg3MX0.t6f10I9DQMcmvVmyupDyxxA-hg3Jer15D3wLnHqXpPg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

async function getUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (!error && data?.user) return data.user;
  } catch (err) {
    console.warn("[useProfile] Supabase auth notice:", err?.message || err);
  }

  // Stable visitor ID in localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    let localId = window.localStorage.getItem("sb_anon_user_id");
    if (!localId) {
      localId = "usr_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
      window.localStorage.setItem("sb_anon_user_id", localId);
    }
    return { id: localId };
  }

  return { id: "default_user" };
}

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const user = await getUser();

        // 1. Check local cache first for instant UI response
        if (typeof window !== "undefined" && window.localStorage) {
          const cached = window.localStorage.getItem(`sb_profile_${user.id}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (isMounted) setProfile(parsed);
            } catch {}
          }
        }

        // 2. Fetch from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data && isMounted) {
          setProfile(data);
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(`sb_profile_${user.id}`, JSON.stringify(data));
          }
        }
      } catch (err) {
        console.warn("[useProfile] Startup profile check:", err?.message || err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const save = useCallback(async (fields) => {
    const user = await getUser();
    const current = profile || {};
    const merged = {
      user_id: user.id,
      first_name: fields.first_name ?? current.first_name ?? null,
      last_name: fields.last_name ?? current.last_name ?? null,
      email: fields.email ?? current.email ?? null,
      phone: fields.phone ?? current.phone ?? null,
      target_role: fields.target_role ?? current.target_role ?? "Full Stack Developer",
      skills: fields.skills ?? current.skills ?? [],
      missing_skills: fields.missing_skills ?? current.missing_skills ?? [],
      done_skills: fields.done_skills ?? current.done_skills ?? [],
      updated_at: new Date().toISOString(),
    };

    // Instant optimistic state & local cache update
    setProfile(merged);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(`sb_profile_${user.id}`, JSON.stringify(merged));
    }

    // Persist to Supabase
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(merged, { onConflict: "user_id" })
        .select()
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(`sb_profile_${user.id}`, JSON.stringify(data));
        }
      } else if (error) {
        console.warn("[useProfile] Supabase save notice:", error.message);
      }
    } catch (err) {
      console.warn("[useProfile] Supabase upsert error:", err?.message || err);
    }
  }, [profile]);

  const resetProfile = useCallback(async () => {
    const user = await getUser();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(`sb_profile_${user.id}`);
    }
    setProfile(null);
  }, []);

  return { profile, loading, save, resetProfile };
}
