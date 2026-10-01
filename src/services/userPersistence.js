// agent-notes: { ctx: "Core persistence service for Supabase profiles, resumes, progress, storage & never-ask-twice resume gate", deps: ["./supabase", "../utils/sanitizeProfile"], state: "active", last: "anti@2026-10-01" }
import { supabase } from './supabase.js';
import { sanitizeUserProfile } from '../utils/sanitizeProfile.js';

/**
 * Calculates standardized percentage progress from completed features.
 * Resume Analysis: 20%
 * Skill Gap: 20%
 * Job Matrix: 20%
 * Career Guidance: 15%
 * AI Mentor: 15%
 * Tasks / Certificates: 10%
 */
export function calculateOverallProgress(progressRecord = {}) {
  let score = 0;
  if (progressRecord.resume_analysis_completed) score += 20;
  if (progressRecord.skill_gap_completed) score += 20;
  if (progressRecord.job_matrix_completed) score += 20;
  if (progressRecord.career_guidance_completed) score += 15;
  if (progressRecord.ai_mentor_completed) score += 15;

  const tasks = Number(progressRecord.coding_tasks_completed || 0);
  const certs = Number(progressRecord.certificates_completed || 0);
  const taskScore = Math.min(10, tasks * 2 + certs * 5);
  score += taskScore;

  return Math.min(100, Math.max(0, score));
}

/**
 * Retrieves the currently authenticated Supabase user or active session.
 */
export async function getAuthUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user;
  } catch (err) {
    console.warn('[userPersistence] getAuthUser error:', err?.message || err);
  }
  return null;
}

/**
 * Comprehensive startup initializer.
 * Checks Supabase authentication, profiles, resumes, and user_progress.
 * Never flashes the upload page if data exists.
 */
export async function initializeUserData() {
  const user = await getAuthUser();

  if (!user) {
    // Check if we have a locally saved user in localStorage (for guest / offline modes)
    try {
      const savedUserStr = localStorage.getItem('sb_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.id && savedUser?.hasUploadedResume) {
          return {
            authenticated: true,
            user: { id: savedUser.id, email: savedUser.email },
            profile: {
              id: savedUser.id,
              full_name: savedUser.name,
              email: savedUser.email,
              career_goal: savedUser.careerGoal,
              skills: savedUser.skills || [],
              profile_completed: true,
              hasUploadedResume: true,
            },
            resume: {
              id: savedUser.resumeId || `res_${savedUser.id}`,
              user_id: savedUser.id,
              file_name: savedUser.resumeFileName || 'Uploaded_Resume.pdf',
              parsed_text: savedUser.resumeText || '',
              resume_score: savedUser.scores?.resumeScore || 82,
              skills: savedUser.skills || [],
              education: savedUser.education || [],
              experience: savedUser.experience || [],
            },
            progress: {
              user_id: savedUser.id,
              overall_progress: savedUser.scores?.placementReadiness || 65,
              resume_analysis_completed: true,
              skill_gap_completed: Boolean(savedUser.skills?.length > 0),
              job_matrix_completed: false,
              career_guidance_completed: false,
              ai_mentor_completed: false,
            },
            skillGaps: [],
            careerData: null,
          };
        }
      }
    } catch {}

    return {
      authenticated: false,
      user: null,
      profile: null,
      resume: null,
      progress: null,
      skillGaps: [],
      careerData: null,
    };
  }

  // User is authenticated in Supabase: query all relevant tables concurrently
  try {
    const [profileResult, resumeResult, progressResult, skillGapsResult, careerDataResult] =
      await Promise.allSettled([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),

        supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),

        supabase
          .from('skill_gaps')
          .select('*')
          .eq('user_id', user.id),

        supabase
          .from('career_data')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

    const profileData = profileResult.status === 'fulfilled' ? profileResult.value?.data : null;
    const resumeData = resumeResult.status === 'fulfilled' ? resumeResult.value?.data : null;
    let progressData = progressResult.status === 'fulfilled' ? progressResult.value?.data : null;
    const skillGaps = skillGapsResult.status === 'fulfilled' ? skillGapsResult.value?.data || [] : [];
    const careerData = careerDataResult.status === 'fulfilled' ? careerDataResult.value?.data : null;

    // Check localStorage cache as fallback if Supabase tables are still cold
    let cachedLocal = null;
    try {
      const raw = localStorage.getItem(`sb_user_data_${user.id}`);
      if (raw) cachedLocal = JSON.parse(raw);
    } catch {}

    const resolvedResume = resumeData || cachedLocal?.resume || null;
    const resolvedProfile = profileData || cachedLocal?.profile || null;

    if (progressData) {
      progressData.overall_progress = calculateOverallProgress(progressData);
    } else if (cachedLocal?.progress) {
      progressData = cachedLocal.progress;
    } else if (resolvedResume) {
      progressData = {
        user_id: user.id,
        resume_id: resolvedResume.id,
        overall_progress: 25,
        resume_analysis_completed: true,
        skill_gap_completed: false,
        job_matrix_completed: false,
        career_guidance_completed: false,
        ai_mentor_completed: false,
      };
    }

    return {
      authenticated: true,
      user,
      profile: resolvedProfile,
      resume: resolvedResume,
      progress: progressData,
      skillGaps,
      careerData,
    };
  } catch (err) {
    console.error('[userPersistence] initializeUserData error:', err);
    return {
      authenticated: true,
      user,
      profile: null,
      resume: null,
      progress: null,
      skillGaps: [],
      careerData: null,
      error: err.message,
    };
  }
}

/**
 * Securely uploads resume file to Supabase Storage bucket 'resumes'.
 * Returns public/signed URL and file path.
 */
export async function uploadResumeFileToStorage(userId, resumeId, file) {
  if (!file) return { filePath: null, fileUrl: null };

  const sanitizedFileName = (file.name || 'resume.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${resumeId}/${sanitizedFileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('[userPersistence] Storage upload notice:', error.message);
      return { filePath, fileUrl: null };
    }

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
    return { filePath, fileUrl: urlData?.publicUrl || null };
  } catch (err) {
    console.warn('[userPersistence] Storage upload error:', err?.message || err);
    return { filePath, fileUrl: null };
  }
}

/**
 * Saves or replaces a resume, stores extracted data, updates profiles,
 * and initializes user_progress in Supabase.
 */
export async function saveResumeAndProgress(params = {}) {
  const file = params.file || null;
  const fileName = params.fileName || file?.name || 'Uploaded_Resume.pdf';
  const parsedText = params.parsedText || '';
  const parsedAnalysis = params.parsedAnalysis || params.resumeData || {};
  const targetRole = params.targetRole || params.careerData?.targetRole || params.user?.careerGoal || 'Full Stack Developer';

  const user = await getAuthUser();
  const userId = user?.id || params.user?.id || `usr_${Date.now()}`;

  const resumeId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'res_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

  // 1. Upload to Supabase Storage
  let fileUrl = null;
  let filePath = null;
  if (file && user?.id) {
    const storageRes = await uploadResumeFileToStorage(user.id, resumeId, file);
    filePath = storageRes.filePath;
    fileUrl = storageRes.fileUrl;
  }

  // 2. Extract structured fields
  const skills = (params.skills && params.skills.length > 0)
    ? params.skills
    : (parsedAnalysis.skills?.detected || parsedAnalysis.extractedSkills || parsedAnalysis.skills || []);
  const education = (params.education && params.education.length > 0)
    ? params.education
    : (parsedAnalysis.education || []);
  const experience = (params.experience && params.experience.length > 0)
    ? params.experience
    : (parsedAnalysis.experience || []);
  const projects = (params.projects && params.projects.length > 0)
    ? params.projects
    : (parsedAnalysis.projects || []);
  const certifications = (params.certifications && params.certifications.length > 0)
    ? params.certifications
    : (parsedAnalysis.certifications || []);
  const candidateName = params.user?.name || parsedAnalysis.candidate?.name || parsedAnalysis.name || user?.user_metadata?.full_name || 'Candidate';
  const resumeScore = params.scores?.resumeScore || params.scores?.overall || parsedAnalysis.scores?.overall || parsedAnalysis.scores?.resumeScore || 82;

  const resumeRecord = {
    id: resumeId,
    user_id: user?.id || userId,
    file_name: file?.name || fileName,
    file_path: filePath,
    file_url: fileUrl,
    parsed_text: parsedText,
    resume_data: parsedAnalysis,
    skills,
    education,
    experience,
    projects,
    certifications,
    resume_score: resumeScore,
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const profileRecord = {
    id: user?.id || userId,
    full_name: candidateName,
    email: user?.email || parsedAnalysis.email || null,
    phone: parsedAnalysis.phone || null,
    career_goal: targetRole,
    resume_id: resumeId,
    profile_completed: true,
    updated_at: new Date().toISOString(),
  };

  const progressRecord = {
    user_id: user?.id || userId,
    resume_id: resumeId,
    resume_analysis_completed: true,
    skill_gap_completed: false,
    job_matrix_completed: false,
    career_guidance_completed: false,
    ai_mentor_completed: false,
    coding_tasks_completed: 0,
    certificates_completed: certifications.length,
    current_stage: 'Resume Analyzed',
    scores: parsedAnalysis.scores || { overall: resumeScore },
    overall_progress: 20,
    updated_at: new Date().toISOString(),
  };

  // 3. Persist to Supabase if authenticated
  if (user?.id) {
    try {
      const promises = [
        supabase.from('resumes').insert(resumeRecord),
        supabase.from('profiles').upsert(profileRecord, { onConflict: 'id' }),
        supabase.from('user_progress').upsert(progressRecord, { onConflict: 'user_id' }),
        supabase.from('career_data').upsert({
          user_id: user.id,
          target_role: targetRole,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' }),
      ];

      if (params.skillGaps && Array.isArray(params.skillGaps) && params.skillGaps.length > 0) {
        const gapRows = params.skillGaps.map(g => ({
          user_id: user.id,
          resume_id: resumeId,
          skill_name: g.skillName || g.name || String(g),
          category: g.category || 'Technical',
          current_level: g.currentLevel || 'Beginner',
          required_level: g.requiredLevel || 'Advanced',
          gap_score: g.gapScore || 40,
          status: g.status || 'MISSING',
          recommended_action: g.recommendedAction || 'Complete roadmap module'
        }));
        promises.push(supabase.from('skill_gaps').insert(gapRows));
      }

      await Promise.allSettled(promises);
    } catch (err) {
      console.warn('[userPersistence] Supabase table upsert notice:', err?.message || err);
    }
  }

  // 4. Update local cache for instant resilience across page refreshes
  const localCache = {
    id: user?.id || userId,
    name: candidateName,
    email: user?.email || parsedAnalysis.email || '',
    careerGoal: targetRole,
    skills,
    education,
    experience,
    projects,
    certifications,
    hasUploadedResume: true,
    resumeId,
    resumeFileName: file?.name || fileName,
    resumeText: parsedText,
    scores: {
      resumeScore,
      placementReadiness: parsedAnalysis.scores?.ats || 80,
      interviewReadiness: parsedAnalysis.scores?.grammar || 85,
      skillScore: parsedAnalysis.scores?.skills || 75,
    },
    profile: profileRecord,
    resume: resumeRecord,
    progress: progressRecord,
  };

  try {
    localStorage.setItem(`sb_user_data_${user?.id || userId}`, JSON.stringify(localCache));
    localStorage.setItem('sb_user', JSON.stringify(sanitizeUserProfile(localCache)));
    localStorage.setItem('sb_active_resume_id', resumeId);
    localStorage.setItem('sb_resume_filename', file?.name || fileName);
    localStorage.setItem('sb_resume_text', parsedText);
  } catch (err) {
    console.warn('[userPersistence] LocalStorage cache notice:', err);
  }

  return {
    success: true,
    resume: resumeRecord,
    profile: profileRecord,
    progress: progressRecord,
    userData: localCache,
  };
}

/**
 * Updates an individual feature completion state (e.g. skill_gap_completed, job_matrix_completed)
 * and recalculates the total overall progress percentage.
 */
export async function updateFeatureProgress(featureName, isCompleted = true, extraFields = {}) {
  const user = await getAuthUser();
  if (!user?.id) return null;

  try {
    const { data: currentProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const merged = {
      ...(currentProgress || {}),
      user_id: user.id,
      [featureName]: isCompleted,
      ...extraFields,
      updated_at: new Date().toISOString(),
    };

    merged.overall_progress = calculateOverallProgress(merged);

    await supabase
      .from('user_progress')
      .upsert(merged, { onConflict: 'user_id' });

    // Update local cache
    try {
      const raw = localStorage.getItem(`sb_user_data_${user.id}`);
      if (raw) {
        const cached = JSON.parse(raw);
        cached.progress = merged;
        localStorage.setItem(`sb_user_data_${user.id}`, JSON.stringify(cached));
      }
    } catch {}

    return merged;
  } catch (err) {
    console.warn('[userPersistence] updateFeatureProgress error:', err?.message || err);
    return null;
  }
}
