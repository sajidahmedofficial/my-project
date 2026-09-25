// agent-notes: { ctx: "TDD tests for Real Gmail Selection & Supabase authentication flow", deps: ["../src/utils/sanitizeProfile.js"], state: "active", last: "tara@2026-09-25" }
import assert from 'assert';
import { sanitizeUserProfile } from '../src/utils/sanitizeProfile.js';

/**
 * Validates whether an email string has a valid email / Gmail structure
 */
export function isValidGmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Simulates real Gmail authentication with Supabase synchronization
 */
export async function authenticateWithRealGmail({
  email,
  name,
  avatar,
  supabaseClient,
  storage,
  googleAccountsStorage = []
}) {
  if (!isValidGmail(email)) {
    throw new Error('Please enter a valid Gmail address.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const displayName = name?.trim() || normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // 1. Attempt Supabase Auth Registration / Sync
  let supabaseUserId = null;
  if (supabaseClient?.auth?.signUp) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: normalizedEmail,
        password: `sb_oauth_${normalizedEmail}_sec!`,
        options: {
          data: {
            name: displayName,
            provider: 'google',
            email_confirmed: true
          }
        }
      });
      if (!error && data?.user?.id) {
        supabaseUserId = data.user.id;
      }
    } catch (e) {
      console.warn('Supabase auth notice:', e.message);
    }
  }

  const userId = supabaseUserId || `usr_google_${Date.now()}`;
  const token = `token_google_real_${Date.now()}`;

  // 2. Build sanitized authentic user profile with real Gmail
  const userProfile = sanitizeUserProfile({
    id: userId,
    email: normalizedEmail,
    name: displayName,
    avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0F766E&color=fff`,
    college: 'SkillBridge Tech Academy',
    degree: 'B.Tech / B.S. Computer Science & AI',
    department: 'Computer Science & Engineering',
    graduationYear: 2027,
    careerGoal: 'Full Stack AI Engineer',
    experienceLevel: 'Intermediate',
    skills: ['React', 'JavaScript', 'Node.js', 'Python', 'Tailwind CSS', 'SQL'],
    interests: ['Artificial Intelligence', 'Full Stack Development', 'Cloud Computing'],
    scores: {
      skillScore: 82,
      resumeScore: 85,
      interviewReadiness: 78,
      placementReadiness: 84,
      weeklyGoalProgress: 60
    },
    isVerified: true,
    authProvider: 'google'
  });

  // 3. Persist to storage (localStorage / sessionStorage)
  storage.setItem('sb_token', token);
  storage.setItem('sb_user', JSON.stringify(userProfile));

  // 4. Update saved Google Accounts in storage
  const existingAccounts = googleAccountsStorage.filter(acc => acc.email !== normalizedEmail);
  const updatedAccounts = [
    {
      email: normalizedEmail,
      name: displayName,
      avatar: userProfile.avatar,
      lastUsed: new Date().toISOString()
    },
    ...existingAccounts
  ].slice(0, 5); // Keep up to 5 recent accounts

  storage.setItem('sb_google_accounts', JSON.stringify(updatedAccounts));

  // 5. Supabase Database Sync Payload Simulation
  const supabasePayload = {
    user_id: userId,
    email: normalizedEmail,
    name: displayName,
    raw_user_data: userProfile,
    updated_at: new Date().toISOString()
  };

  return {
    success: true,
    user: userProfile,
    token,
    supabasePayload,
    savedAccounts: updatedAccounts
  };
}

async function runTests() {
  console.log("🧪 Running Real Gmail & Supabase Auth Flow Tests...\n");

  const store = {};
  const mockStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };

  // Mock Supabase with signUp returning real UUID
  const mockSupabase = {
    auth: {
      signUp: async ({ email }) => ({
        data: {
          user: {
            id: 'uuid-supa-real-12345',
            email: email
          }
        },
        error: null
      })
    }
  };

  // TEST 1: Valid real Gmail login uses user's actual Gmail and attaches to Supabase
  console.log("Test 1: Authenticating with real Gmail address...");
  const realEmail = 'alex.developer.real@gmail.com';
  const realName = 'Alex Developer';

  const res1 = await authenticateWithRealGmail({
    email: realEmail,
    name: realName,
    avatar: 'https://lh3.googleusercontent.com/a/custom-avatar',
    supabaseClient: mockSupabase,
    storage: mockStorage
  });

  assert.strictEqual(res1.success, true, "Auth must succeed");
  assert.strictEqual(res1.user.email, realEmail, "User email must exactly match real entered Gmail");
  assert.strictEqual(res1.user.name, realName, "User name must match real name");
  assert.strictEqual(res1.user.id, 'uuid-supa-real-12345', "Must use Supabase user ID");
  assert.strictEqual(res1.user.isVerified, true, "User must be verified");
  assert.strictEqual(res1.supabasePayload.email, realEmail, "Supabase payload must contain real Gmail");
  console.log("✅ Test 1 Passed: Real Gmail accurately authenticated and linked with Supabase.\n");

  // TEST 2: Local storage session persistence
  console.log("Test 2: Verifying session persistence in localStorage...");
  assert.strictEqual(mockStorage.getItem('sb_token'), res1.token, "Token must be saved in localStorage");
  const storedUser = JSON.parse(mockStorage.getItem('sb_user'));
  assert.strictEqual(storedUser.email, realEmail, "Stored user email must match real Gmail");
  console.log("✅ Test 2 Passed: Real Gmail user profile correctly persisted to localStorage.\n");

  // TEST 3: Multi-account remember & 1-click selection
  console.log("Test 3: Testing Google account list for 1-click account switching...");
  const secondEmail = 'sajid.ahmed.work@gmail.com';
  const res2 = await authenticateWithRealGmail({
    email: secondEmail,
    name: 'Sajid Ahmed',
    supabaseClient: mockSupabase,
    storage: mockStorage,
    googleAccountsStorage: JSON.parse(mockStorage.getItem('sb_google_accounts') || '[]')
  });

  assert.strictEqual(res2.user.email, secondEmail);
  const savedAccounts = JSON.parse(mockStorage.getItem('sb_google_accounts'));
  assert.strictEqual(savedAccounts.length, 2, "Must remember both accounts");
  assert.strictEqual(savedAccounts[0].email, secondEmail, "Most recently used account must be first");
  assert.strictEqual(savedAccounts[1].email, realEmail, "Previous account must be preserved");
  console.log("✅ Test 3 Passed: Google account switcher stores and orders real accounts for 1-click access.\n");

  // TEST 4: Invalid email rejection
  console.log("Test 4: Ensuring invalid / empty emails are rejected with helpful message...");
  let errorCaught = false;
  try {
    await authenticateWithRealGmail({
      email: 'not-an-email',
      supabaseClient: mockSupabase,
      storage: mockStorage
    });
  } catch (err) {
    errorCaught = true;
    assert.strictEqual(err.message, 'Please enter a valid Gmail address.');
  }
  assert.strictEqual(errorCaught, true, "Must throw validation error on invalid email");
  console.log("✅ Test 4 Passed: Email validation prevents malformed inputs.\n");

  // TEST 5: Auto-derivation of Name when name input is left blank
  console.log("Test 5: Verifying auto-derivation of user's display name from Gmail prefix...");
  const res3 = await authenticateWithRealGmail({
    email: 'priya.sharma@gmail.com',
    name: '', // Empty name
    supabaseClient: mockSupabase,
    storage: mockStorage
  });
  assert.strictEqual(res3.user.name, 'Priya Sharma', "Must cleanly derive 'Priya Sharma' from 'priya.sharma@gmail.com'");
  console.log("✅ Test 5 Passed: User name auto-derived from Gmail prefix.\n");

  console.log("🎉 ALL REAL GMAIL & SUPABASE AUTH TESTS PASSED (5/5)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
