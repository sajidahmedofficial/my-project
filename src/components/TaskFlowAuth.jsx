// agent-notes: { ctx: "Clean minimal SaaS Task Flow guided login & sign up modal with step-by-step progress & Supabase auth", deps: ["lucide-react", "../context/AuthContext", "../services/supabase"], state: "active", last: "anti@2026-08-27" }
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
      if (!formData.college || !formData.careerGoal) {
        setErrorMsg('Please provide your university/college and target career role.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(prev => Math.min(totalSteps, prev + 1));
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep < totalSteps) {
        handleNextStep();
      } else {
        handleFinalExecution();
      }
    }
  };

  const handleFinalExecution = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password, formData.rememberMe);
        setSuccessMsg('Authentication successful! Initializing portal...');
        setTimeout(() => {
          onClose();
          if (onComplete) onComplete('login');
        }, 700);
      } else {
        await register(
          formData.name,
          formData.email,
          formData.password,
          {
            college: formData.college,
            degree: formData.degree,
            careerGoal: formData.careerGoal,
            experienceLevel: formData.experienceLevel
          }
        );
        setSuccessMsg('Student account created successfully!');
        setTimeout(() => {
          onClose();
          if (onComplete) onComplete('signup');
        }, 700);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setErrorMsg('');
    setLoading(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-modal z-10 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              SB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900">SkillBridge Task Flow</h2>
                <span className="saas-badge saas-badge-success text-[10px]">
                  <Database className="w-3 h-3" /> Supabase
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Interactive Authentication Flow</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Quick Toggle Pills */}
        <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" /> Student Sign Up
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> User Sign In
          </button>
        </div>

        {/* Task Step Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-indigo-600">STEP {currentStep} OF {totalSteps}</span>
            <span className="uppercase text-[11px] font-medium">
              {currentStep === 1 && 'Choose Action'}
              {currentStep === 2 && (mode === 'signup' ? 'Account Credentials' : 'Sign In Credentials')}
              {currentStep === 3 && (mode === 'signup' ? 'Academic Profile' : 'Summary & Launch')}
              {currentStep === 4 && 'Summary & Launch'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error / Success Notifications */}
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

        {/* ==================== STEP 1: TASK SELECTION ==================== */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-0.5">
              <h3 className="text-sm font-semibold text-slate-900">Select Authentication Task</h3>
              <p className="text-xs text-slate-500">Choose how to access your SkillBridge account.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setMode('signup'); setCurrentStep(2); }}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  mode === 'signup' 
                    ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900 mb-0.5">New Student Sign Up</h4>
                <p className="text-[11px] text-slate-500">Create profile, configure goals, & generate roadmap.</p>
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setCurrentStep(2); }}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  mode === 'login' 
                    ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-xs text-slate-900 mb-0.5">Existing User Sign In</h4>
                <p className="text-[11px] text-slate-500">Sign in with email, demo account, or OAuth.</p>
              </button>
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                <span className="bg-white px-2">Instant OAuth</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors"
                title="Google Login"
              >
                <Chrome className="w-4 h-4 text-red-500" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors"
                title="GitHub Login"
              >
                <Github className="w-4 h-4 text-slate-800" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('microsoft')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors"
                title="Microsoft Login"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('linkedin')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors"
                title="LinkedIn Login"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: CREDENTIALS TASK ==================== */}
        {currentStep === 2 && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {mode === 'signup' ? 'Step 2: Account Credentials' : 'Step 2: Sign In Credentials'}
                </h3>
                <p className="text-xs text-slate-500">Secure authentication with Supabase</p>
              </div>
              
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="saas-btn-secondary py-1 px-2.5 text-[11px] font-medium gap-1"
                >
                  <KeyRound className="w-3 h-3 text-indigo-600" /> Use Demo Account
                </button>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Student Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onKeyDown={handleKeyDown}
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
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {mode === 'signup' && formData.password && (
                <div className="pt-1 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Password Strength</span>
                    <span className={passStrength > 60 ? 'text-emerald-700 font-medium' : passStrength > 30 ? 'text-amber-700 font-medium' : 'text-rose-700 font-medium'}>
                      {passStrength > 60 ? 'Strong' : passStrength > 30 ? 'Medium' : 'Weak (min 6 characters)'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passStrength > 60 ? 'bg-emerald-600' : passStrength > 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${passStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs py-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                  <input 
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-[11px] text-indigo-600 hover:underline font-medium"
                >
                  Create account?
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 3: ACADEMIC PROFILE TASK (SIGNUP) ==================== */}
        {currentStep === 3 && mode === 'signup' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="text-center space-y-0.5 mb-1">
              <h3 className="text-sm font-semibold text-slate-900">Step 3: Academic Profile & Goals</h3>
              <p className="text-xs text-slate-500">Configures your personalized recommendations</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">University / College</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  required
                  placeholder="Stanford University"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Degree Program</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  required
                  placeholder="B.Tech Computer Science"
                  value={formData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Target Role</label>
              <div className="relative">
                <Target className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  required
                  placeholder="Full Stack AI Engineer"
                  value={formData.careerGoal}
                  onChange={(e) => handleInputChange('careerGoal', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUMMARY & LAUNCH (LAST STEP) ==================== */}
        {((mode === 'signup' && currentStep === 4) || (mode === 'login' && currentStep === 3)) && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Task Flow Verification</h3>
              <p className="text-xs text-slate-500">Ready to authenticate and access dashboard.</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">Action:</span>
                <span className="font-semibold text-slate-900">{mode === 'signup' ? 'New Student Registration' : 'Account Sign In'}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">{formData.email || 'student@university.edu'}</span>
              </div>
              {mode === 'signup' && (
                <>
                  <div className="flex justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500">College:</span>
                    <span className="font-semibold text-slate-900">{formData.college}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Role:</span>
                    <span className="font-semibold text-slate-900">{formData.careerGoal}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="saas-btn-secondary py-1.5 px-3 text-xs gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="saas-btn-primary py-1.5 px-4 text-xs font-medium gap-1"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinalExecution}
              className="saas-btn-primary py-1.5 px-4 text-xs font-medium gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : mode === 'signup' ? 'Complete & Sign Up' : 'Authenticate & Launch'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
