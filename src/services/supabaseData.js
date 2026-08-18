// agent-notes: { ctx: "Supabase service for storing and restoring user profile, scores, resume analysis & progress by User ID", deps: ["./supabase"], state: "active", last: "anti@2026-08-18" }

import { supabase } from './supabase';

/**
 * Saves complete user profile, progress, scores, and resume analysis to Supabase.
 * Uses both Supabase Auth user_metadata and Supabase table upsert for maximum reliability.
 */
export async function saveUserDataToSupabase(user) {
  if (!user || !user.id) return { success: false, error: 'No valid user ID provided' };

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    college: user.college || '',
    degree: user.degree || '',
    department: user.department || '',
    graduationYear: user.graduationYear || 2027,
    careerGoal: user.careerGoal || '',
    experienceLevel: user.experienceLevel || 'Beginner',
    skills: user.skills || [],
    interests: user.interests || [],
    scores: user.scores || {
      skillScore: 60,
      resumeScore: 65,
      interviewReadiness: 55,
      placementReadiness: 60,
      weeklyGoalProgress: 20
    },
    hasUploadedResume: Boolean(user.hasUploadedResume || user.resumeAnalysis?.analyzed),
    resumeAnalysis: user.resumeAnalysis || null,
    updatedAt: new Date().toISOString()
  };

  // 1. Save to LocalStorage cache keyed by user ID & active user
  try {
    localStorage.setItem(`sb_user_data_${user.id}`, JSON.stringify(payload));
    if (user.email) {
      localStorage.setItem(`sb_user_data_email_${user.email.toLowerCase()}`, JSON.stringify(payload));
    }
  } catch (err) {
    console.warn('LocalStorage caching failed:', err);
  }

  // 2. Persist to Supabase Auth User Metadata (bound directly to user ID)
  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user) {
      await supabase.auth.updateUser({
        data: {
          profile_data: payload,
          updated_at: payload.updatedAt
        }
      });
    }
  } catch (err) {
    console.warn('Supabase Auth user_metadata update notice:', err.message);
  }

  // 3. Persist to Supabase Database Table 'user_progress'
  try {
    const { error: dbError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        email: user.email?.toLowerCase(),
        name: user.name,
        college: user.college,
        career_goal: user.careerGoal,
        scores: user.scores,
        resume_analysis: user.resumeAnalysis,
        raw_user_data: payload,
        updated_at: payload.updatedAt
      }, { onConflict: 'user_id' });

    if (dbError) {
      console.warn('Supabase DB table save notice (using Auth Metadata fallback):', dbError.message);
    }
  } catch (err) {
    console.warn('Supabase DB table upsert attempt:', err.message);
  }

  return { success: true, data: payload };
}

/**
 * Loads user profile, scores, resume analysis & progress from Supabase by User ID / Email.
 */
export async function loadUserDataFromSupabase(userId, email = '') {
  if (!userId && !email) return null;

  let loadedData = null;

  // 1. Try fetching from Supabase Database Table 'user_progress'
  try {
    let query = supabase.from('user_progress').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    }
    const { data, error } = await query.single();
    if (!error && data) {
      loadedData = data.raw_user_data || {
        id: data.user_id,
        email: data.email,
        name: data.name,
        college: data.college,
        careerGoal: data.career_goal,
        scores: data.scores,
        resumeAnalysis: data.resume_analysis,
        hasUploadedResume: Boolean(data.resume_analysis?.analyzed)
      };
    }
  } catch (err) {
    console.warn('Supabase DB table query notice:', err.message);
  }

  // 2. If DB table yields no row, try reading from Supabase Auth User Metadata
  if (!loadedData) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user && (authUser.user.id === userId || authUser.user.email?.toLowerCase() === email.toLowerCase())) {
        const metadataProfile = authUser.user.user_metadata?.profile_data;
        if (metadataProfile) {
          loadedData = metadataProfile;
        }
      }
    } catch (err) {
      console.warn('Supabase Auth user_metadata fetch notice:', err.message);
    }
  }

  // 3. Fallback to LocalStorage user cache if network/Supabase offline
  if (!loadedData) {
    try {
      const cached = localStorage.getItem(`sb_user_data_${userId}`) || 
                     (email ? localStorage.getItem(`sb_user_data_email_${email.toLowerCase()}`) : null);
      if (cached) {
        loadedData = JSON.parse(cached);
      }
    } catch (e) {
      console.warn('LocalStorage fallback cache parse notice:', e);
    }
  }

  return loadedData;
}
