// agent-notes: { ctx: "Frontend API client and state bridge for AI Roleplay simulations, scenarios, and coaching feedback", deps: ["./api"], state: "active", last: "anti@2026-08-29" }

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token');
  const user = JSON.parse(localStorage.getItem('sb_user') || '{}');
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

export const roleplayApi = {
  // 1. Get all scenarios
  getScenarios: async () => {
    return await request('/roleplay/scenarios');
  },

  // 2. Get scenario by ID
  getScenario: async (id) => {
    return await request(`/roleplay/scenarios/${id}`);
  },

  // 3. Create custom scenario
  createScenario: async (scenarioData) => {
    return await request('/roleplay/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenarioData)
    });
  },

  // 4. Delete custom scenario
  deleteScenario: async (id) => {
    return await request(`/roleplay/scenarios/${id}`, {
      method: 'DELETE'
    });
  },

  // 5. Start roleplay session
  startSession: async (scenarioId) => {
    return await request('/roleplay/sessions', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId })
    });
  },

  // 6. Get session details & messages
  getSession: async (sessionId) => {
    return await request(`/roleplay/sessions/${sessionId}`);
  },

  // 7. Send user turn message
  sendMessage: async (sessionId, content) => {
    return await request(`/roleplay/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  // 8. End session and get feedback
  endSession: async (sessionId) => {
    return await request(`/roleplay/sessions/${sessionId}/end`, {
      method: 'POST'
    });
  },

  // 9. Get user roleplay history
  getHistory: async () => {
    return await request('/roleplay/history');
  }
};
