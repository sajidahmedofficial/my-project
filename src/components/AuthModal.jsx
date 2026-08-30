// agent-notes: { ctx: "Clean minimal SaaS Login & Registration Modal with OAuth, 2FA & Validation", deps: ["lucide-react", "../context/AuthContext", "../services/api"], state: "active", last: "anti@2026-08-27" }
import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Github, 
  Chrome, 
  Briefcase, 
  Linkedin 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onStartOnboarding, onLoginSuccess }) {
  const { login, register, socialLogin } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register' | 'forgot' | '2fa'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // 2FA state
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [_pendingUserId, setPendingUserId] = useState(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [_resetCompleted, setResetCompleted] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword, rememberMe);
      if (res && res.requires2FA) {
        setPendingUserId(res.userId);
        setActiveTab('2fa');
        setSuccessMsg('2FA code requested. Please enter your 6-digit verification code.');
      } else {
        setSuccessMsg('Logged in successfully! Redirecting to Dashboard...');
        if (onLoginSuccess) onLoginSuccess();
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(regName, regEmail, regPassword);
      setSuccessMsg('Account created successfully! Redirecting to student onboarding...');
      setTimeout(() => {
        onClose();
        if (onStartOnboarding) onStartOnboarding();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    clearMessages();
    setLoading(true);
    try {
      const res = await socialLogin(provider);
      if (res?.url) {
        return;
      }
      setSuccessMsg(`Authenticated via ${provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : provider.toUpperCase()}! Redirecting to Dashboard...`);
      if (onLoginSuccess) onLoginSuccess();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || `Failed to authenticate with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    clearMessages();

    if (twoFactorCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit authentication code.');
      return;
    }

    setLoading(true);
    try {
      await api.verify2FA({ email: loginEmail, code: twoFactorCode });
      setSuccessMsg('2FA verified successfully! Redirecting to Dashboard...');
      if (onLoginSuccess) onLoginSuccess();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired 2FA verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!forgotEmail) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword({ email: forgotEmail });
      setForgotSent(true);
      if (res.resetToken) setResetToken(res.resetToken);
      setSuccessMsg(res.message || 'Reset token generated.');
    } catch (err) {
      setErrorMsg(err.message || 'No registered account found with this email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!resetToken || !newResetPassword) {
      setErrorMsg('Please enter the reset token and your new password.');
      return;
    }

    if (newResetPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({ email: forgotEmail, token: resetToken, newPassword: newResetPassword });
      setResetCompleted(true);
      setSuccessMsg(res.message || 'Password updated successfully!');
      setTimeout(() => {
        setActiveTab('login');
        setForgotSent(false);
        setResetCompleted(false);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-modal z-10 space-y-5">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              SB
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">SkillBridge AI</h2>
              <p className="text-[11px] text-slate-500">Placement & Career Guidance</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        {activeTab !== 'forgot' && activeTab !== '2fa' && (
          <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              onClick={() => { setActiveTab('login'); clearMessages(); }}
              className={`py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); clearMessages(); }}
              className={`py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Register
            </button>
          </div>
        )}

        {/* Messages */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* --- LOGIN TAB --- */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => { setActiveTab('forgot'); clearMessages(); }}
                  className="text-[11px] font-medium text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('demo@skillbridge.ai');
                  setLoginPassword('Demo@123456');
                  setSuccessMsg('Demo credentials filled! Click Sign In.');
                }}
                className="text-[11px] font-medium text-indigo-600 hover:underline"
              >
                Use Demo Login
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="saas-btn-primary w-full py-2 text-xs font-medium gap-1.5"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase text-slate-400 font-medium">
                <span className="bg-white px-2">Or continue with</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors text-xs font-medium text-slate-700"
              >
                <Chrome className="w-4 h-4 text-red-500" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors text-xs font-medium text-slate-700"
              >
                <Github className="w-4 h-4 text-slate-800" />
                <span>GitHub</span>
              </button>
            </div>
          </form>
        )}

        {/* --- REGISTER TAB --- */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="saas-btn-primary w-full py-2 text-xs font-medium gap-1.5"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD TAB --- */}
        {activeTab === 'forgot' && (
          <form onSubmit={forgotSent ? handleResetSubmit : handleForgotPassword} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {forgotSent && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Reset Token</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">New Password</label>
                  <input 
                    type="password"
                    required
                    placeholder="New password (min 6 chars)"
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); clearMessages(); }}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                Back to Sign In
              </button>

              <button
                type="submit"
                disabled={loading}
                className="saas-btn-primary py-1.5 px-4 text-xs font-medium"
              >
                {loading ? 'Processing...' : forgotSent ? 'Update Password' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}

        {/* --- 2FA TAB --- */}
        {activeTab === '2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">6-Digit 2FA Code</label>
              <input 
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-center text-sm font-mono text-slate-900 tracking-widest focus:outline-none focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="saas-btn-primary w-full py-2 text-xs font-medium"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
