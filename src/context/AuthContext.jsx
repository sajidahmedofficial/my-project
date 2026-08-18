// agent-notes: { ctx: "React Auth Context for user session with Supabase Auth & Supabase Data sync", deps: ["../services/api", "../services/supabase", "../services/supabaseData", "../utils/mockData"], state: "active", last: "anti@2026-08-18" }
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import { saveUserDataToSupabase, loadUserDataFromSupabase } from '../services/supabaseData';
import { RESUME_PRESETS } from '../utils/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sb_user') || sessionStorage.getItem('sb_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return RESUME_PRESETS[0];
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token') || 'sb_demo_token_123';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [isOnboarded, setIsOnboarded] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const storage = localStorage.getItem('sb_remember') === 'true' ? localStorage : sessionStorage;
      storage.setItem('sb_user', JSON.stringify(currentUser));
      // Asynchronously sync user data changes to Supabase
      saveUserDataToSupabase(currentUser);
    }
  }, [currentUser]);

  // Sync latest user progress from Supabase on initial auth mount
  useEffect(() => {
    async function restoreFromSupabase() {
      if (currentUser?.id || currentUser?.email) {
        const remoteData = await loadUserDataFromSupabase(currentUser.id, currentUser.email);
        if (remoteData) {
          setCurrentUser(prev => ({
            ...prev,
            ...remoteData
          }));
        }
      }
    }
    restoreFromSupabase();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    let supabaseSession = null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.session) {
        supabaseSession = data;
      }
    } catch (e) {
      console.warn('Supabase auth login attempt:', e.message);
    }

    const res = await api.login({ email, password, rememberMe });
    if (res.requires2FA) {
      return res;
    }
    const storage = rememberMe ? localStorage : sessionStorage;
    if (rememberMe) localStorage.setItem('sb_remember', 'true');
    
    const activeToken = supabaseSession?.session?.access_token || res.token;
    storage.setItem('sb_token', activeToken);
    setToken(activeToken);

    const userId = supabaseSession?.user?.id || res.user.id || `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Attempt to load previous stored progress from Supabase for this User ID / Email
    const savedSupabaseData = await loadUserDataFromSupabase(userId, email);

    const fullUser = {
      ...RESUME_PRESETS[0],
      ...res.user,
      ...(savedSupabaseData || {}),
      id: userId,
      email: supabaseSession?.user?.email || res.user.email || email,
      name: savedSupabaseData?.name || res.user.name || email.split('@')[0]
    };

    setCurrentUser(fullUser);
    setIsAuthenticated(true);
    setIsOnboarded(Boolean(fullUser.college && fullUser.careerGoal));

    // Save synced user payload to Supabase
    await saveUserDataToSupabase(fullUser);

    return { ...res, token: activeToken };
  };

  const register = async (name, email, password) => {
    let supabaseUser = null;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (!error && data?.user) {
        supabaseUser = data.user;
      }
    } catch (e) {
      console.warn('Supabase auth registration attempt:', e.message);
    }

    const res = await api.register({ name, email, password });
    const storage = sessionStorage;
    const activeToken = res.token;
    storage.setItem('sb_token', activeToken);
    setToken(activeToken);

    const newUser = {
      id: supabaseUser?.id || res.user.id || `usr_${Date.now()}`,
      name: name,
      email: email,
      college: '',
      degree: '',
      department: '',
      graduationYear: 2027,
      careerGoal: '',
      experienceLevel: 'Beginner',
      skills: [],
      interests: [],
      scores: {
        skillScore: 60,
        resumeScore: 65,
        interviewReadiness: 55,
        placementReadiness: 60,
        weeklyGoalProgress: 20
      }
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsOnboarded(false);

    await saveUserDataToSupabase(newUser);

    return { ...res, supabaseUser };
  };

  const socialLogin = async (provider) => {
    const socialMockMap = {
      google: { name: 'Alex Rivera (Google)', email: 'alex.rivera.google@gmail.com' },
      github: { name: 'Sarah Chen (GitHub)', email: 'sarah.chen@github.io' },
      microsoft: { name: 'David Miller (Microsoft)', email: 'dmiller@outlook.com' },
      linkedin: { name: 'Priya Sharma (LinkedIn)', email: 'priya.sharma@linkedin.com' }
    };

    try {
      await supabase.auth.signInWithOAuth({ provider });
    } catch (e) {
      console.warn(`Supabase OAuth for ${provider}:`, e.message);
    }

    const res = await api.socialAuth(provider, socialMockMap[provider] || socialMockMap.google);
    localStorage.setItem('sb_token', res.token);
    setToken(res.token);

    const userEmail = res.user.email || socialMockMap[provider]?.email;
    const userId = res.user.id || `usr_${provider}_${Date.now()}`;

    const savedSupabaseData = await loadUserDataFromSupabase(userId, userEmail);

    const mergedUser = {
      ...RESUME_PRESETS[0],
      ...res.user,
      ...(savedSupabaseData || {})
    };

    setCurrentUser(mergedUser);
    setIsAuthenticated(true);
    setIsOnboarded(Boolean(mergedUser.college && mergedUser.careerGoal));

    await saveUserDataToSupabase(mergedUser);

    return res;
  };

  const completeOnboarding = async (onboardingData) => {
    const updated = {
      ...currentUser,
      ...onboardingData,
      scores: currentUser.scores || {
        skillScore: 78,
        resumeScore: 82,
        interviewReadiness: 74,
        placementReadiness: 79,
        weeklyGoalProgress: 45
      }
    };
    await api.completeOnboarding({ userId: currentUser.id, ...onboardingData });
    setCurrentUser(updated);
    setIsOnboarded(true);
    await saveUserDataToSupabase(updated);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout:', e.message);
    }
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    localStorage.removeItem('sb_remember');
    sessionStorage.removeItem('sb_token');
    sessionStorage.removeItem('sb_user');
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsOnboarded(false);
  };

  const updateProfile = (newProfile) => {
    const updated = typeof newProfile === 'function' ? newProfile(currentUser) : newProfile;
    setCurrentUser(updated);
    saveUserDataToSupabase(updated);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      isAuthenticated,
      isOnboarded,
      login,
      register,
      socialLogin,
      completeOnboarding,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

