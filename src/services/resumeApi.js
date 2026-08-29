// agent-notes: { ctx: "Frontend API client for uploading resumes, job descriptions, and receiving structured AI analysis", deps: [], state: "active", last: "anti@2026-08-29" }

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Uploads a resume file (or text) and optional job description for AI evaluation.
 * 
 * @param {Object} params
 * @param {File} [params.file] - Resume PDF/DOCX file
 * @param {string} [params.resumeText] - Raw text alternative
 * @param {string} [params.jobDescription] - Optional target job description
 * @param {string} [params.targetRole] - Optional target role title
 * @returns {Promise<Object>} Analysis response
 */
export async function analyzeResumeFile({ file, resumeText, jobDescription = '', targetRole = '' }) {
  const formData = new FormData();

  if (file) {
    formData.append('resume', file);
  }
  if (resumeText) {
    formData.append('resumeText', resumeText);
  }
  if (jobDescription) {
    formData.append('jobDescription', jobDescription);
  }
  if (targetRole) {
    formData.append('targetRole', targetRole);
  }

  const token = localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const errorMsg = errData.error || errData.message || `Analysis request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return await res.json();
}

export const resumeApi = {
  analyzeResumeFile
};

export default resumeApi;
