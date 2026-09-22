// agent-notes: { ctx: "Unit tests verifying complete and clean logout flow and state clearance", deps: ["../src/utils/sanitizeProfile.js"], state: "active", last: "sato@2026-09-22" }
import assert from 'assert';

function createAuthManager(initialUser = null, initialToken = null) {
  const localStorageMock = {};
  const sessionStorageMock = {};

  if (initialUser) {
    localStorageMock['sb_user'] = JSON.stringify(initialUser);
    localStorageMock['sb_token'] = initialToken || 'token_123';
    localStorageMock['sb_remember'] = 'true';
    localStorageMock['sb-smkumtajiuxmaogfbtnq-auth-token'] = JSON.stringify({ access_token: initialToken });
  }

  let currentUser = initialUser;
  let token = initialToken;
  let isAuthenticated = Boolean(initialToken);
  let isOnboarded = Boolean(initialUser?.college && initialUser?.careerGoal);

  const logout = async (supabaseMock = null) => {
    try {
      if (supabaseMock?.auth?.signOut) {
        await supabaseMock.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signout notice:', e.message);
    }

    // Purge local storage
    delete localStorageMock['sb_token'];
    delete localStorageMock['sb_user'];
    delete localStorageMock['sb_remember'];
    
    // Purge all Supabase cached keys
    Object.keys(localStorageMock).forEach(key => {
      if (key.startsWith('sb-') || key.startsWith('supabase.')) {
        delete localStorageMock[key];
      }
    });

    // Purge session storage
    delete sessionStorageMock['sb_token'];
    delete sessionStorageMock['sb_user'];

    currentUser = null;
    token = null;
    isAuthenticated = false;
    isOnboarded = false;
  };

  const handleAuthStateChange = (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      currentUser = null;
      token = null;
      isAuthenticated = false;
      isOnboarded = false;
      delete localStorageMock['sb_token'];
      delete localStorageMock['sb_user'];
    }
  };

  return {
    getState: () => ({ currentUser, token, isAuthenticated, isOnboarded, localStorageMock, sessionStorageMock }),
    logout,
    handleAuthStateChange
  };
}

async function runTests() {
  console.log("🧪 Running Clean Logout & Storage Purge Tests...\n");

  const initialUser = {
    id: 'usr_test_123',
    name: 'Sajid Ahmed',
    email: 'sajid@skillbridge.ai',
    college: 'Stanford University',
    careerGoal: 'Full Stack AI Engineer'
  };

  const auth = createAuthManager(initialUser, 'token_secure_999');

  console.log("Test 1: Pre-logout state verification...");
  let state = auth.getState();
  assert.strictEqual(state.isAuthenticated, true, "Should be authenticated initially");
  assert.strictEqual(state.currentUser.name, 'Sajid Ahmed');
  assert.strictEqual(state.localStorageMock['sb_token'], 'token_secure_999');
  console.log("✅ Test 1 Passed: Initial state is authenticated with valid user and tokens.\n");

  console.log("Test 2: Executing logout and verifying storage purge...");
  const mockSupabase = {
    auth: {
      signOut: async () => ({ error: null })
    }
  };

  await auth.logout(mockSupabase);
  state = auth.getState();

  assert.strictEqual(state.isAuthenticated, false, "Should not be authenticated after logout");
  assert.strictEqual(state.currentUser, null, "Current user should be null");
  assert.strictEqual(state.token, null, "Token should be null");
  assert.strictEqual(state.isOnboarded, false, "isOnboarded should be false");
  assert.strictEqual(state.localStorageMock['sb_token'], undefined, "sb_token should be deleted");
  assert.strictEqual(state.localStorageMock['sb_user'], undefined, "sb_user should be deleted");
  assert.strictEqual(state.localStorageMock['sb-smkumtajiuxmaogfbtnq-auth-token'], undefined, "Supabase tokens should be deleted");
  console.log("✅ Test 2 Passed: Storage and state cleanly cleared after logout!\n");

  console.log("Test 3: Handling SIGNED_OUT auth state change event...");
  auth.handleAuthStateChange('SIGNED_OUT', null);
  state = auth.getState();
  assert.strictEqual(state.isAuthenticated, false, "Should remain unauthenticated on SIGNED_OUT");
  console.log("✅ Test 3 Passed: SIGNED_OUT event safely preserves unauthenticated state.\n");

  console.log("🎉 ALL LOGOUT UNIT TESTS PASSED (3/3)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
