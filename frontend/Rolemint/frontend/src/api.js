const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('rolemint_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('rolemint_token', token);
  else localStorage.removeItem('rolemint_token');
}

export function getStoredUser() {
  const raw = localStorage.getItem('rolemint_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
  if (user) localStorage.setItem('rolemint_user', JSON.stringify(user));
  else localStorage.removeItem('rolemint_user');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  listScenarios: () => request('/scenarios'),
  createScenario: (payload) => request('/scenarios', { method: 'POST', body: payload }),
  deleteScenario: (id) => request(`/scenarios/${id}`, { method: 'DELETE' }),

  listSessions: () => request('/sessions'),
  startSession: (scenario_id) => request('/sessions', { method: 'POST', body: { scenario_id } }),
  getSession: (id) => request(`/sessions/${id}`),
  sendMessage: (id, content) => request(`/sessions/${id}/messages`, { method: 'POST', body: { content } }),
  endSession: (id) => request(`/sessions/${id}/end`, { method: 'POST' }),
};
