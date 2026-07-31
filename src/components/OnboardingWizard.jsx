// agent-notes: { ctx: "Multi-step student onboarding wizard for profile creation & AI skill extraction", deps: ["lucide-react", "../context/AuthContext", "../services/api"], state: "active", last: "anti@2026-07-30" }
import React, { useState } from 'react';
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

  // Form State
  const [college, setCollege] = useState(currentUser?.college || 'Stanford University');
  const [degree, setDegree] = useState(currentUser?.degree || 'B.Tech / B.S.');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState(currentUser?.graduationYear || 2027);

  const [careerGoal, setCareerGoal] = useState(currentUser?.careerGoal || 'Full Stack AI Engineer');
  const [experienceLevel, setExperienceLevel] = useState(currentUser?.experienceLevel || 'Intermediate');
  
  const [selectedSkills, setSelectedSkills] = useState(currentUser?.skills?.length ? currentUser.skills : ['React', 'JavaScript', 'HTML/CSS', 'Git']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  
  const [selectedInterests, setSelectedInterests] = useState(currentUser?.interests?.length ? currentUser.interests : ['Web Development', 'Artificial Intelligence']);
  
  // AI Resume Parsing State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [aiExtractedSkills, setAiExtractedSkills] = useState([]);
  const [resumeScore, setResumeScore] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleResumeSimulatedUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setResumeFileName(file.name);
    setUploadingResume(true);
    
    try {
      const res = await api.analyzeResume({ resumeText: 'Mock Resume Text', targetRole: careerGoal });
      setAiExtractedSkills(res.extractedSkills || []);
      setResumeScore(res.score || 85);
      
      // Auto merge extracted skills
      const merged = Array.from(new Set([...selectedSkills, ...(res.extractedSkills || [])]));
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
        college,
        degree,
        department,
        graduationYear: parseInt(graduationYear, 10),
        careerGoal,
        experienceLevel,
        skills: selectedSkills,
        interests: selectedInterests,
        resumeURL: resumeFileName ? `files/${resumeFileName}` : 'uploaded_resume.pdf'
      };

      await completeOnboarding(profileData);
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/15 border border-accent-purple/30 text-accent-purple text-xs font-bold mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Student Onboarding Setup</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Welcome to SkillBridge AI, <span className="gradient-text">{currentUser?.name?.split(' ')[0] || 'Student'}</span>!
        </h1>
        <p className="text-xs text-gray-400 mt-1 max-w-xl mx-auto">
          Let's customize your personalized learning roadmap and placement readiness dashboard.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-2 mb-8">
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
            <div 
              key={s.num}
              onClick={() => isDone && setStep(s.num)}
              className={`p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                isActive ? 'bg-accent-purple/20 border-accent-purple text-white shadow-lg shadow-purple-900/30' :
                isDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                'bg-gray-900/40 border-gray-800 text-gray-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold mb-1">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              <div className="text-[10px] text-gray-400">Step {s.num} of 4</div>
            </div>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div className="glass border border-card-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">

        {/* STEP 1: ACADEMIC INFO */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-card-border">
              <div className="w-10 h-10 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Academic Details</h3>
                <p className="text-xs text-gray-400">Where are you pursuing your education?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">College / University Name</label>
                <input 
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Stanford University or IIT Delhi"
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-accent-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Degree Program</label>
                <input 
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech / B.S. in Computer Science"
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-accent-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Department / Stream</label>
                <input 
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-accent-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Expected Graduation Year</label>
                <select 
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-accent-purple"
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
            <div className="flex items-center gap-3 pb-4 border-b border-card-border">
              <div className="w-10 h-10 rounded-2xl bg-accent-pink/20 border border-accent-pink/30 flex items-center justify-center text-accent-pink font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Target Career & Experience</h3>
                <p className="text-xs text-gray-400">Which job role are you targeting for placement?</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Preferred Career Path</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {CAREER_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setCareerGoal(role)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all ${
                      careerGoal === role ? 'bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 border-accent-purple text-white shadow-md' : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{role}</span>
                    {careerGoal === role && <CheckCircle2 className="w-4 h-4 text-accent-purple" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Current Experience Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      experienceLevel === lvl ? 'bg-accent-purple/20 border-accent-purple text-white' : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white'
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
            <div className="flex items-center gap-3 pb-4 border-b border-card-border">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Skills & Learning Interests</h3>
                <p className="text-xs text-gray-400">Select what you already know and what interests you.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Your Current Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SKILL_SUGGESTIONS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        isSelected ? 'bg-accent-purple border-accent-purple text-white shadow-md' : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {skill}
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 opacity-50" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom skill adder */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Add custom skill (e.g. Next.js, Kubernetes)"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  className="flex-1 bg-gray-900/80 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-accent-purple"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
                >
                  Add Skill
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Domain Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_SUGGESTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        isSelected ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white border-transparent shadow-md' : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-white'
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
            <div className="flex items-center gap-3 pb-4 border-b border-card-border">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Resume Extraction & Final Review</h3>
                <p className="text-xs text-gray-400">Upload your resume for AI skill gap analysis and automated profile generation.</p>
              </div>
            </div>

            {/* Resume upload dropzone */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-gray-800 hover:border-accent-purple/60 bg-gray-900/40 text-center relative transition-all">
              <input 
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeSimulatedUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-8 h-8 text-accent-purple mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {uploadingResume ? 'AI Extracting Skills from Resume...' : resumeFileName ? `Uploaded: ${resumeFileName}` : 'Drag & Drop your Resume PDF or click to browse'}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB supported</p>
            </div>

            {/* AI Extraction Score Preview */}
            {resumeScore && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-emerald-400" />
                  <div>
                    <span className="text-xs font-extrabold text-white block">AI Resume Score: {resumeScore}/100</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Extracted {aiExtractedSkills.length} core technical competencies</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {aiExtractedSkills.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Review Box */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2 text-xs">
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Profile Summary</div>
              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <div><strong className="text-white">Institution:</strong> {college}</div>
                <div><strong className="text-white">Program:</strong> {degree} ({graduationYear})</div>
                <div><strong className="text-white">Career Goal:</strong> {careerGoal}</div>
                <div><strong className="text-white">Experience:</strong> {experienceLevel}</div>
              </div>
              <div className="pt-2 border-t border-gray-800">
                <strong className="text-white block mb-1">Selected Skills ({selectedSkills.length}):</strong>
                <div className="flex flex-wrap gap-1">
                  {selectedSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-accent-purple/20 text-accent-purple text-[10px] font-bold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-card-border mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : <div></div>}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              {submitting ? 'Generating Dashboard...' : 'Complete Profile & Launch Dashboard'}
              {!submitting && <Sparkles className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
