const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');
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

  const token = localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(
    `${API_URL}/resume/analyze`,
    {
      method: "POST",
      headers,
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message ||
      "Resume analysis failed"
    );
  }

  return response.json();
}

export const uploadResume = analyzeResume;
export const analyzeResumeApi = analyzeResume;

export const applyProblemFix = async (problemId) => {
  try {
    const res = await fetch(`${API_URL}/resume/apply-fix`, {
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
    const res = await fetch(`${API_URL}/skills/gap`, {
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
    const res = await fetch(`${API_URL}/skills/advance`, {
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
    const res = await fetch(`${API_URL}/certificates/generate`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userName, skillName })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
