// agent-notes: { ctx: "Task Flow guided login & sign up page with step progress and Supabase auth", deps: ["lucide-react", "../context/AuthContext", "../services/supabase"], state: "active", last: "anti@2026-07-31" }
import React, { useState } from 'react';
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
  KeyRound,
  Database
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

  if (!isOpen) return null;

  const totalSteps = mode === 'signup' ? 4 : 3;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg('');
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
      // Task 1: Action Choice - valid by default
      return true;
    }

    if (step === 2) {
      // Task 2: Credentials Input
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
      // Task 3: Academic Profile
      if (!formData.college || !formData.careerGoal) {
        setErrorMsg('Please provide your university/college and target career goal.');
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
        await register(formData.name, formData.email, formData.password);
        setSuccessMsg('Account created with Supabase Auth! Preparing your student workspace...');
      } else {
        await login(formData.email, formData.password, formData.rememberMe);
        setSuccessMsg('Successfully authenticated! Directing to dashboard...');
      }

      setTimeout(() => {
        onClose();
        if (onComplete) onComplete();
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication task failed. Please check your inputs.');
    } finally {
      setLoading(false);
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
        if (onComplete) onComplete();
      }, 600);
    } catch (err) {
      setErrorMsg(`Failed to connect with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-pink/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Main Task Flow Modal */}
      <div className="relative w-full max-w-xl glass border border-card-border rounded-3xl p-6 md:p-8 shadow-2xl text-gray-200 overflow-hidden z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-card-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-pink flex items-center justify-center text-white font-black shadow-lg shadow-accent-purple/40">
              SB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">SkillBridge Task Flow Auth</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Supabase Live
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Step-by-Step Guided Onboarding & Authentication</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Task Step Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
            <span>TASK {currentStep} OF {totalSteps}</span>
            <span className="text-accent-purple uppercase tracking-wider">
              {currentStep === 1 && 'Choose Action'}
              {currentStep === 2 && 'Security Credentials'}
              {currentStep === 3 && (mode === 'signup' ? 'Academic Profile' : 'Verification')}
              {currentStep === 4 && 'Complete Onboarding'}
            </span>
          </div>
          <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
            <div 
              className="bg-gradient-to-r from-accent-purple to-accent-pink h-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ==================== STEP 1: TASK SELECTION ==================== */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-white">Select Your Authentication Task</h3>
              <p className="text-xs text-gray-400">Choose how you wish to access your AI Career & Placement Portal.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setMode('signup'); handleNextStep(); }}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${mode === 'signup' ? 'bg-accent-purple/15 border-accent-purple text-white shadow-lg shadow-purple-950/40' : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-accent-purple mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white mb-1">New Student Sign Up</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">Create a new account, configure academic goals, & generate your roadmap.</p>
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); handleNextStep(); }}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${mode === 'login' ? 'bg-accent-purple/15 border-accent-purple text-white shadow-lg shadow-purple-950/40' : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-accent-pink/20 border border-accent-pink/30 flex items-center justify-center text-accent-pink mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white mb-1">Existing User Sign In</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">Sign in with email or OAuth to resume your active placement prep.</p>
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                <span className="bg-bg-dark px-3">Instant OAuth Login</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 flex items-center justify-center hover:bg-gray-800 transition-all group"
                title="Google Login"
              >
                <Chrome className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('github')}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 flex items-center justify-center hover:bg-gray-800 transition-all group"
                title="GitHub Login"
              >
                <Github className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('microsoft')}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 flex items-center justify-center hover:bg-gray-800 transition-all group"
                title="Microsoft Login"
              >
                <Briefcase className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('linkedin')}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 flex items-center justify-center hover:bg-gray-800 transition-all group"
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
            <div className="text-center space-y-1 mb-2">
              <h3 className="text-base font-extrabold text-white">
                {mode === 'signup' ? 'Task 2: Enter Account Credentials' : 'Task 2: Sign In Credentials'}
              </h3>
              <p className="text-xs text-gray-400">Connected with Supabase Authentication backend.</p>
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
                    className="w-full bg-gray-900/70 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
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
                  className="w-full bg-gray-900/70 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
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
                  className="w-full bg-gray-900/70 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
                />
              </div>

              {/* Password Strength Meter for Sign Up */}
              {mode === 'signup' && formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">Password Strength</span>
                    <span className={passStrength > 60 ? 'text-emerald-400' : passStrength > 30 ? 'text-amber-400' : 'text-red-400'}>
                      {passStrength > 60 ? 'Strong' : passStrength > 30 ? 'Medium' : 'Weak'}
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
                    className="w-full bg-gray-900/70 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
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
                    className="rounded border-gray-700 text-accent-purple focus:ring-accent-purple bg-gray-900"
                  />
                  <span>Remember active session (30 Days)</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 3: ACADEMIC PROFILE TASK (SIGNUP) ==================== */}
        {currentStep === 3 && mode === 'signup' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1 mb-2">
              <h3 className="text-base font-extrabold text-white">Task 3: Academic Profile & Placement Goal</h3>
              <p className="text-xs text-gray-400">Configures your initial AI recommendation engine preferences.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">University / College</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  required
                  placeholder="Stanford University / IIT Tech"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  className="w-full bg-gray-900/70 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
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
                  className="w-full bg-gray-900/70 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
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
                  className="w-full bg-gray-900/70 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple"
                >
                  <option value="Full Stack AI Engineer">Full Stack AI Engineer</option>
                  <option value="Frontend Developer (React)">Frontend Developer (React)</option>
                  <option value="Backend Software Engineer">Backend Software Engineer</option>
                  <option value="Data Scientist & ML Analyst">Data Scientist & ML Analyst</option>
                  <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 3/4: VERIFICATION & SUMMARY ==================== */}
        {((currentStep === 3 && mode === 'login') || (currentStep === 4 && mode === 'signup')) && (
          <div className="space-y-4 text-center animate-fade-in py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Final Task: Authentication Ready</h3>
              <p className="text-xs text-gray-400 mt-1">Review your login summary before completing session setup.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400 font-semibold">Mode</span>
                <span className="text-white font-bold uppercase">{mode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400 font-semibold">Email</span>
                <span className="text-white font-bold">{formData.email}</span>
              </div>
              {mode === 'signup' && (
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400 font-semibold">Career Goal</span>
                  <span className="text-accent-purple font-bold">{formData.careerGoal}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-gray-400 font-semibold">Backend Provider</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Database className="w-3 h-3" /> Supabase Auth
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation & Action Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-card-border mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold text-xs flex items-center gap-2 transition-all"
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
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01]"
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
