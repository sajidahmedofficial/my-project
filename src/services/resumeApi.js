// agent-notes: { ctx: "Frontend API client for resume parsing, analysis, problem fixes & skill gap updates", deps: [], state: "active", last: "anti@2026-08-25" }

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (extraHeaders = {}) => {
  const token = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('sb_token') || sessionStorage?.getItem('sb_token'))
    : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
};

export async function analyzeResume(
  file,
  targetRole = "Full Stack Developer"
) {
  const formData = new FormData();

  formData.append(
    "resume",
    file
  );

  formData.append(
    "targetRole",
    targetRole
  );

  const token = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('sb_token') || sessionStorage?.getItem('sb_token'))
    : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(
    `${API_BASE_URL}/resume/analyze`,
    {
      method: "POST",
      headers,
      body: formData
    }
  );

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.error || errorJson.message || errorJson.details || (errorJson.step ? `Error during ${errorJson.step}: ${errorJson.error || errorJson.message}` : JSON.stringify(errorJson));
    } catch {
      errorDetail = await response.text().catch(() => response.statusText);
    }
    const fullError = new Error(`[HTTP ${response.status}] ${errorDetail || response.statusText || 'Resume analysis failed'}`);
    fullError.status = response.status;
    fullError.details = errorDetail;
    throw fullError;
  }

  return response.json();
}

export const uploadResume = analyzeResume;
export const analyzeResumeApi = analyzeResume;

export const applyProblemFix = async (problemId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/resume/apply-fix`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ problemId })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchSkillGap = async (userSkills, roleRequirements) => {
  try {
    const res = await fetch(`${API_BASE_URL}/skills/gap`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userSkills, roleRequirements })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const advanceSkillProgress = async (skillName, currentProgress) => {
  try {
    const res = await fetch(`${API_BASE_URL}/skills/advance`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ skillName, currentProgress })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const generateCertificate = async (userName, skillName) => {
  try {
    const res = await fetch(`${API_BASE_URL}/certificates/generate`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userName, skillName })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
