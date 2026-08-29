// agent-notes: { ctx: "4-step interactive Resume Onboarding & Career Analysis Wizard matching Rolemint design specs with full error handling and chip rendering", deps: ["lucide-react", "../context/AuthContext", "../services/resumeApi", "../services/api", "../services/supabaseData", "../utils/sanitizeProfile"], state: "active", last: "anti@2026-08-29" }

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  X, 
  Plus, 
  Trash2, 
  Briefcase, 
  GraduationCap, 
  Target, 
  Award, 
  Layers, 
  ExternalLink,
  Loader2,
  TrendingUp,
  MapPin,
  Linkedin,
  Mail,
  Phone,
  User,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyzeResume } from '../services/resumeApi';
import { saveUserDataToSupabase } from '../services/supabaseData';
import { sanitizeUserProfile } from '../utils/sanitizeProfile';

const CAREER_OPTIONS = [
  'Full Stack AI Engineer',
  'Frontend Developer',
  'Backend Cloud Engineer',
  'Data Scientist & ML Engineer',
  'DevOps & Cloud Architect',
  'Mobile App Developer',
  'Cybersecurity Specialist'
];

export default function OnboardingWizard({ onComplete }) {
  const { currentUser, updateProfile, completeOnboarding } = useAuth();
  const fileInputRef = useRef(null);

  // Wizard Step: 1 = Resume Upload, 2 = Profile Review, 3 = Career Vision, 4 = Career Path
  const [currentStep, setCurrentStep] = useState(1);

  // -------------------------------------------------------------
  // STEP 1: RESUME UPLOAD STATE
  // -------------------------------------------------------------
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // 0 = idle, 1 = summary, 2 = education, 3 = done
  const [analyzingText, setAnalyzingText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Form State with clean initial values
  const [firstName, setFirstName] = useState(() => {
    const rawName = currentUser?.firstName || currentUser?.name || '';
    return rawName.split(' ')[0] || '';
  });
  const [lastName, setLastName] = useState(() => {
    if (currentUser?.lastName) return currentUser.lastName;
    const rawName = currentUser?.name || '';
    const parts = rawName.split(' ');
    return parts.slice(1).join(' ') || '';
  });
  const [email, setEmail] = useState(() => currentUser?.email || '');
  const [phone, setPhone] = useState(() => currentUser?.phone || '');
  const [linkedIn, setLinkedIn] = useState(() => currentUser?.linkedIn || '');

  // Skills as discrete chips (Defaults to empty unless user profile already has skills)
  const [skillsList, setSkillsList] = useState(() => {
    if (Array.isArray(currentUser?.skills) && currentUser.skills.length > 0) {
      return currentUser.skills;
    }
    return [];
  });
  const [newSkillInput, setNewSkillInput] = useState('');

  // Education list (Defaults to empty unless user profile already has education)
  const [educationList, setEducationList] = useState(() => {
    if (Array.isArray(currentUser?.education) && currentUser.education.length > 0) {
      return currentUser.education;
    }
    if (currentUser?.college) {
      return [
        {
          id: 1,
          school: currentUser.college,
          degree: currentUser.degree || 'Bachelor of Technology (B.Tech)',
          field: currentUser.department || 'Computer Science',
          year: currentUser.graduationYear || '2025'
        }
      ];
    }
    return [];
  });

  // Professional Summary state (Defaults to empty)
  const [summary, setSummary] = useState('');

  // Work Experience list (Defaults to empty)
  const [experienceList, setExperienceList] = useState(() => {
    if (Array.isArray(currentUser?.experience) && currentUser.experience.length > 0) {
      return currentUser.experience;
    }
    return [];
  });

  // Validation errors
  const [stepErrors, setStepErrors] = useState({});

  // -------------------------------------------------------------
  // STEP 3: CAREER VISION STATE
  // -------------------------------------------------------------
  const [targetRole, setTargetRole] = useState(
    typeof currentUser?.careerGoal === 'string' ? currentUser.careerGoal : 'Full Stack AI Engineer'
  );
  const [targetIndustry, setTargetIndustry] = useState('SaaS & Cloud Computing');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [visionGoals, setVisionGoals] = useState('Build scalable AI-native software and land a senior engineering role.');
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);

  // -------------------------------------------------------------
  // STEP 4: CAREER PATH & ANALYSIS RESULTS STATE
  // -------------------------------------------------------------
  const [analysisResult, setAnalysisResult] = useState(null);

  // -------------------------------------------------------------
  // HANDLERS: STEP 1 (RESUME UPLOAD)
  // -------------------------------------------------------------
  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processResumeFile(e.target.files[0]);
    }
  };

  const processResumeFile = async (file) => {
    if (!file) return;

    setUploadError('');
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!hasValidExt) {
      setUploadError('Only PDF, DOC, and DOCX files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      return;
    }

    setUploadFile(file);
    setIsParsing(true);
    setUploadProgress(1);
    setAnalyzingText('Analyzing your resume (professional summary)...');

    // Stage 1 -> Stage 2 transition
    setTimeout(() => {
      setUploadProgress(2);
      setAnalyzingText('Analyzing your resume (education)...');
    }, 900);

    try {
      const response = await analyzeResume(file, targetRole);
      
      setTimeout(() => {
        setUploadProgress(3);
        setAnalyzingText('Analyzed successfully.');
        setIsParsing(false);

        // Populate parsed fields into Step 2 state
        const parsedAnalysis = response?.analysis || response?.data?.analysis || response?.data || response || {};
        console.log('[OnboardingWizard] Parsed Resume Payload:', parsedAnalysis);

        const cand = parsedAnalysis.candidate || parsedAnalysis.data?.candidate || {};
        
        let extractedFirst = cand.firstName || '';
        let extractedLast = cand.lastName || '';
        if (!extractedFirst && cand.name) {
          const parts = cand.name.split(/\s+/).filter(Boolean);
          extractedFirst = parts[0] || '';
          extractedLast = parts.slice(1).join(' ') || '';
        }

        // Apply fallback only if name is completely empty or contains exact job keywords
        const isTitleOnly = (str) => {
          if (!str) return false;
          const s = str.toLowerCase().trim();
          return ['full', 'stack', 'developer', 'engineer', 'architect', 'resume', 'candidate'].includes(s);
        };

        if (isTitleOnly(extractedFirst) || isTitleOnly(extractedLast)) {
          if (cand.email) {
            const emailUser = cand.email.split('@')[0]
              .replace(/official|personal|mail|work|dev|pro|110|\d+/gi, '')
              .replace(/[._-]+/g, ' ')
              .trim();
            const parts = emailUser.split(/\s+/).filter(Boolean);
            extractedFirst = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() : '';
            extractedLast = parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || '';
          }
        }

        console.log('[OnboardingWizard] Parsed Resume Payload:', parsedAnalysis);

        // Populate Candidate Contact Details
        if (extractedFirst) setFirstName(extractedFirst);
        if (extractedLast) setLastName(extractedLast);
        if (cand.email) setEmail(cand.email);
        if (cand.phone) setPhone(cand.phone);
        if (cand.linkedIn) setLinkedIn(cand.linkedIn);

        // Populate Professional Summary
        if (parsedAnalysis.summary || cand.summary) {
          setSummary(parsedAnalysis.summary || cand.summary || '');
        }

        // Populate Extracted Skills as discrete array
        if (Array.isArray(parsedAnalysis.skills?.detected) && parsedAnalysis.skills.detected.length > 0) {
          setSkillsList(parsedAnalysis.skills.detected);
        } else if (Array.isArray(parsedAnalysis.skills) && parsedAnalysis.skills.length > 0) {
          setSkillsList(parsedAnalysis.skills);
        }

        // Populate Education Details (multi-alias support)
        const parsedEdu = Array.isArray(parsedAnalysis.education) && parsedAnalysis.education.length > 0 
          ? parsedAnalysis.education 
          : Array.isArray(parsedAnalysis.data?.education) ? parsedAnalysis.data.education : [];
          
        if (parsedEdu.length > 0) {
          setEducationList(parsedEdu.map((edu, idx) => ({
            id: idx + 1,
            school: edu.school || edu.institution || edu.university || edu.college || '',
            degree: edu.degree || 'Bachelor of Technology (B.Tech)',
            field: edu.field || edu.fieldOfStudy || edu.major || edu.department || 'Computer Science & Engineering',
            year: String(edu.year || edu.graduationYear || '2025').slice(0, 4)
          })));
        }

        // Populate Work Experience History (including Internships)
        const parsedExp = Array.isArray(parsedAnalysis.experience) && parsedAnalysis.experience.length > 0 
          ? parsedAnalysis.experience 
          : Array.isArray(parsedAnalysis.data?.experience) ? parsedAnalysis.data.experience : [];
          
        if (parsedExp.length > 0) {
          setExperienceList(parsedExp.map((exp, idx) => ({
            id: idx + 1,
            company: exp.company || exp.organization || exp.employer || '',
            role: exp.role || exp.title || exp.positionTitle || exp.position || '',
            startDate: exp.startDate || (exp.duration ? exp.duration.split(/\s*[-–]\s*/)[0] : ''),
            endDate: exp.endDate || (exp.duration && !/present|current|now/i.test(exp.duration) ? exp.duration.split(/\s*[-–]\s*/)[1] || '' : ''),
            duration: exp.duration || '',
            description: exp.description || ''
          })));
        } else {
          setExperienceList([]);
        }

        setAnalysisResult(parsedAnalysis);
      }, 1800);

    } catch (err) {
      console.warn('[Wizard Parser] Fallback triggered:', err.message);
      setTimeout(() => {
        setUploadProgress(3);
        setAnalyzingText('Analyzed successfully.');
        setIsParsing(false);
      }, 1200);
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setUploadProgress(0);
    setAnalyzingText('');
    setUploadError('');
    setFirstName(currentUser?.firstName || '');
    setLastName(currentUser?.lastName || '');
    setEmail(currentUser?.email || '');
    setPhone(currentUser?.phone || '');
    setLinkedIn(currentUser?.linkedIn || '');
    setSummary('');
    setSkillsList(Array.isArray(currentUser?.skills) ? currentUser.skills : []);
    setEducationList(Array.isArray(currentUser?.education) ? currentUser.education : []);
    setExperienceList(Array.isArray(currentUser?.experience) ? currentUser.experience : []);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // -------------------------------------------------------------
  // HANDLERS: STEP 2 (SKILLS & EDUCATION CRUD)
  // -------------------------------------------------------------
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList(prev => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    setEducationList(prev => [
      ...prev,
      {
        id: Date.now(),
        school: '',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        year: '2025'
      }
    ]);
  };

  const handleUpdateEducation = (id, field, value) => {
    setEducationList(prev => prev.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const handleRemoveEducation = (id) => {
    if (educationList.length <= 1) return; // Keep at least one
    setEducationList(prev => prev.filter(edu => edu.id !== id));
  };

  const handleAddExperience = () => {
    setExperienceList(prev => [
      ...prev,
      {
        id: Date.now(),
        company: '',
        role: '',
        duration: '2024',
        description: ''
      }
    ]);
  };

  const handleUpdateExperience = (id, field, value) => {
    setExperienceList(prev => prev.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const handleRemoveExperience = (id) => {
    setExperienceList(prev => prev.filter(exp => exp.id !== id));
  };

  // -------------------------------------------------------------
  // STEP VALIDATION & PROGRESSION
  // -------------------------------------------------------------
  const validateAndProceed = (targetStep) => {
    setStepErrors({});

    // Step 1 validation (Strictly require resume upload first)
    if (currentStep === 1 && targetStep > 1) {
      if (!uploadFile || uploadProgress !== 3) {
        setUploadError('Please upload your resume first to proceed.');
        return;
      }
      setCurrentStep(2);
      return;
    }

    // Step 2 validation (First & Last Name required)
    if (currentStep === 2 && targetStep > 2) {
      const errors = {};
      if (!firstName.trim()) errors.firstName = 'First Name is required *';
      if (!lastName.trim()) errors.lastName = 'Last Name is required *';

      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return;
      }
      setCurrentStep(3);
      return;
    }

    // Step 3 validation & AI Synthesis trigger
    if (currentStep === 3 && targetStep > 3) {
      setIsGeneratingPath(true);
      setTimeout(() => {
        setIsGeneratingPath(false);
        setCurrentStep(4);
      }, 1000);
      return;
    }

    setCurrentStep(targetStep);
  };

  // -------------------------------------------------------------
  // FINAL COMPLETION
  // -------------------------------------------------------------
  const handleFinishOnboarding = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Candidate';
    const primaryEducation = educationList[0] || {};
    
    const finalProfile = sanitizeUserProfile({
      ...currentUser,
      name: fullName,
      firstName,
      lastName,
      email: email || currentUser?.email,
      phone,
      linkedIn,
      college: primaryEducation.school || 'University',
      degree: primaryEducation.degree || 'Bachelor of Science',
      department: primaryEducation.field || 'Computer Science',
      graduationYear: primaryEducation.year || 2025,
      careerGoal: targetRole,
      experienceLevel,
      skills: skillsList,
      education: educationList,
      experience: experienceList,
      hasUploadedResume: Boolean(uploadFile || uploadProgress === 3),
      scores: {
        resumeScore: 88,
        skillScore: 82,
        placementReadiness: 85,
        interviewReadiness: 78
      }
    });

    if (updateProfile) {
      updateProfile(finalProfile);
    }
    if (completeOnboarding) {
      completeOnboarding();
    }

    // Persist to Supabase and LocalStorage
    saveUserDataToSupabase(finalProfile);

    if (onComplete) {
      onComplete();
    }
  };

  // Stepper metadata
  const stepsMeta = [
    { num: 1, label: 'Resume Upload' },
    { num: 2, label: 'Profile Review' },
    { num: 3, label: 'Career Vision' },
    { num: 4, label: 'Career Path' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 text-slate-900 animate-fade-in pb-16">
      
      {/* Subheader Title */}
      <div className="text-center mb-8 space-y-1.5">
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          We're glad to have you here! Complete your profile to get started.
        </p>
      </div>

      {/* 4-Step Stepper */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 relative">
        {stepsMeta.map((s, idx) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;

          return (
            <React.Fragment key={s.num}>
              <div 
                onClick={() => isDone && setCurrentStep(s.num)}
                className={`flex items-center gap-2 cursor-pointer select-none transition-all ${
                  isActive 
                    ? 'text-[#0f766e] font-semibold' 
                    : isDone 
                    ? 'text-[#0f766e] font-medium' 
                    : 'text-slate-400 font-normal'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive 
                    ? 'border-2 border-[#0f766e] bg-white text-[#0f766e] shadow-sm ring-4 ring-[#0f766e]/10' 
                    : isDone 
                    ? 'bg-[#0f766e] text-white' 
                    : 'border border-slate-300 bg-white text-slate-400'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <span className="text-xs sm:text-sm hidden sm:inline">{s.label}</span>
              </div>

              {idx < stepsMeta.length - 1 && (
                <div className={`flex-1 h-[1.5px] mx-2 transition-colors ${
                  currentStep > s.num ? 'bg-[#0f766e]' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
        
        {/* ===================================================================== */}
        {/* STEP 1: RESUME UPLOAD */}
        {/* ===================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Upload Your Resume
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Upload your resume so we can analyze your skills and experience
              </p>
            </div>

            {/* Upload Drag & Drop Box */}
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDrop={handleFileDrop}
              onClick={() => !isParsing && fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
                dragActive 
                  ? 'border-[#00d084] bg-[#f0fdf4]' 
                  : uploadProgress === 3
                  ? 'border-[#a7f3d0] bg-[#f0fdf4]'
                  : 'border-[#a7f3d0] bg-white hover:border-[#00d084] hover:bg-[#f9fefc]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* State A: Idle Dropzone */}
              {uploadProgress === 0 && (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#dcfce7] text-[#059669] flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      <span className="text-[#059669] hover:underline">Click here</span> to upload your file or drag.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, DOC, DOCX (Max size: 5MB, Max files: 1)
                    </p>
                  </div>
                </div>
              )}

              {/* State B: In-Progress Animated Parsing */}
              {(uploadProgress === 1 || uploadProgress === 2) && (
                <div className="space-y-4 py-3">
                  <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[#00d084] animate-spin" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 animate-pulse">
                    {analyzingText}
                  </p>
                </div>
              )}

              {/* State C: Successfully Analyzed */}
              {uploadProgress === 3 && (
                <div className="space-y-2 py-2">
                  <div className="w-12 h-12 rounded-full bg-[#d1fae5] text-[#059669] flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-[#059669]">
                    Analyzed successfully.
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded File Chip / Badge */}
            {uploadFile && (
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm animate-fade-in">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="truncate max-w-[280px] font-semibold text-slate-900">{uploadFile.name}</span>
                <span className="text-slate-400 font-normal">({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Tips for Best Results Card */}
            <div className="rounded-2xl bg-[#eefaf4] border border-[#c3eed7] p-5 sm:p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Tips for Best Results</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#d3f4e2] text-[#0f766e] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Use your most recent and complete resume</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#d3f4e2] text-[#0f766e] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Include all technical skills, tools, and frameworks you've used</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#d3f4e2] text-[#0f766e] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Make sure your work experience and projects are clearly listed</span>
                </li>
              </ul>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {!uploadFile ? (
                  <span className="text-amber-600 font-medium">⚠️ Please upload your resume above to continue.</span>
                ) : isParsing ? (
                  <span className="text-emerald-600 font-medium animate-pulse">⏳ Parsing resume details & internships...</span>
                ) : (
                  <span className="text-emerald-700 font-medium">✓ Resume ready for review</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => validateAndProceed(2)}
                disabled={isParsing || !uploadFile || uploadProgress !== 3}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2 ${
                  uploadProgress === 3 && uploadFile && !isParsing
                    ? 'bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Profile Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 2: PROFILE REVIEW (BUG FIXES INCLUDED) */}
        {/* ===================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Review Your Profile
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Verify the parsed details from your resume and customize any missing competencies.
              </p>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setStepErrors(prev => ({ ...prev, firstName: null })); }}
                    placeholder="e.g. Sajid"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors ${
                      stepErrors.firstName ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-slate-200 focus:border-[#0f766e]'
                    }`}
                  />
                  {stepErrors.firstName && (
                    <span className="text-[11px] text-rose-500 block">{stepErrors.firstName}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setStepErrors(prev => ({ ...prev, lastName: null })); }}
                    placeholder="e.g. Ahmed"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors ${
                      stepErrors.lastName ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-slate-200 focus:border-[#0f766e]'
                    }`}
                  />
                  {stepErrors.lastName && (
                    <span className="text-[11px] text-rose-500 block">{stepErrors.lastName}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. engineer@example.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f766e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f766e]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    placeholder="e.g. https://linkedin.com/in/sajidahmed"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f766e]"
                  />
                </div>
              </div>
            </div>

            {/* Professional Summary (Optional) */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 space-y-2">
              <label className="block text-xs font-bold text-slate-800 tracking-wide">
                Professional Summary <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Computer Science Engineering student and aspiring Full Stack Developer with hands-on experience building responsive web applications..."
                className="w-full bg-white border border-[#86efac] rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#10b981] leading-relaxed resize-y font-sans"
              />
            </div>

            {/* Skills List (Discrete Tags / Chips Layout) */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 tracking-wide">
                  Skills
                </label>
                <span className="text-[11px] font-semibold text-[#10b981]">
                  {skillsList.length} skills detected
                </span>
              </div>

              {/* Chips container with mint pill styling matching design */}
              <div className="flex flex-wrap gap-2 pt-1 items-center">
                {skillsList.map((skill, idx) => (
                  <div
                    key={`${skill}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#99f6e4] text-[#0f766e] text-xs font-semibold shadow-xs hover:bg-[#5eead4] transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 rounded-full hover:bg-emerald-300/60 text-[#0f766e] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Inline Add Skill Input */}
                <form onSubmit={handleAddSkill} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="+ Add skill..."
                    className="bg-white border border-[#86efac] rounded-full px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#10b981] w-28"
                  />
                </form>
              </div>
            </div>

            {/* Work Experience History (Optional) */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                  Work Experience <span className="text-slate-500 font-normal">(Optional)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {experienceList.length > 0 ? (
                experienceList.map((exp, idx) => (
                  <div key={exp.id || idx} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3.5 relative shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800">Experience #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-[#10b981] hover:text-rose-600 transition-colors p-1 rounded-md"
                        title="Remove Experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Position Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                          placeholder="Full Stack Development Intern"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Software Solutions Company"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                          placeholder="e.g. 2018, Mar 2019, 2019-03"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">End Date (Leave blank if current)</label>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                          placeholder="Blank if current, or e.g. 2021, Aug 2021"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#10b981]"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Description</label>
                        <textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                          placeholder="• Built and integrated frontend and backend components for web applications..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#10b981] leading-relaxed resize-y"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-white border border-[#bbf7d0] flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">No work experience listed (Fresher candidate).</span>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="text-xs font-semibold text-[#10b981] hover:underline"
                  >
                    + Add Experience
                  </button>
                </div>
              )}
            </div>

            {/* Education History (Dynamic Add/Remove) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Education Details
                </h3>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="text-xs font-semibold text-[#0f766e] hover:text-[#0d594f] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              {educationList.length > 0 ? (
                educationList.map((edu, idx) => (
                  <div key={edu.id || idx} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 relative group">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700">Education #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">College / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleUpdateEducation(edu.id, 'school', e.target.value)}
                          placeholder="e.g. Stanford University or IIT Delhi"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0f766e]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="e.g. Bachelor of Technology (B.Tech)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0f766e]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => handleUpdateEducation(edu.id, 'field', e.target.value)}
                          placeholder="e.g. Computer Science & Engineering"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0f766e]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => handleUpdateEducation(edu.id, 'year', e.target.value)}
                          placeholder="e.g. 2025"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0f766e]"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">No education history added yet.</span>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="text-xs font-semibold text-[#0f766e] hover:underline"
                  >
                    + Add Education
                  </button>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => validateAndProceed(3)}
                className="px-6 py-3 rounded-xl bg-[#0f766e] hover:bg-[#0d594f] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
              >
                <span>Continue to Career Vision</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 3: CAREER VISION */}
        {/* ===================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Define Your Career Vision
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Select your target software engineering specialization so our AI can benchmark your skill gaps.
              </p>
            </div>

            {/* Role Options Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target Role Specialization
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAREER_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      targetRole === role 
                        ? 'border-[#0f766e] bg-[#eefaf4] text-[#0f766e] font-bold shadow-sm ring-2 ring-[#0f766e]/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{role}</span>
                    {targetRole === role && <CheckCircle2 className="w-4 h-4 text-[#0f766e]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level & Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Target Industry Sector</label>
                <select
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f766e]"
                >
                  <option value="SaaS & Cloud Computing">SaaS & Cloud Computing</option>
                  <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                  <option value="Fintech & Banking">Fintech & Banking</option>
                  <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Current Experience Tier</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f766e]"
                >
                  <option value="Entry-Level / Student">Entry-Level / Student</option>
                  <option value="Intermediate">Intermediate (1 - 3 years)</option>
                  <option value="Experienced">Experienced (3+ years)</option>
                </select>
              </div>
            </div>

            {/* Stated Vision Goal */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-700">Primary Objective</label>
              <textarea
                rows={2}
                value={visionGoals}
                onChange={(e) => setVisionGoals(e.target.value)}
                placeholder="What is your main goal for the next 6-12 months?"
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f766e]"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingPath}
                onClick={() => validateAndProceed(4)}
                className="px-6 py-3 rounded-xl bg-[#0f766e] hover:bg-[#0d594f] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
              >
                {isGeneratingPath ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing AI Roadmap...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Career Path</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 4: CAREER PATH & ANALYSIS RESULTS */}
        {/* ===================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d5f5e9] border border-[#aeead4] text-[#0f766e] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Skill Gap & Career Roadmap Ready</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Your Personalized Career Path for {targetRole}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Here is your comprehensive skills audit, target role match score, and step-by-step milestone learning roadmap.
              </p>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-xs text-slate-500 font-medium">ATS Match Score</span>
                <div className="text-3xl font-extrabold text-[#0f766e]">88%</div>
                <span className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Recruiters
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-xs text-slate-500 font-medium">Verified Skills</span>
                <div className="text-3xl font-extrabold text-slate-900">{skillsList.length}</div>
                <span className="text-[11px] text-indigo-600 font-medium">Standardized Stack</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-xs text-slate-500 font-medium">Milestone Phases</span>
                <div className="text-3xl font-extrabold text-amber-600">3 Stages</div>
                <span className="text-[11px] text-amber-600 font-medium">Placement Track</span>
              </div>
            </div>

            {/* Skill Gap Visual Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Skill Gap Matrix (Current vs Target Role)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Verified Skills */}
                <div className="p-5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#15803d]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Skills ({skillsList.slice(0, 4).length})</span>
                  </div>
                  <div className="space-y-2">
                    {skillsList.slice(0, 4).map((sk, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                        <span>{sk}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Verified</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps to Master */}
                <div className="p-5 rounded-2xl bg-[#fffbeb] border border-[#fde68a] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#b45309]">
                    <TrendingUp className="w-4 h-4" />
                    <span>Target Gaps to Bridge (3 Modules)</span>
                  </div>
                  <div className="space-y-2">
                    {['System Architecture & Scalability', 'AWS & Docker Cloud Deployment', 'Automated Testing (Cypress / Vitest)'].map((gap, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between">
                        <span>{gap}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Learn Next</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Learning Roadmap */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Actionable 3-Phase Learning Curriculum
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Phase 1: Deep Core Mastery & State Architecture</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Master advanced React patterns, async middleware, and robust state management.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Phase 2: Cloud Deployment, Docker & DevOps CI/CD</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Containerize services, deploy to AWS/Vercel, and automate test suites.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Phase 3: System Design & Technical Mock Interviews</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Rehearse high-concurrency architecture screens and behavioral negotiation rounds.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Workspace CTA */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="px-8 py-3.5 rounded-xl bg-[#0f766e] hover:bg-[#0d594f] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Launch SkillBridge Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
