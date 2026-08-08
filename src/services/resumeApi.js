// agent-notes: { ctx: "Frontend API service module for communicating with Backend REST endpoints", deps: [], state: "active", last: "anti@2026-08-06" }
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

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

  const response = await fetch(
    `${API_URL}/api/resume/analyze`,
    {
      method: "POST",
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
    const res = await fetch(`${API_URL}/api/resume/apply-fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchSkillGap = async (userSkills, roleRequirements) => {
  try {
    const res = await fetch(`${API_URL}/api/skills/gap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userSkills, roleRequirements })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const advanceSkillProgress = async (skillName, currentProgress) => {
  try {
    const res = await fetch(`${API_URL}/api/skills/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillName, currentProgress })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const generateCertificate = async (userName, skillName) => {
  try {
    const res = await fetch(`${API_URL}/api/certificates/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, skillName })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
