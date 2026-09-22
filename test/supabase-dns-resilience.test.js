// agent-notes: { ctx: "TDD tests for Supabase DNS resolution resilience and graceful offline data sync", deps: ["../src/utils/sanitizeProfile.js"], state: "active", last: "sato@2026-09-22" }
import assert from 'assert';
import { sanitizeUserProfile } from '../src/utils/sanitizeProfile.js';

// Simulated Supabase Data Manager with DNS Resilience
function createResilientSupabaseManager(supabaseClient, mockStorage = {}) {
  let isDnsReachable = false;

  const checkConnection = async () => {
    try {
      if (!supabaseClient?.auth?.getSession) {
        return { connected: false, reason: 'Client uninitialized' };
      }
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        return { connected: false, error: error.message };
      }
      isDnsReachable = true;
      return { connected: true, session: data?.session };
    } catch (err) {
      isDnsReachable = false;
      return { 
        connected: false, 
        isDnsError: true,
        error: `Supabase DNS resolution offline (${err.code || 'ENOTFOUND'}). Active local storage fallback.` 
      };
    }
  };

  const saveUserData = async (user) => {
    if (!user?.id) return { success: false, error: 'Invalid user ID' };
    const sanitized = sanitizeUserProfile(user);

    // Always persist to local cache first
    mockStorage[`sb_user_data_${sanitized.id}`] = JSON.stringify(sanitized);
    if (sanitized.email) {
      mockStorage[`sb_user_data_email_${sanitized.email.toLowerCase()}`] = JSON.stringify(sanitized);
    }

    // Attempt remote sync if reachable
    try {
      if (isDnsReachable && supabaseClient?.from) {
        await supabaseClient.from('user_progress').upsert({ id: sanitized.id, data: sanitized });
      }
    } catch (err) {
      console.warn('Remote sync skipped due to DNS/network status:', err.message);
    }

    return { success: true, localCached: true, isDnsReachable };
  };

  const loadUserData = async (userId, email = '') => {
    // 1. Try remote if reachable
    if (isDnsReachable && supabaseClient?.from) {
      try {
        const { data, error } = await supabaseClient.from('user_progress').select('*').eq('id', userId).single();
        if (!error && data) return sanitizeUserProfile(data);
      } catch (err) {
        console.warn('Remote fetch failed, falling back to local:', err.message);
      }
    }

    // 2. Fallback to storage cache
    const cachedById = mockStorage[`sb_user_data_${userId}`];
    if (cachedById) {
      try { return sanitizeUserProfile(JSON.parse(cachedById)); } catch {}
    }

    if (email) {
      const cachedByEmail = mockStorage[`sb_user_data_email_${email.toLowerCase()}`];
      if (cachedByEmail) {
        try { return sanitizeUserProfile(JSON.parse(cachedByEmail)); } catch {}
      }
    }

    return null;
  };

  return {
    checkConnection,
    saveUserData,
    loadUserData
  };
}

async function runTests() {
  console.log("🧪 Running Supabase DNS Resolution & Resilience Tests...\n");

  const storage = {};

  // Test Case 1: Unresolvable DNS hostname
  console.log("Test 1: Testing checkConnection against failing DNS hostname...");
  const failingDnsClient = {
    auth: {
      getSession: async () => {
        const err = new Error("getaddrinfo ENOTFOUND rkktmjgzfuoymdvgdhda.supabase.co");
        err.code = "ENOTFOUND";
        throw err;
      }
    }
  };

  const manager = createResilientSupabaseManager(failingDnsClient, storage);
  const connResult = await manager.checkConnection();

  assert.strictEqual(connResult.connected, false, "Should report connected: false");
  assert.strictEqual(connResult.isDnsError, true, "Should identify DNS error");
  assert(connResult.error.includes("ENOTFOUND"), "Should inform about ENOTFOUND without unhandled rejection");
  console.log("✅ Test 1 Passed: DNS resolution failure caught gracefully without crashing.\n");

  // Test Case 2: Save user data when DNS is unreachable
  console.log("Test 2: Saving user profile with active local fallback...");
  const testUser = {
    id: 'usr_student_987',
    name: 'Aarav Sharma',
    email: 'aarav@skillbridge.ai',
    college: 'IIT Madras',
    careerGoal: 'Full Stack AI Engineer',
    skills: ['React', 'Node.js', 'Python'],
    scores: { skillScore: 85, resumeScore: 90 }
  };

  const saveResult = await manager.saveUserData(testUser);
  assert.strictEqual(saveResult.success, true, "Save must succeed via local fallback");
  assert.strictEqual(saveResult.localCached, true);
  assert(storage['sb_user_data_usr_student_987'] !== undefined, "User data must exist in local cache");
  console.log("✅ Test 2 Passed: User profile cached locally despite DNS failure.\n");

  // Test Case 3: Load user data when DNS is unreachable
  console.log("Test 3: Loading user data from local cache when DNS is unreachable...");
  const loadedUser = await manager.loadUserData('usr_student_987', 'aarav@skillbridge.ai');
  assert(loadedUser !== null, "User must be retrieved from cache");
  assert.strictEqual(loadedUser.name, 'Aarav Sharma');
  assert.strictEqual(loadedUser.college, 'IIT Madras');
  assert.strictEqual(loadedUser.scores.skillScore, 85);
  console.log("✅ Test 3 Passed: User profile loaded flawlessly from local fallback!\n");

  console.log("🎉 ALL SUPABASE DNS RESILIENCE TESTS PASSED (3/3)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
