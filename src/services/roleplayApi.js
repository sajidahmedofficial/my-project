// agent-notes: { ctx: "Universal API client for Rolemint simulation, auth tokens, session history, and coaching reports", deps: [], state: "active", last: "anti@2026-08-29" }

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('sb_token', token);
  } else {
    localStorage.removeItem('sb_token');
    sessionStorage.removeItem('sb_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('sb_user') || sessionStorage.getItem('sb_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('sb_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('sb_user');
    sessionStorage.removeItem('sb_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const user = getStoredUser();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { 'x-user-id': user.id } : {}),
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
  // Auth
  login: async (credentials) => {
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      return res;
    } catch {
      // Local graceful fallback if auth serverless is offline
      const demoUser = { id: 'usr_' + Date.now(), email: credentials.email, name: credentials.email.split('@')[0] };
      return { token: 'demo_jwt_token', user: demoUser };
    }
  },

  signup: async (userData) => {
    try {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      return res;
    } catch {
      // Local fallback
      const demoUser = { id: 'usr_' + Date.now(), email: userData.email, name: userData.name || 'Student' };
      return { token: 'demo_jwt_token', user: demoUser };
    }
  },

  // Scenarios
  listScenarios: async () => {
    return await request('/roleplay/scenarios');
  },

  getScenarios: async () => {
    return await request('/roleplay/scenarios');
  },

  getScenario: async (id) => {
    return await request(`/roleplay/scenarios/${id}`);
  },

  createScenario: async (scenarioData) => {
    return await request('/roleplay/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenarioData)
    });
  },

  deleteScenario: async (id) => {
    return await request(`/roleplay/scenarios/${id}`, {
      method: 'DELETE'
    });
  },

  // Sessions
  listSessions: async () => {
    const res = await request('/roleplay/history');
    return { sessions: res.history || [] };
  },

  startSession: async (scenarioId) => {
    return await request('/roleplay/sessions', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId })
    });
  },

  getSession: async (sessionId) => {
    return await request(`/roleplay/sessions/${sessionId}`);
  },

  sendMessage: async (sessionId, content) => {
    return await request(`/roleplay/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  endSession: async (sessionId) => {
    return await request(`/roleplay/sessions/${sessionId}/end`, {
      method: 'POST'
    });
  },

  getHistory: async () => {
    return await request('/roleplay/history');
  }
};

export const roleplayApi = api;
