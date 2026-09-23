// agent-notes: { ctx: "TDD Unit test for OAuth redirect return session hydration & next-page navigation to dashboard", deps: ["../src/utils/sanitizeProfile.js"], state: "active", last: "tara@2026-09-23" }
import assert from 'assert';
import { sanitizeUserProfile } from '../src/utils/sanitizeProfile.js';

// Simulate the OAuth return hydration handler
async function handleOAuthReturn({ urlHash, urlSearch, supabaseMock, storageMock, onAuthStateUpdate }) {
  let session = null;

  // 1. Check if URL contains hash fragment tokens (implicit flow)
  if (urlHash && urlHash.includes('access_token=')) {
    const cleanHash = urlHash.startsWith('#') ? urlHash.substring(1) : urlHash;
    const params = new URLSearchParams(cleanHash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && supabaseMock?.auth?.setSession) {
      const { data, error } = await supabaseMock.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      });
      if (!error && data?.session) {
        session = data.session;
      }
    }
  }

  // 2. Check if URL contains code parameter (PKCE flow)
  if (!session && urlSearch && urlSearch.includes('code=')) {
    const params = new URLSearchParams(urlSearch);
    const code = params.get('code');
    if (code && supabaseMock?.auth?.exchangeCodeForSession) {
      const { data, error } = await supabaseMock.auth.exchangeCodeForSession(code);
      if (!error && data?.session) {
        session = data.session;
      }
    }
  }

  // 3. Fallback to getSession()
  if (!session && supabaseMock?.auth?.getSession) {
    const { data, error } = await supabaseMock.auth.getSession();
    if (!error && data?.session) {
      session = data.session;
    }
  }

  // 4. Process session and set authenticated user
  if (session?.user) {
    const u = session.user;
    const userObj = sanitizeUserProfile({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0],
      avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
      college: u.user_metadata?.college || 'SkillBridge Tech Academy',
      careerGoal: u.user_metadata?.careerGoal || 'Full Stack AI Engineer',
      isVerified: true
    });

    const activeToken = session.access_token || `token_oauth_${Date.now()}`;
    storageMock.setItem('sb_token', activeToken);
    storageMock.setItem('sb_user', JSON.stringify(userObj));

    if (onAuthStateUpdate) {
      onAuthStateUpdate({
        currentUser: userObj,
        isAuthenticated: true,
        isOnboarded: Boolean(userObj.college && userObj.careerGoal),
        activeTab: 'dashboard'
      });
    }

    return {
      authenticated: true,
      user: userObj,
      token: activeToken,
      activeTab: 'dashboard',
      cleanUrlNeeded: Boolean(urlHash || (urlSearch && urlSearch.includes('code=')))
    };
  }

  return { authenticated: false };
}

// Simulate onAuthStateChange guard ensuring INITIAL_SESSION with null doesn't wipe state
function handleAuthStateChange(event, session, { currentAuthState, onStateChange }) {
  if (event === 'SIGNED_OUT') {
    onStateChange({
      currentUser: null,
      isAuthenticated: false,
      token: null
    });
    return;
  }

  // Do NOT wipe out session on INITIAL_SESSION with null session
  if (event === 'INITIAL_SESSION' && !session) {
    return; // Keep existing authenticated session from storage
  }

  if (session?.user) {
    onStateChange({
      currentUser: sanitizeUserProfile({ id: session.user.id, email: session.user.email }),
      isAuthenticated: true,
      token: session.access_token
    });
  }
}

async function runTests() {
  console.log("🧪 Running OAuth Return & Dashboard Navigation Tests...\n");

  const store = {};
  const mockStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };

  // Test 1: Returning from Google OAuth with access_token hash
  console.log("Test 1: Handling return from Google OAuth with access_token hash fragment...");
  const mockSupabase = {
    auth: {
      setSession: async ({ access_token }) => ({
        data: {
          session: {
            access_token,
            user: {
              id: 'usr_google_123',
              email: 'student.google@skillbridge.ai',
              user_metadata: {
                full_name: 'Google Student',
                picture: 'https://lh3.googleusercontent.com/a/test'
              }
            }
          }
        },
        error: null
      })
    }
  };

  let stateUpdates = null;
  const res1 = await handleOAuthReturn({
    urlHash: '#access_token=mock_google_jwt_token_123&refresh_token=mock_refresh&token_type=bearer',
    urlSearch: '',
    supabaseMock: mockSupabase,
    storageMock: mockStorage,
    onAuthStateUpdate: (state) => { stateUpdates = state; }
  });

  assert.strictEqual(res1.authenticated, true, "Should be authenticated");
  assert.strictEqual(res1.activeTab, 'dashboard', "Must navigate to dashboard, NOT get-started landing page");
  assert.strictEqual(res1.cleanUrlNeeded, true, "Must flag URL clean up needed");
  assert.strictEqual(stateUpdates.isAuthenticated, true);
  assert.strictEqual(stateUpdates.activeTab, 'dashboard');
  assert.strictEqual(mockStorage.getItem('sb_token'), 'mock_google_jwt_token_123');
  console.log("✅ Test 1 Passed: Google OAuth hash fragment correctly authenticated user and set active tab to dashboard.\n");

  // Test 2: INITIAL_SESSION null event does NOT log out the user
  console.log("Test 2: Ensuring INITIAL_SESSION with null session does not wipe out authenticated user...");
  let currentAuthState = {
    currentUser: { id: 'usr_google_123', name: 'Google Student' },
    isAuthenticated: true,
    token: 'mock_google_jwt_token_123'
  };

  let stateChanged = false;
  handleAuthStateChange('INITIAL_SESSION', null, {
    currentAuthState,
    onStateChange: () => { stateChanged = true; }
  });

  assert.strictEqual(stateChanged, false, "INITIAL_SESSION null must not trigger logout or state reset");
  assert.strictEqual(currentAuthState.isAuthenticated, true, "User must remain authenticated");
  console.log("✅ Test 2 Passed: INITIAL_SESSION null did not destroy user session.\n");

  // Test 3: Explicit SIGNED_OUT event does log out the user
  console.log("Test 3: Ensuring SIGNED_OUT event clears auth state...");
  handleAuthStateChange('SIGNED_OUT', null, {
    currentAuthState,
    onStateChange: (newState) => { currentAuthState = newState; }
  });
  assert.strictEqual(currentAuthState.isAuthenticated, false, "User must be logged out on explicit SIGNED_OUT");
  console.log("✅ Test 3 Passed: SIGNED_OUT properly clears auth state.\n");

  console.log("🎉 ALL OAUTH REDIRECT TESTS PASSED (3/3)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
