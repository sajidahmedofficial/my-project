// agent-notes: { ctx: "React Auth Context for user session with Supabase Auth & authentic backend validation", deps: ["../services/api", "../services/supabase", "../services/supabaseData", "../utils/mockData"], state: "active", last: "anti@2026-08-25" }
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import { saveUserDataToSupabase, loadUserDataFromSupabase } from '../services/supabaseData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sb_user') || sessionStorage.getItem('sb_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token') || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('sb_token') || sessionStorage.getItem('sb_token'));
  });

  const [isOnboarded, setIsOnboarded] = useState(() => {
    const saved = localStorage.getItem('sb_user') || sessionStorage.getItem('sb_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return Boolean(u?.college && u?.careerGoal);
      } catch {}
    }
    return false;
  });

  useEffect(() => {
    if (currentUser && isAuthenticated) {
      const storage = localStorage.getItem('sb_remember') === 'true' ? localStorage : sessionStorage;
      storage.setItem('sb_user', JSON.stringify(currentUser));
      // Asynchronously sync user data changes to Supabase
      saveUserDataToSupabase(currentUser);
    }
  }, [currentUser, isAuthenticated]);

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
    if (isAuthenticated) {
      restoreFromSupabase();
    }
  }, [isAuthenticated]);

  const login = async (email, password, rememberMe = false) => {
    let supabaseSession = null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.session) {
        supabaseSession = data;
      }
    } catch (e) {
      console.warn('Supabase auth login check:', e.message);
    }

    // Authoritative backend login verification (validates password hash)
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

  const register = async (name, email, password, college = '', careerGoal = '') => {
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
      console.warn('Supabase auth registration notice:', e.message);
    }

    const res = await api.register({ name, email, password, college, careerGoal });
    const storage = sessionStorage;
    const activeToken = res.token;
    storage.setItem('sb_token', activeToken);
    setToken(activeToken);

    const newUser = {
      id: supabaseUser?.id || res.user.id || `usr_${Date.now()}`,
      name: name,
      email: email,
      college: college || '',
      degree: '',
      department: '',
      graduationYear: 2027,
      careerGoal: careerGoal || '',
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
    setIsOnboarded(Boolean(college && careerGoal));

    await saveUserDataToSupabase(newUser);

    return { ...res, supabaseUser };
  };

  const socialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
      if (error) {
        throw new Error(`Social authentication failed: ${error.message}`);
      }
    } catch (e) {
      console.error(`Supabase OAuth for ${provider}:`, e.message);
      throw new Error(`Social sign-in with ${provider} failed (${e.message}). Please use Email/Password sign-in or register.`);
    }
  };

  const completeOnboarding = async (onboardingData) => {
    const updated = {
      ...currentUser,
      ...onboardingData,
      scores: currentUser?.scores || {
        skillScore: 78,
        resumeScore: 82,
        interviewReadiness: 74,
        placementReadiness: 79,
        weeklyGoalProgress: 45
      }
    };
    if (currentUser?.id) {
      await api.completeOnboarding({ userId: currentUser.id, ...onboardingData }).catch(() => {});
    }
    setCurrentUser(updated);
    setIsOnboarded(true);
    await saveUserDataToSupabase(updated);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout notice:', e.message);
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
