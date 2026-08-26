// agent-notes: { ctx: "Task Flow guided login & sign up modal with step-by-step progress, quick demo fill, Supabase auth & resilient submission", deps: ["lucide-react", "../context/AuthContext", "../services/supabase"], state: "active", last: "anti@2026-08-26" }
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  Github,
  Chrome,
  Briefcase,
  Linkedin,
  GraduationCap,
  Target,
  Database,
  Zap,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TaskFlowAuth({ isOpen, onClose, initialMode = 'signup', onComplete }) {
  const { login, register, socialLogin } = useAuth();
  
  // Task flow mode: 'signup' | 'login'
  const [mode, setMode] = useState(initialMode);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Task Flow Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true,
    college: 'Stanford University',
    degree: 'B.Tech in Computer Science',
    careerGoal: 'Full Stack AI Engineer',
    experienceLevel: 'Intermediate'
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode and reset to initial step when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'signup');
      setCurrentStep(1);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const totalSteps = mode === 'signup' ? 4 : 3;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleQuickFillDemo = () => {
    setFormData(prev => ({
      ...prev,
      email: 'demo@skillbridge.ai',
      password: 'Demo@123456',
      name: 'Demo Student'
    }));
    setErrorMsg('');
    setSuccessMsg('Demo credentials filled! Click Next Step or Complete Task.');
  };

  // Calculate password strength (0-100)
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (pass.length >= 10) score += 20;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 10;
    return Math.min(100, score);
  };

  const passStrength = getPasswordStrength(formData.password);

  const validateStep = (step) => {
    setErrorMsg('');

    if (step === 1) {
      return true;
    }

    if (step === 2) {
      // Credentials validation
      if (!formData.email || !formData.email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return false;
      }
      if (!formData.password) {
        setErrorMsg('Password is required.');
        return false;
      }
      if (mode === 'signup') {
        if (!formData.name.trim()) {
          setErrorMsg('Full Name is required for registration.');
          return false;
        }
        if (formData.password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('Passwords do not match.');
          return false;
        }
      }
      return true;
    }

    if (step === 3 && mode === 'signup') {
      // Academic Profile validation
      if (!formData.college || !formData.careerGoal) {
        setErrorMsg('Please provide your university/college and target career role.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmitFinalTask();
      }
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitFinalTask = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.college,
          formData.careerGoal
        );
        setSuccessMsg('Account created successfully! Directing to your AI workspace...');
      } else {
        await login(formData.email, formData.password, formData.rememberMe);
        setSuccessMsg('Signed in successfully! Launching your dashboard...');
      }

      setTimeout(() => {
        onClose();
        if (onComplete) onComplete(mode);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNextStep();
    }
  };

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await socialLogin(provider);
      setSuccessMsg(`Authenticated via ${provider.toUpperCase()}!`);
      setTimeout(() => {
        onClose();
        if (onComplete) onComplete('login');
      }, 600);
    } catch {
      setErrorMsg(`Failed to connect with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setCurrentStep(1);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Main Task Flow Modal */}
      <div className="relative w-full max-w-xl bg-[#13182b]/95 border-2 border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-950/60 text-gray-200 overflow-hidden z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/40 border border-white/20">
              SB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">SkillBridge Task Flow</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" /> Supabase + AI
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80 font-medium">Guided Interactive Authentication</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Mode Quick Toggle Pills */}
        <div className="grid grid-cols-2 p-1 bg-gray-900/90 rounded-2xl border border-purple-500/20 mb-5">
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Student Sign Up
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> User Sign In
          </button>
        </div>

        {/* Task Step Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
            <span className="text-purple-300 font-extrabold">STEP {currentStep} OF {totalSteps}</span>
            <span className="text-pink-400 uppercase tracking-wider font-extrabold">
              {currentStep === 1 && 'Choose Action'}
              {currentStep === 2 && (mode === 'signup' ? 'Account Credentials' : 'Sign In Credentials')}
              {currentStep === 3 && (mode === 'signup' ? 'Academic Profile' : 'Summary & Launch')}
              {currentStep === 4 && 'Summary & Launch'}
            </span>
          </div>
          <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-purple-500/20 p-0.5">
            <div 
              className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-500/15 border-2 border-red-500/40 flex items-center gap-3 text-red-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center gap-3 text-emerald-300 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ==================== STEP 1: TASK SELECTION ==================== */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Select Your Authentication Task</h3>
              <p className="text-xs text-gray-300">Choose how you wish to access your AI Career & Placement Portal.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setMode('signup'); setCurrentStep(2); }}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                  mode === 'signup' 
                    ? 'bg-purple-900/30 border-purple-500 text-white shadow-lg shadow-purple-950/40' 
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-white mb-1">New Student Sign Up</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">Create a fresh profile, configure academic goals, & generate your roadmap.</p>
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setCurrentStep(2); }}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                  mode === 'login' 
                    ? 'bg-pink-900/30 border-pink-500 text-white shadow-lg shadow-pink-950/40' 
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-white mb-1">Existing User Sign In</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">Sign in with email, demo account, or OAuth to resume your placement prep.</p>
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-purple-300 font-black">
                <span className="bg-[#13182b] px-3">Instant OAuth Sign In</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-purple-500 flex items-center justify-center hover:bg-gray-800 transition-all group"
                title="Google Login"
              >
                <Chrome className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-purple-500 flex items-center justify-center hover:bg-gray-800 transition-all group"
                title="GitHub Login"
              >
                <Github className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('microsoft')}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-purple-500 flex items-center justify-center hover:bg-gray-800 transition-all group"
                title="Microsoft Login"
              >
                <Briefcase className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('linkedin')}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-purple-500 flex items-center justify-center hover:bg-gray-800 transition-all group"
                title="LinkedIn Login"
              >
                <Linkedin className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: CREDENTIALS TASK ==================== */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">
                  {mode === 'signup' ? 'Step 2: Account Credentials' : 'Step 2: Sign In Credentials'}
                </h3>
                <p className="text-xs text-purple-300/80">Secure authentication with Supabase & Node backend</p>
              </div>
              
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-900 border border-purple-500/40 text-[11px] font-bold text-purple-200 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5 text-yellow-400" /> Fill Demo Account
                </button>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Student Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
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
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Password Strength Meter for Sign Up */}
              {mode === 'signup' && formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Password Strength</span>
                    <span className={passStrength > 60 ? 'text-emerald-400' : passStrength > 30 ? 'text-amber-400' : 'text-red-400'}>
                      {passStrength > 60 ? 'Strong' : passStrength > 30 ? 'Medium' : 'Weak (min 6 characters)'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passStrength > 60 ? 'bg-emerald-400' : passStrength > 30 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${passStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input 
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-200">
                  <input 
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="rounded border-gray-700 text-purple-600 focus:ring-purple-500 bg-gray-900"
                  />
                  <span>Remember active session (30 Days)</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-bold hover:underline"
                >
                  Create account?
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 3: ACADEMIC PROFILE TASK (SIGNUP) ==================== */}
        {currentStep === 3 && mode === 'signup' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1 mb-2">
              <h3 className="text-base font-black text-white">Step 3: Academic Profile & Career Goal</h3>
              <p className="text-xs text-purple-300/80">Configures your personalized AI recommendation engine</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">University / College</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  required
                  placeholder="Stanford University / MIT Tech"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Degree & Major</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  required
                  placeholder="B.Tech in Computer Science"
                  value={formData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">Target Career Role</label>
              <div className="relative">
                <Target className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <select
                  value={formData.careerGoal}
                  onChange={(e) => handleInputChange('careerGoal', e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Full Stack AI Engineer">Full Stack AI Engineer</option>
                  <option value="Frontend Developer (React)">Frontend Developer (React)</option>
                  <option value="Backend Software Engineer">Backend Software Engineer</option>
                  <option value="Data Scientist & ML Analyst">Data Scientist & ML Analyst</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                  <option value="Mobile App Developer">Mobile App Developer</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 3/4: VERIFICATION & SUMMARY ==================== */}
        {((currentStep === 3 && mode === 'login') || (currentStep === 4 && mode === 'signup')) && (
          <div className="space-y-4 text-center animate-fade-in py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Final Step: Complete Authentication</h3>
              <p className="text-xs text-purple-300/80 mt-1">Confirm your details to launch your personalized AI Dashboard.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900/90 border-2 border-purple-500/20 text-left space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400 font-semibold">Mode</span>
                <span className="text-white font-black uppercase tracking-wider">{mode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400 font-semibold">Email</span>
                <span className="text-white font-bold truncate max-w-[200px]">{formData.email}</span>
              </div>
              {mode === 'signup' && (
                <>
                  <div className="flex justify-between py-1 border-b border-gray-800">
                    <span className="text-gray-400 font-semibold">Name</span>
                    <span className="text-white font-bold">{formData.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800">
                    <span className="text-gray-400 font-semibold">Career Goal</span>
                    <span className="text-purple-400 font-bold">{formData.careerGoal}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1">
                <span className="text-gray-400 font-semibold">Backend Engine</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Supabase + Local Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation & Action Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-purple-500/20 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-gray-900/80 border border-gray-700 hover:border-gray-600 text-gray-300 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            onClick={handleNextStep}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              'Authenticating...'
            ) : currentStep === totalSteps ? (
              <>Complete Task <CheckCircle2 className="w-4 h-4" /></>
            ) : (
              <>Next Step <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
