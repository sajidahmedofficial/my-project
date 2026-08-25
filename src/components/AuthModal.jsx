// agent-notes: { ctx: "Glassmorphism Login & Registration Modal with OAuth, 2FA, Remember Me & Validation", deps: ["lucide-react", "../context/AuthContext", "../services/api"], state: "active", last: "anti@2026-07-30" }
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
  KeyRound, 
  Sparkles,
  Github,
  Chrome,
  Briefcase,
  Linkedin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onStartOnboarding }) {
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
  const [pendingUserId, setPendingUserId] = useState(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetCompleted, setResetCompleted] = useState(false);

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
        setSuccessMsg('Logged in successfully!');
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
      await socialLogin(provider);
      setSuccessMsg(`Authenticated via ${provider.toUpperCase()}!`);
      setTimeout(() => {
        onClose();
      }, 600);
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
      setSuccessMsg('2FA verified successfully!');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-accent-purple/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-accent-pink/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Glassmorphic Container Card */}
      <div className="relative w-full max-w-md glass border border-card-border rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-950/40 text-gray-200 overflow-hidden z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-card-border mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-pink flex items-center justify-center text-white font-black shadow-lg shadow-accent-purple/30">
              SB
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide">SkillBridge AI</h2>
              <p className="text-[10px] text-gray-400 font-medium">Personalized Roadmap Platform</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        {activeTab !== 'forgot' && activeTab !== '2fa' && (
          <div className="grid grid-cols-2 p-1 bg-gray-900/80 rounded-2xl border border-gray-800 mb-6">
            <button
              onClick={() => { setActiveTab('login'); clearMessages(); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'login' ? 'bg-gradient-to-r from-accent-purple to-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); clearMessages(); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'register' ? 'bg-gradient-to-r from-accent-purple to-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>
        )}

        {/* Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* --- LOGIN TAB --- */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => { setActiveTab('forgot'); clearMessages(); }}
                  className="text-[11px] font-semibold text-accent-purple hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-200">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-700 text-accent-purple focus:ring-accent-purple bg-gray-900"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01]"
            >
              {loading ? 'Signing in...' : 'Sign In to SkillBridge'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                <span className="bg-bg-dark px-3">Or continue with</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 flex items-center justify-center hover:bg-gray-800 text-gray-300 transition-all group"
                title="Sign in with Google"
              >
                <Chrome className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 flex items-center justify-center hover:bg-gray-800 text-gray-300 transition-all group"
                title="Sign in with GitHub"
              >
                <Github className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('microsoft')}
                className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 flex items-center justify-center hover:bg-gray-800 text-gray-300 transition-all group"
                title="Sign in with Microsoft"
              >
                <Briefcase className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('linkedin')}
                className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 flex items-center justify-center hover:bg-gray-800 text-gray-300 transition-all group"
                title="Sign in with LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {/* --- REGISTER TAB --- */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  required
                  placeholder="Aarav Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Confirm Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account & Continue'}
              {!loading && <Sparkles className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD --- */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center mb-2">
              <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center mx-auto mb-2 text-accent-purple">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Reset Password</h3>
              <p className="text-[11px] text-gray-400">Enter your registered student email address to receive password reset instructions.</p>
            </div>

            {!forgotSent ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input 
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-purple-600 text-white font-bold text-xs"
                >
                  {loading ? 'Generating Instructions...' : 'Request Password Reset'}
                </button>
              </>
            ) : !resetCompleted ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300">
                  Reset token generated for <strong>{forgotEmail}</strong>. Enter your token and new password below:
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Reset Token</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter security token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">New Password</label>
                  <input 
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResetSubmit}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md"
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-xs text-emerald-400">
                Password updated successfully! Returning to sign in...
              </div>
            )}

            <button
              type="button"
              onClick={() => { setActiveTab('login'); clearMessages(); }}
              className="w-full text-xs text-gray-400 hover:text-white font-medium text-center block pt-2"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* --- 2FA VERIFICATION STEP --- */}
        {activeTab === '2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent-pink/20 border border-accent-pink/30 flex items-center justify-center mx-auto mb-2 text-accent-pink">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Two-Factor Authentication</h3>
            <p className="text-[11px] text-gray-400">Enter the 6-digit code from your authenticator app or email notification.</p>

            <input 
              type="text"
              maxLength={6}
              placeholder="123456"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-gray-900/80 border border-accent-purple/50 rounded-xl py-3 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-xs shadow-md"
            >
              {loading ? 'Verifying...' : 'Verify Code & Access Dashboard'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
