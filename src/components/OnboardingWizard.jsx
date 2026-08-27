// agent-notes: { ctx: "Clean minimal SaaS student onboarding wizard with prefilled user state, async loading state, and safe primitive data binding", deps: ["lucide-react", "../context/AuthContext", "../services/api", "../services/supabaseData", "../utils/sanitizeProfile"], state: "active", last: "anti@2026-08-27" }
import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  Sparkles, 
  Code2, 
  Award,
  Check,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { loadUserDataFromSupabase } from '../services/supabaseData';
import { extractString, extractStringArray, sanitizeUserProfile } from '../utils/sanitizeProfile';

const CAREER_OPTIONS = [
  'Full Stack AI Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist & ML Engineer',
  'DevOps & Cloud Engineer',
  'Mobile App Developer',
  'Cybersecurity Analyst'
];

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'Tailwind CSS',
  'HTML/CSS', 'Git', 'SQL', 'MongoDB', 'Docker', 'AWS', 'Java', 'C++', 'GraphQL'
];

const INTEREST_SUGGESTIONS = [
  'Web Development', 'Artificial Intelligence', 'Cloud Computing',
  'Machine Learning', 'Open Source', 'System Architecture', 'UI/UX Design'
];

export default function OnboardingWizard({ onComplete }) {
  const { currentUser, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // Form State with primitive string defaults
  const [college, setCollege] = useState(() => extractString(currentUser?.college, 'Stanford University'));
  const [degree, setDegree] = useState(() => extractString(currentUser?.degree, 'B.Tech / B.S.'));
  const [department, setDepartment] = useState(() => extractString(currentUser?.department, 'Computer Science & Engineering'));
  const [graduationYear, setGraduationYear] = useState(() => {
    const raw = currentUser?.graduationYear;
    return typeof raw === 'number' ? raw : parseInt(extractString(raw, '2027'), 10) || 2027;
  });

  const [careerGoal, setCareerGoal] = useState(() => extractString(currentUser?.careerGoal || currentUser?.targetRole, 'Full Stack AI Engineer'));
  const [experienceLevel, setExperienceLevel] = useState(() => extractString(currentUser?.experienceLevel, 'Intermediate'));
  
  const [selectedSkills, setSelectedSkills] = useState(() => {
    const initial = extractStringArray(currentUser?.skills);
    return initial.length ? initial : ['React', 'JavaScript', 'HTML/CSS', 'Git'];
  });
  const [customSkillInput, setCustomSkillInput] = useState('');
  
  const [selectedInterests, setSelectedInterests] = useState(() => {
    const initial = extractStringArray(currentUser?.interests);
    return initial.length ? initial : ['Web Development', 'Artificial Intelligence'];
  });
  
  // AI Resume Parsing State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState(() => extractString(currentUser?.resumeURL?.replace('files/', ''), ''));
  const [aiExtractedSkills, setAiExtractedSkills] = useState([]);
  const [resumeScore, setResumeScore] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // Asynchronously hydrate form with persisted database/cache profile on mount or user change
  useEffect(() => {
    let isMounted = true;

    async function hydrateSavedProfile() {
      setLoadingInitialData(true);
      try {
        let savedData = null;
        if (currentUser?.id || currentUser?.email) {
          savedData = await loadUserDataFromSupabase(currentUser.id, currentUser.email);
        }

        // Fallback to local storage cache if available
        if (!savedData && currentUser?.id) {
          const cached = localStorage.getItem(`sb_user_data_${currentUser.id}`);
          if (cached) {
            try { savedData = JSON.parse(cached); } catch {}
          }
        }

        const source = savedData || currentUser;
        if (source && isMounted) {
          const sanitized = sanitizeUserProfile(source);

          if (sanitized.college) setCollege(sanitized.college);
          if (sanitized.degree) setDegree(sanitized.degree);
          if (sanitized.department) setDepartment(sanitized.department);
          if (sanitized.graduationYear) setGraduationYear(sanitized.graduationYear);
          if (sanitized.careerGoal) setCareerGoal(sanitized.careerGoal);
          if (sanitized.experienceLevel) setExperienceLevel(sanitized.experienceLevel);
          if (sanitized.skills && sanitized.skills.length) setSelectedSkills(sanitized.skills);
          if (sanitized.interests && sanitized.interests.length) setSelectedInterests(sanitized.interests);
          if (sanitized.resumeURL) setResumeFileName(extractString(sanitized.resumeURL.replace('files/', '')));
        }
      } catch (err) {
        console.warn('Profile hydration notice:', err);
      } finally {
        if (isMounted) {
          setLoadingInitialData(false);
        }
      }
    }

    hydrateSavedProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, currentUser?.email]);

  const toggleSkill = (skill) => {
    const cleanSkill = extractString(skill);
    if (!cleanSkill) return;
    if (selectedSkills.includes(cleanSkill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== cleanSkill));
    } else {
      setSelectedSkills([...selectedSkills, cleanSkill]);
    }
  };

  const addCustomSkill = () => {
    const clean = extractString(customSkillInput);
    if (clean && !selectedSkills.includes(clean)) {
      setSelectedSkills([...selectedSkills, clean]);
      setCustomSkillInput('');
    }
  };

  const toggleInterest = (interest) => {
    const cleanInterest = extractString(interest);
    if (!cleanInterest) return;
    if (selectedInterests.includes(cleanInterest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== cleanInterest));
    } else {
      setSelectedInterests([...selectedInterests, cleanInterest]);
    }
  };

  const handleResumeSimulatedUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setResumeFileName(file.name);
    setUploadingResume(true);
    
    try {
      const res = await api.analyzeResume({ resumeText: 'Mock Resume Text', targetRole: careerGoal });
      const extracted = extractStringArray(res.extractedSkills);
      setAiExtractedSkills(extracted);
      setResumeScore(typeof res.score === 'number' ? res.score : 85);
      
      const merged = Array.from(new Set([...selectedSkills, ...extracted]));
      setSelectedSkills(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setSubmitting(true);
    try {
      const profileData = {
        college: extractString(college, 'Stanford University'),
        degree: extractString(degree, 'B.Tech / B.S.'),
        department: extractString(department, 'Computer Science & Engineering'),
        graduationYear: parseInt(graduationYear, 10) || 2027,
        careerGoal: extractString(careerGoal, 'Full Stack AI Engineer'),
        experienceLevel: extractString(experienceLevel, 'Intermediate'),
        skills: extractStringArray(selectedSkills),
        interests: extractStringArray(selectedInterests),
        resumeURL: resumeFileName ? `files/${resumeFileName}` : 'uploaded_resume.pdf'
      };

      await completeOnboarding(profileData);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Finish onboarding error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitialData) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-3 animate-fade-in text-slate-900">
        <div className="w-9 h-9 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900">Loading Academic & Profile Details...</h3>
        <p className="text-xs text-slate-500">Retrieving your saved progress from database</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 text-slate-900">
      {/* Top Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Onboarding Setup</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome to SkillBridge AI, <span className="text-indigo-600">{extractString(currentUser?.name?.split(' ')[0], 'Student')}</span>!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Let's customize your personalized learning roadmap and placement readiness dashboard.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {[
          { num: 1, label: 'Academic Info', icon: GraduationCap },
          { num: 2, label: 'Career Goal', icon: Target },
          { num: 3, label: 'Skills & Domain', icon: Code2 },
          { num: 4, label: 'AI Resume & Review', icon: Sparkles }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <button 
              key={s.num}
              type="button"
              onClick={() => isDone && setStep(s.num)}
              className={`p-3 rounded-xl border text-center transition-all ${
                isActive 
                  ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 font-semibold shadow-sm ring-1 ring-indigo-500/20' 
                  : isDone 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 cursor-pointer hover:bg-emerald-100/60' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium mb-1">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="truncate">{s.label}</span>
              </div>
              <div className="text-[11px] text-slate-500">Step {s.num} of 4</div>
            </button>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div className="saas-card p-6 sm:p-8 space-y-6">

        {/* STEP 1: ACADEMIC INFO */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Academic Details</h3>
                <p className="text-xs text-slate-500">Where are you pursuing your education?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">College / University Name</label>
                <input 
                  type="text"
                  value={extractString(college)}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Stanford University or IIT Delhi"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Degree Program</label>
                <input 
                  type="text"
                  value={extractString(degree)}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech / B.S. in Computer Science"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Department / Stream</label>
                <input 
                  type="text"
                  value={extractString(department)}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Expected Graduation Year</label>
                <select 
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(parseInt(e.target.value, 10))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CAREER GOAL & EXPERIENCE */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Target Career & Experience</h3>
                <p className="text-xs text-slate-500">Which job role are you targeting for placement?</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">Preferred Career Path</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CAREER_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setCareerGoal(role)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between text-xs font-medium transition-colors ${
                      careerGoal === role 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{role}</span>
                    {careerGoal === role && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">Current Experience Level</label>
              <div className="grid grid-cols-3 gap-2.5">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-colors ${
                      experienceLevel === lvl 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS & INTERESTS */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Skills & Learning Interests</h3>
                <p className="text-xs text-slate-500">Select what you already know and what interests you.</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-medium text-slate-700">Your Current Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_SUGGESTIONS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {skill}
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom skill adder */}
              <div className="flex gap-2 pt-1">
                <input 
                  type="text"
                  placeholder="Add custom skill (e.g. Next.js, Docker)"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="saas-btn-secondary py-1.5 px-3.5 text-xs font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-medium text-slate-700">Domain Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_SUGGESTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {interest}
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AI RESUME & FINAL REVIEW */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">AI Resume Extraction & Final Review</h3>
                <p className="text-xs text-slate-500">Upload your resume for skill gap analysis and profile calibration.</p>
              </div>
            </div>

            {/* Resume upload dropzone */}
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-600 bg-slate-50/50 text-center relative transition-colors">
              <input 
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeSimulatedUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900">
                {uploadingResume ? 'Extracting Skills from Resume...' : resumeFileName ? `Uploaded: ${resumeFileName}` : 'Drag & Drop your Resume PDF or click to browse'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">PDF, DOC, DOCX up to 10MB</p>
            </div>

            {/* AI Extraction Score Preview */}
            {resumeScore && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-semibold text-slate-900 block">AI Resume Score: {resumeScore}/100</span>
                    <span className="text-[11px] text-emerald-800">Extracted {aiExtractedSkills.length} core technical competencies</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {aiExtractedSkills.slice(0, 4).map(s => (
                    <span key={s} className="saas-badge saas-badge-success text-[9px]">{extractString(s)}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Review Box */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Profile Summary</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div><strong className="text-slate-900">Institution:</strong> {extractString(college)}</div>
                <div><strong className="text-slate-900">Program:</strong> {extractString(degree)} ({graduationYear})</div>
                <div><strong className="text-slate-900">Career Goal:</strong> {extractString(careerGoal)}</div>
                <div><strong className="text-slate-900">Experience:</strong> {extractString(experienceLevel)}</div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <strong className="text-slate-900 block mb-1">Selected Skills ({selectedSkills.length}):</strong>
                <div className="flex flex-wrap gap-1">
                  {selectedSkills.map(s => (
                    <span key={s} className="saas-badge text-[10px]">{extractString(s)}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="saas-btn-secondary py-2 px-4 text-xs font-medium gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="saas-btn-primary py-2 px-4 text-xs font-medium gap-1.5"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinishOnboarding}
              className="saas-btn-primary py-2 px-5 text-xs font-medium gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Generating Dashboard...' : 'Complete Profile & Launch Dashboard'}
              {!submitting && <Sparkles className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
