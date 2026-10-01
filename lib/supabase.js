// agent-notes: { ctx: "Supabase client helper with anonymous user persistence, profile and skill_progress sync, and local storage fallback", deps: ["@supabase/supabase-js"], state: "active", last: "anti@2026-10-01" }
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  "https://rkktmjgzfuoymdvgdhda.supabase.co";

const supabaseAnonKey =
  (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJra3Rtamd6ZnVveW1kdmdkaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTY4NzEsImV4cCI6MjA5OTgzMjg3MX0.t6f10I9DQMcmvVmyupDyxxA-hg3Jer15D3wLnHqXpPg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Ensures a stable user ID survives page refreshes via Supabase session or anonymous auth.
 */
export async function ensureUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (!error && data?.user) return data.user;
  } catch (err) {
    console.warn("[Supabase ensureUser] Session note:", err?.message || err);
  }

  // Stable local user ID in localStorage across refreshes
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

/**
 * Loads user profile from Supabase with localStorage cache
 */
export async function getStoredProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`sb_profile_${userId}`, JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn("[Supabase getProfile] Reading from local cache:", err?.message || err);
  }

  if (typeof window !== "undefined" && window.localStorage) {
    const local = window.localStorage.getItem(`sb_profile_${userId}`) || window.localStorage.getItem("sb_active_profile");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
  }

  return null;
}

/**
 * Upserts profile into Supabase and updates local cache
 */
export async function saveProfile(profile) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(`sb_profile_${profile.user_id}`, JSON.stringify(profile));
    window.localStorage.setItem("sb_active_profile", JSON.stringify(profile));
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: profile.user_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          target_role: profile.target_role,
          resume: profile.resume || {},
          skills: profile.skills || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn("[Supabase saveProfile] Saved locally:", err?.message || err);
  }

  return profile;
}

/**
 * Fetches skill progress rows for a user
 */
export async function getSkillProgressRows(userId) {
  try {
    const { data, error } = await supabase
      .from("skill_progress")
      .select("user_id, skill, status, updated_at")
      .eq("user_id", userId)
      .order("skill");

    if (!error && data && data.length > 0) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`sb_skills_${userId}`, JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    console.warn("[Supabase getSkillProgressRows] Falling back to local cache:", err?.message || err);
  }

  if (typeof window !== "undefined" && window.localStorage) {
    const local = window.localStorage.getItem(`sb_skills_${userId}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
  }

  return [];
}

/**
 * Updates a single skill status ('todo' | 'learning' | 'done')
 */
export async function updateSkillStatus(userId, skill, status) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const localKey = `sb_skills_${userId}`;
      const raw = window.localStorage.getItem(localKey);
      let list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((x) => x.skill === skill);
      if (idx !== -1) {
        list[idx].status = status;
        list[idx].updated_at = new Date().toISOString();
      } else {
        list.push({ user_id: userId, skill, status, updated_at: new Date().toISOString() });
      }
      window.localStorage.setItem(localKey, JSON.stringify(list));
    } catch {}
  }

  try {
    await supabase.from("skill_progress").upsert(
      {
        user_id: userId,
        skill,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,skill" }
    );
  } catch (err) {
    console.warn("[Supabase updateSkillStatus] Updated locally:", err?.message || err);
  }
}

/**
 * Stores missing skills into Supabase
 */
export async function batchStoreMissingSkills(userId, skills) {
  const rows = (skills || []).map((skill) => ({
    user_id: userId,
    skill,
    status: "todo",
    updated_at: new Date().toISOString(),
  }));

  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(`sb_skills_${userId}`, JSON.stringify(rows));
  }

  try {
    await supabase.from("skill_progress").upsert(rows, {
      onConflict: "user_id,skill",
      ignoreDuplicates: true,
    });
  } catch (err) {
    console.warn("[Supabase batchStoreMissingSkills] Saved locally:", err?.message || err);
  }
}

export default {
  supabase,
  ensureUser,
  getStoredProfile,
  saveProfile,
  getSkillProgressRows,
  updateSkillStatus,
  batchStoreMissingSkills,
};
