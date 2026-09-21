// agent-notes: { ctx: "Frontend API client service communicating with backend Express API for auth, 2FA & AI services", deps: [], state: "active", last: "anti@2026-08-25" }

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const errorMsg = errData.error || errData.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return await res.json();
}

export const api = {
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  generate2FA: (data) => request('/auth/generate-2fa', { method: 'POST', body: JSON.stringify(data) }),
  verify2FA: (data) => request('/auth/verify-2fa', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  completeOnboarding: (data) => request('/auth/onboarding', { method: 'POST', body: JSON.stringify(data) }),
  socialAuth: (provider, socialUser) => request('/auth/social-callback', { method: 'POST', body: JSON.stringify({ provider, socialUser }) }),
  analyzeResume: (data) => request('/ai/analyze-resume', { method: 'POST', body: JSON.stringify(data) }),
  skillGap: (data) => request('/ai/skill-gap', { method: 'POST', body: JSON.stringify(data) }),
  generateRoadmap: (data) => request('/ai/generate-roadmap', { method: 'POST', body: JSON.stringify(data) })
};
