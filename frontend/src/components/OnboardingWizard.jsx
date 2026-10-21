// agent-notes: { ctx: "Onboarding with mandatory manual Target Role, Industry & Objective inputs", deps: ["lucide-react", "../context/AuthContext", "../services/resumeApi", "../services/api", "../services/supabaseData", "../utils/sanitizeProfile"], state: "active", last: "anti@2026-10-21" }

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
import { saveResumeAndProgress } from '../services/userPersistence';
import { sanitizeUserProfile } from '../utils/sanitizeProfile';
import SkillGapDashboard from './SkillGapDashboard';

const CAREER_OPTIONS = [
  'Full Stack AI Engineer',
  'Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'Data Scientist',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Mobile App Developer',
  'Cybersecurity Specialist'
];

import { TARGET_INDUSTRY_OPTIONS } from '../constants/industryOptions';

export { TARGET_INDUSTRY_OPTIONS };

export default function OnboardingWizard({ onComplete, profile }) {
  const { currentUser, updateProfile, completeOnboarding } = useAuth();
  const effectiveProfile = profile || currentUser;
  const fileInputRef = useRef(null);
  const firstNameInputRef = useRef(null);

  // Helper to determine initial uploaded resume file from storage or profile
  const getInitialUploadFile = () => {
    try {
      const storedName = localStorage.getItem('sb_resume_filename') || effectiveProfile?.resumeFileName || currentUser?.resumeFileName;
      const hasResume = localStorage.getItem('sb_has_uploaded_resume') === 'true' || Boolean(effectiveProfile?.hasUploadedResume) || Boolean(currentUser?.hasUploadedResume);
      if (storedName || hasResume) {
        const storedSize = Number(localStorage.getItem('sb_resume_filesize')) || 145 * 1024;
        return {
          name: storedName || 'Uploaded_Resume.pdf',
          size: storedSize,
          type: 'application/pdf'
        };
      }
    } catch {}
    return null;
  };

  // Wizard Step: 1 = Resume Upload, 2 = Profile Review, 3 = Career Vision, 4 = Career Path, 5 = Skill Gap Analysis
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const savedStep = Number(localStorage.getItem('sb_wizard_step'));
      if (savedStep && savedStep >= 1 && savedStep <= 5) {
        return savedStep;
      }
    } catch {}
    return 1;
  });

  // Track step in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sb_wizard_step', String(currentStep));
    } catch {}
  }, [currentStep]);

  // -------------------------------------------------------------
  // STEP 1: RESUME UPLOAD STATE
  // -------------------------------------------------------------
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState(() => getInitialUploadFile());
  const [uploadProgress, setUploadProgress] = useState(() => (getInitialUploadFile() ? 3 : 0)); // 0 = idle, 1 = summary, 2 = education, 3 = done
  const [analyzingText, setAnalyzingText] = useState(() => (getInitialUploadFile() ? 'Analyzed successfully.' : ''));
  const [uploadError, setUploadError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Sync uploadFile if profile or currentUser updates after mount
  useEffect(() => {
    const prof = effectiveProfile || currentUser;
    const storedName = prof?.resumeFileName || localStorage.getItem('sb_resume_filename');
    const hasResume = Boolean(prof?.hasUploadedResume) || localStorage.getItem('sb_has_uploaded_resume') === 'true';

    if ((storedName || hasResume) && !uploadFile) {
      const storedSize = Number(localStorage.getItem('sb_resume_filesize')) || 145 * 1024;
      setUploadFile({
        name: storedName || 'Uploaded_Resume.pdf',
        size: storedSize,
        type: 'application/pdf'
      });
      setUploadProgress(3);
      setAnalyzingText('Analyzed successfully.');
    }
  }, [effectiveProfile?.hasUploadedResume, effectiveProfile?.resumeFileName, currentUser?.hasUploadedResume, currentUser?.resumeFileName]);

  // Form State: DO NOT auto-fill or prefill name details. User input of name is strictly required.
  const [firstName, setFirstName] = useState(() => {
    return localStorage.getItem('sb_profile_firstname') || '';
  });
  const [lastName, setLastName] = useState(() => {
    return localStorage.getItem('sb_profile_lastname') || '';
  });

  // Modal pop-up state for mandatory user name input
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [modalFirstName, setModalFirstName] = useState('');
  const [modalLastName, setModalLastName] = useState('');
  const [nameModalError, setNameModalError] = useState('');
  const [nameModalShake, setNameModalShake] = useState(false);
  const modalFirstInputRef = useRef(null);

  // Trigger modal pop-up automatically when user lands on Step 2 (Profile Review) if name is missing
  useEffect(() => {
    if (currentStep === 2 && (!firstName.trim() || !lastName.trim())) {
      setModalFirstName(firstName);
      setModalLastName(lastName);
      setIsNameModalOpen(true);
      setTimeout(() => {
        modalFirstInputRef.current?.focus();
      }, 250);
    }
  }, [currentStep]);

  const triggerNameModalStrike = (errorMessage) => {
    setNameModalError(errorMessage);
    setNameModalShake(true);
    setTimeout(() => setNameModalShake(false), 500);
  };

  const handleConfirmNameModal = (e) => {
    if (e) e.preventDefault();
    const trimmedFirst = modalFirstName.trim();
    const trimmedLast = modalLastName.trim();

    if (!trimmedFirst && !trimmedLast) {
      triggerNameModalStrike('⚠️ Please enter both your First Name and Last Name.');
      modalFirstInputRef.current?.focus();
      return;
    }
    if (!trimmedFirst) {
      triggerNameModalStrike('⚠️ First Name is required. Please enter your first name.');
      modalFirstInputRef.current?.focus();
      return;
    }
    if (!trimmedLast) {
      triggerNameModalStrike('⚠️ Last Name is required. Please enter your last name.');
      return;
    }

    setFirstName(trimmedFirst);
    setLastName(trimmedLast);
    try {
      localStorage.setItem('sb_profile_firstname', trimmedFirst);
      localStorage.setItem('sb_profile_lastname', trimmedLast);
    } catch {}
    setStepErrors(prev => ({ ...prev, firstName: null, lastName: null }));
    setNameModalError('');
    setIsNameModalOpen(false);
  };

  const handleDismissNameModal = () => {
    if (!modalFirstName.trim() || !modalLastName.trim()) {
      triggerNameModalStrike('⚠️ You must enter your First Name and Last Name to proceed!');
      return;
    }
    handleConfirmNameModal();
  };

  const [email, setEmail] = useState(() => effectiveProfile?.email || currentUser?.email || localStorage.getItem('sb_profile_email') || '');
  const [phone, setPhone] = useState(() => effectiveProfile?.phone || currentUser?.phone || localStorage.getItem('sb_profile_phone') || '');
  const [linkedIn, setLinkedIn] = useState(() => effectiveProfile?.linkedIn || currentUser?.linkedIn || localStorage.getItem('sb_profile_linkedin') || '');

  // Skills as discrete chips (Defaults to empty unless user profile already has skills)
  const [skillsList, setSkillsList] = useState(() => {
    if (Array.isArray(effectiveProfile?.skills) && effectiveProfile.skills.length > 0) {
      return effectiveProfile.skills;
    }
    if (Array.isArray(currentUser?.skills) && currentUser.skills.length > 0) {
      return currentUser.skills;
    }
    try {
      const localSkills = JSON.parse(localStorage.getItem('sb_profile_skills'));
      if (Array.isArray(localSkills) && localSkills.length > 0) return localSkills;
      const rawAnalysis = localStorage.getItem('sb_resume_analysis');
      if (rawAnalysis) {
        const parsed = JSON.parse(rawAnalysis);
        const s = parsed.skills?.detected || parsed.skills;
        if (Array.isArray(s) && s.length > 0) return s;
      }
    } catch {}
    return [];
  });
  const [newSkillInput, setNewSkillInput] = useState('');

  // Education list (Defaults to empty unless user profile already has education)
  const [educationList, setEducationList] = useState(() => {
    const list = effectiveProfile?.education || currentUser?.education;
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    try {
      const localEdu = JSON.parse(localStorage.getItem('sb_profile_education'));
      if (Array.isArray(localEdu) && localEdu.length > 0) return localEdu;
      const rawAnalysis = localStorage.getItem('sb_resume_analysis');
      if (rawAnalysis) {
        const parsed = JSON.parse(rawAnalysis);
        const e = parsed.education || parsed.data?.education;
        if (Array.isArray(e) && e.length > 0) {
          return e.map((edu, idx) => ({
            id: idx + 1,
            school: edu.institution || edu.school || edu.university || edu.college || '',
            degree: edu.qualification || edu.degree || 'Bachelor of Technology (B.Tech)',
            field: edu.field_of_study || edu.field || edu.department || 'Computer Science',
            year: String(edu.graduation_year || edu.year || '2025').slice(0, 4)
          }));
        }
      }
    } catch {}
    const college = effectiveProfile?.college || currentUser?.college;
    if (college) {
      return [
        {
          id: 1,
          school: college,
          degree: effectiveProfile?.degree || currentUser?.degree || 'Bachelor of Technology (B.Tech)',
          field: effectiveProfile?.department || currentUser?.department || 'Computer Science',
          year: effectiveProfile?.graduationYear || currentUser?.graduationYear || '2025'
        }
      ];
    }
    return [];
  });

  // Professional Summary state (Defaults to empty)
  const [summary, setSummary] = useState(() => {
    if (effectiveProfile?.summary || effectiveProfile?.professionalSummary) {
      return effectiveProfile.summary || effectiveProfile.professionalSummary;
    }
    if (currentUser?.summary || currentUser?.professionalSummary) {
      return currentUser.summary || currentUser.professionalSummary;
    }
    try {
      const localSummary = localStorage.getItem('sb_profile_summary');
      if (localSummary) return localSummary;
      const rawAnalysis = localStorage.getItem('sb_resume_analysis');
      if (rawAnalysis) {
        const parsed = JSON.parse(rawAnalysis);
        const s = parsed.summary || parsed.professional_summary || parsed.candidate?.summary;
        if (s) return s;
      }
    } catch {}
    return '';
  });

  // Work Experience list (Defaults to empty)
  const [experienceList, setExperienceList] = useState(() => {
    const exp = effectiveProfile?.experience || currentUser?.experience;
    if (Array.isArray(exp) && exp.length > 0) {
      return exp;
    }
    try {
      const localExp = JSON.parse(localStorage.getItem('sb_profile_experience'));
      if (Array.isArray(localExp) && localExp.length > 0) return localExp;
      const rawAnalysis = localStorage.getItem('sb_resume_analysis');
      if (rawAnalysis) {
        const parsed = JSON.parse(rawAnalysis);
        const e = parsed.work_experience || parsed.experience || parsed.data?.work_experience;
        if (Array.isArray(e) && e.length > 0) {
          return e.map((item, idx) => ({
            id: idx + 1,
            company: item.company || item.organization || '',
            role: item.position_title || item.role || item.title || '',
            startDate: item.start_date || item.startDate || '',
            endDate: item.end_date || item.endDate || '',
            duration: item.duration || '',
            description: item.description || ''
          }));
        }
      }
    } catch {}
    return [];
  });

  // Validation errors
  const [stepErrors, setStepErrors] = useState({});

  // -------------------------------------------------------------
  // STEP 3: CAREER VISION STATE (User must manually select Role, Industry & write Objective)
  // -------------------------------------------------------------
  const [targetRole, setTargetRole] = useState(() => {
    const stored = localStorage.getItem('sb_target_role');
    if (stored && stored !== 'Full Stack AI Engineer') return stored;
    if (effectiveProfile?.careerGoal && effectiveProfile.careerGoal !== 'Full Stack AI Engineer') return effectiveProfile.careerGoal;
    if (currentUser?.careerGoal && currentUser.careerGoal !== 'Full Stack AI Engineer') return currentUser.careerGoal;
    return '';
  });
  const [targetIndustry, setTargetIndustry] = useState(() => {
    const stored = localStorage.getItem('sb_target_industry');
    if (stored && stored !== 'SaaS & Cloud Computing') return stored;
    if (effectiveProfile?.targetIndustry && effectiveProfile.targetIndustry !== 'SaaS & Cloud Computing') return effectiveProfile.targetIndustry;
    if (currentUser?.targetIndustry && currentUser.targetIndustry !== 'SaaS & Cloud Computing') return currentUser.targetIndustry;
    return '';
  });
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [visionGoals, setVisionGoals] = useState(() => {
    const stored = localStorage.getItem('sb_vision_goals');
    if (stored && stored !== 'Build scalable AI-native software and land a senior engineering role.') return stored;
    if (effectiveProfile?.visionGoals && effectiveProfile.visionGoals !== 'Build scalable AI-native software and land a senior engineering role.') return effectiveProfile.visionGoals;
    if (currentUser?.visionGoals && currentUser.visionGoals !== 'Build scalable AI-native software and land a senior engineering role.') return currentUser.visionGoals;
    return '';
  });
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

    let stageTimer = setTimeout(() => {
      setUploadProgress(2);
      setAnalyzingText('Analyzing your resume (education & experience)...');
    }, 600);

    try {
      const response = await analyzeResume(file, targetRole);
      clearTimeout(stageTimer);

      setUploadProgress(3);
      setAnalyzingText('Analyzed successfully.');
      setIsParsing(false);

      // Helper function to sanitize summary and prune table headers / stray section headers
      const cleanSummaryText = (raw) => {
        if (!raw || typeof raw !== 'string') return '';
        let cleaned = raw.replace(/\r\n/g, '\n').trim();
        const stopPatterns = [
          /\b(?:educational\s+qualification|academic\s+qualification|academic\s+background)\b/i,
          /\b(?:qualificationinstitution|institution%|% of marks|marksyear|percentage_or_gpa|percentage\s+or\s+gpa)\b/i,
          /(?:^|\n)\s*(?:education|qualifications|technical\s+skills|skills|work\s+experience|experience|projects|certifications|declaration)\s*[:\n]/im,
          /\b(?:technical\s+skills|work\s+experience|key\s+projects|personal\s+details)\s*[:\n]/i,
          /\b(?:institution\s*(?:%|marks|year|cgpa|gpa))\b/i,
          /\b(?:qualification\s+institution)\b/i,
          /\b(?:cgpa|gpa|passing\s+year|board\s*\/\s*university)\s*[:\n]/i
        ];
        for (const pattern of stopPatterns) {
          const match = cleaned.search(pattern);
          if (match !== -1) {
            cleaned = cleaned.substring(0, match);
          }
        }
        return cleaned
          .replace(/(?:educational\s+qualification|qualificationinstitution|institution%|% of marks|marksyear|institution|qualification|cgpa|gpa|year)+$/gi, '')
          .trim()
          .replace(/[\s\r\n]+/g, ' ');
      };

      // Populate parsed fields into Step 2 state
      const parsedAnalysis = response?.analysis || response?.data?.analysis || response?.data || response || {};
      console.log('[OnboardingWizard] Parsed Resume Payload:', parsedAnalysis);

      const cand = parsedAnalysis.candidate || parsedAnalysis.data?.candidate || {};

      // User requirement: In profile review, name must come from user input — ask user to fill up their name.
      // Do NOT auto-extract or overwrite name from parsed resume.
      if (cand.email || parsedAnalysis.email) setEmail(cand.email || parsedAnalysis.email);
      if (cand.phone || parsedAnalysis.phone) setPhone(cand.phone || parsedAnalysis.phone);
      if (cand.linkedIn || parsedAnalysis.linkedin_url) setLinkedIn(cand.linkedIn || parsedAnalysis.linkedin_url);

      // STRICT RULE 2: Populate Professional Summary without table fragments
      const rawSummary = parsedAnalysis.professional_summary || parsedAnalysis.summary || cand.summary || '';
      const sanitizedSummary = cleanSummaryText(rawSummary);
      if (sanitizedSummary) {
        setSummary(sanitizedSummary);
      }

      // Populate Extracted Skills as discrete array
      if (Array.isArray(parsedAnalysis.skills?.detected) && parsedAnalysis.skills.detected.length > 0) {
        setSkillsList(parsedAnalysis.skills.detected);
      } else if (Array.isArray(parsedAnalysis.skills) && parsedAnalysis.skills.length > 0) {
        setSkillsList(parsedAnalysis.skills);
      }

      // STRICT RULE 5: Populate Education Details (multi-alias support & project filter)
      const rawEduList = Array.isArray(parsedAnalysis.education) && parsedAnalysis.education.length > 0 
        ? parsedAnalysis.education 
        : (Array.isArray(parsedAnalysis.data?.education) ? parsedAnalysis.data.education : []);
        
      const invalidEduProjectRegex = /(?:project|ai-based|artificial\s+general\s+intelligence|developed|application\s+development|image-to-text|chatbot|wordpress|seo\s+analysis)/i;

      const validParsedEdu = rawEduList.filter(edu => {
        const school = (edu.institution || edu.school || edu.university || edu.college || '').trim();
        if (!school || school.length < 3) return false;
        if (invalidEduProjectRegex.test(school)) return false;
        if (/^(?:educational\s+qualification|qualification|institution|%\s*of\s*marks|percentage|year|cgpa|gpa|marks|board)/i.test(school)) return false;
        return true;
      });

      if (validParsedEdu.length > 0) {
        setEducationList(validParsedEdu.map((edu, idx) => ({
          id: idx + 1,
          school: edu.institution || edu.school || edu.university || edu.college || '',
          degree: (!invalidEduProjectRegex.test(edu.qualification || edu.degree || '')) ? (edu.qualification || edu.degree || 'Bachelor of Technology (B.Tech)') : 'Bachelor of Technology (B.Tech)',
          field: edu.field_of_study || edu.field || edu.fieldOfStudy || edu.major || edu.department || 'Computer Science & Engineering',
          year: String(edu.graduation_year || edu.year || edu.graduationYear || '2025').slice(0, 4)
        })));
      }

      // STRICT RULE 4: Populate Work Experience History (filtering soft skills, stray fragments, and EDUCATION data)
      const rawParsedExp = Array.isArray(parsedAnalysis.work_experience) && parsedAnalysis.work_experience.length > 0
        ? parsedAnalysis.work_experience
        : (Array.isArray(parsedAnalysis.experience) && parsedAnalysis.experience.length > 0 
          ? parsedAnalysis.experience 
          : (Array.isArray(parsedAnalysis.data?.work_experience) ? parsedAnalysis.data.work_experience : (Array.isArray(parsedAnalysis.data?.experience) ? parsedAnalysis.data.experience : [])));
        
      const invalidTitleSoftSkills = /^(?:problem-solving|and\s+leadership\s+skills|leadership\s+skills|leadership|communication|team\s+player|fast\s+learner|engineering|madurai|developed|responsible\s+for|projects|tools|p|aper\s+p|r|esen)$/i;
      const invalidCompanyFragments = /^(?:and\s+leadership\s+skills|leadership\s+skills|madurai|tools|projects|engineering|p|aper\s+p|r|esen)$/i;
      const EDU_WORDS = /\b(b\.?e\.?|b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?a|m\.?a|mba|bachelor|master|diploma|higher secondary|hsc|sslc|school|college|university|cgpa|gpa|expected)\b/i;
      const DATE_ONLY = /^(expected\s*)?(\d{4}|\w{3,9}\.?\s*\d{4})(\s*[-–]\s*(\d{4}|present))?$/i;
      const TEMPLATE_TEXT = /action\s*\+\s*metric\s*\+\s*impact/i;

      const validParsedExp = rawParsedExp.filter(exp => {
        const role = (exp.position_title || exp.role || exp.title || '').trim();
        const company = (exp.company || exp.organization || '').trim();
        if (!role || !company) return false;
        if (EDU_WORDS.test(role)) return false; // degrees belong only in education
        if (DATE_ONLY.test(company)) return false; // dates sitting in company field
        if (EDU_WORDS.test(company)) return false; // schools/degrees sitting in company field
        if (invalidTitleSoftSkills.test(role) && (!company || invalidCompanyFragments.test(company))) return false;
        if (invalidCompanyFragments.test(company) && (!role || invalidTitleSoftSkills.test(role))) return false;
        if (!company && /^(?:engineered|developed|implemented|built|designed|created|optimized|worked|maintained|managed|led)\b/i.test(role)) return false;
        return true;
      });

      if (validParsedExp.length > 0) {
        setExperienceList(validParsedExp.map((exp, idx) => {
          let role = (exp.position_title || exp.role || exp.title || exp.positionTitle || exp.position || '').trim();
          let comp = (exp.company || exp.organization || exp.employer || '').trim();
          if (invalidTitleSoftSkills.test(role)) role = "";
          if (invalidCompanyFragments.test(comp)) comp = "";

          let start = exp.start_date || exp.startDate || '';
          let end = exp.end_date || exp.endDate || '';
          if (end === "Present" || /present|current|now/i.test(end)) {
            end = ""; // blank = current, as form says
          }
          if (!start && exp.duration) {
            const parts = exp.duration.split(/\s*(?:-|–|to)\s*/i);
            start = parts[0] || '';
            if (parts[1] && !/present|current|now/i.test(parts[1])) {
              end = parts[1];
            }
          }

          // Clean description bullets - remove Action + Metric + Impact
          let cleanDesc = '';
          if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
            cleanDesc = exp.bullets
              .map(b => (b || '').replace(/^action\s*\+\s*metric\s*\+\s*impact\s*:\s*/i, '').trim())
              .filter(b => b && !TEMPLATE_TEXT.test(b))
              .map(b => `• ${b}`)
              .join('\n');
          } else if (exp.description) {
            const lines = exp.description.split(/\r?\n|•/)
              .map(b => b.replace(/^action\s*\+\s*metric\s*\+\s*impact\s*:\s*/i, '').trim())
              .filter(Boolean);
            const filtered = lines.filter(l => l.length >= 5 && !/[✆📭✉📞]/.test(l) && !/^(?:p|aper\s+p|r|esen)$/i.test(l) && !TEMPLATE_TEXT.test(l));
            cleanDesc = filtered.map(l => l.startsWith('•') ? l : `• ${l}`).join('\n');
          }

          return {
            id: idx + 1,
            company: comp,
            role: role || (comp ? "Software Engineer" : ""),
            startDate: start,
            endDate: end,
            duration: exp.duration || (start ? `${start} - ${end || 'Present'}` : ''),
            description: cleanDesc
          };
        }).filter(exp => exp.company && exp.role && !EDU_WORDS.test(exp.role) && !DATE_ONLY.test(exp.company)));
      } else {
        setExperienceList([]);
      }

      setAnalysisResult(parsedAnalysis);

      try {
        localStorage.setItem('sb_resume_filename', file.name);
        localStorage.setItem('sb_resume_filesize', String(file.size || 148480));
        localStorage.setItem('sb_has_uploaded_resume', 'true');
        localStorage.setItem('sb_resume_analysis', JSON.stringify(parsedAnalysis));
        if (parsedAnalysis.resumeText) {
          localStorage.setItem('sb_resume_text', parsedAnalysis.resumeText);
        }
        if (sanitizedSummary) {
          localStorage.setItem('sb_profile_summary', sanitizedSummary);
        }
        if (validParsedEdu.length > 0) {
          localStorage.setItem('sb_profile_education', JSON.stringify(validParsedEdu.map((edu, idx) => ({
            id: idx + 1,
            school: edu.institution || edu.school || edu.university || edu.college || '',
            degree: (!invalidEduProjectRegex.test(edu.qualification || edu.degree || '')) ? (edu.qualification || edu.degree || 'Bachelor of Technology (B.Tech)') : 'Bachelor of Technology (B.Tech)',
            field: edu.field_of_study || edu.field || edu.fieldOfStudy || edu.major || edu.department || 'Computer Science & Engineering',
            year: String(edu.graduation_year || edu.year || edu.graduationYear || '2025').slice(0, 4)
          }))));
        }
        const detectedSkills = Array.isArray(parsedAnalysis.skills?.detected) ? parsedAnalysis.skills.detected : (Array.isArray(parsedAnalysis.skills) ? parsedAnalysis.skills : []);
        if (detectedSkills.length > 0) {
          localStorage.setItem('sb_profile_skills', JSON.stringify(detectedSkills));
        }
      } catch (e) {}

      if (updateProfile) {
        updateProfile({
          hasUploadedResume: true,
          resumeFileName: file.name
        });
      }

      // User requirement: After upload resume, automatically advance to Profile Review so user can input their name
      setTimeout(() => {
        setCurrentStep(2);
      }, 700);

    } catch (err) {
      clearTimeout(stageTimer);
      console.error('[ResumeAnalysis] Failed:', err);
      console.error('[ResumeAnalysis] Error Diagnostic Info:', {
        message: err.message,
        status: err.status,
        details: err.details,
        stack: err.stack
      });
      setIsParsing(false);
      setUploadProgress(0);
      setUploadFile(null);
      setUploadError(err.message || 'Resume analysis failed. Please verify your file format and try again.');
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setUploadProgress(0);
    setAnalyzingText('');
    setUploadError('');
    setFirstName('');
    setLastName('');
    setEmail(effectiveProfile?.email || currentUser?.email || '');
    setPhone(effectiveProfile?.phone || currentUser?.phone || '');
    setLinkedIn(effectiveProfile?.linkedIn || currentUser?.linkedIn || '');
    setSummary('');
    setSkillsList(Array.isArray(effectiveProfile?.skills) ? effectiveProfile.skills : (Array.isArray(currentUser?.skills) ? currentUser.skills : []));
    setEducationList(Array.isArray(effectiveProfile?.education) ? effectiveProfile.education : (Array.isArray(currentUser?.education) ? currentUser.education : []));
    setExperienceList(Array.isArray(effectiveProfile?.experience) ? effectiveProfile.experience : (Array.isArray(currentUser?.experience) ? currentUser.experience : []));
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      localStorage.removeItem('sb_resume_filename');
      localStorage.removeItem('sb_resume_filesize');
      localStorage.removeItem('sb_resume_analysis');
      localStorage.removeItem('sb_profile_summary');
      localStorage.removeItem('sb_profile_skills');
      localStorage.removeItem('sb_profile_education');
      localStorage.removeItem('sb_profile_experience');
      localStorage.removeItem('sb_profile_firstname');
      localStorage.removeItem('sb_profile_lastname');
      localStorage.setItem('sb_wizard_step', '1');
      localStorage.setItem('sb_has_uploaded_resume', 'false');
    } catch {}

    if (updateProfile) {
      updateProfile({
        hasUploadedResume: false,
        resumeFileName: null
      });
    }
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

    // Step 2 validation (First & Last Name required from user input via modal popup)
    if (currentStep === 2 && targetStep > 2) {
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();

      if (!trimmedFirst || !trimmedLast) {
        setModalFirstName(firstName);
        setModalLastName(lastName);
        setIsNameModalOpen(true);
        triggerNameModalStrike('⚠️ You must enter your First Name and Last Name to continue!');
        const errors = {};
        if (!trimmedFirst) errors.firstName = 'Please fill up your First Name *';
        if (!trimmedLast) errors.lastName = 'Please fill up your Last Name *';
        setStepErrors(errors);
        return;
      }
      setCurrentStep(3);
      return;
    }

    // Step 3 validation (Strictly require user to manually select Target Role, select Target Industry, and write Primary Objective)
    if (currentStep === 3 && targetStep > 3) {
      const errors = {};
      if (!targetRole || !targetRole.trim()) {
        errors.targetRole = 'Please select your Target Role Specialization to continue *';
      }
      if (!targetIndustry || !targetIndustry.trim()) {
        errors.targetIndustry = 'Please select your Target Industry Sector *';
      }
      if (!visionGoals || !visionGoals.trim()) {
        errors.visionGoals = 'Please write your Primary Objective to continue *';
      }

      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return;
      }

      setStepErrors({});
      try {
        if (targetRole) localStorage.setItem('sb_target_role', targetRole);
        if (targetIndustry) localStorage.setItem('sb_target_industry', targetIndustry);
        if (visionGoals) localStorage.setItem('sb_vision_goals', visionGoals);
      } catch {}

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
      targetIndustry,
      experienceLevel,
      skills: skillsList,
      education: educationList,
      experience: experienceList,
      hasUploadedResume: Boolean(uploadFile || uploadProgress === 3),
      resumeFileName: uploadFile?.name || (uploadProgress === 3 ? (analysisResult?.fileName || 'Uploaded_Resume.pdf') : null),
      scores: {
        resumeScore: 88,
        skillScore: 82,
        placementReadiness: 85,
        interviewReadiness: 78
      }
    });

    if (uploadFile?.name) {
      localStorage.setItem('sb_resume_filename', uploadFile.name);
    }

    if (updateProfile) {
      updateProfile(finalProfile);
    }
    if (completeOnboarding) {
      completeOnboarding();
    }

    // Persist to Supabase and LocalStorage
    saveUserDataToSupabase(finalProfile);

    // Persist full resume file and progress records to Supabase tables and storage
    try {
      await saveResumeAndProgress({
        user: finalProfile,
        file: uploadFile,
        resumeData: analysisResult || {},
        parsedText: analysisResult?.resumeText || (skillsList || []).join(', '),
        scores: finalProfile.scores,
        skills: skillsList,
        education: educationList,
        experience: experienceList,
        careerData: {
          targetRole,
          recommendedRoles: [targetRole],
          careerRecommendations: { targetIndustry, experienceLevel }
        }
      });
    } catch (persistErr) {
      console.warn('Supabase wizard persistence notice:', persistErr);
    }

    if (onComplete) {
      onComplete();
    }
  };

  // Stepper metadata
  const stepsMeta = [
    { num: 1, label: 'Resume Upload' },
    { num: 2, label: 'Profile Review' },
    { num: 3, label: 'Career Vision' },
    { num: 4, label: 'Career Path' },
    { num: 5, label: 'Skill Gap Analysis' }
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
                onClick={() => {
                  if (s.num === currentStep) return;
                  if (isDone || (uploadFile && uploadProgress === 3 && s.num <= 2)) {
                    validateAndProceed(s.num);
                  }
                }}
                className={`flex items-center gap-2 cursor-pointer select-none transition-all ${
                  isActive 
                    ? 'text-[#0f766e] font-semibold' 
                    : (isDone || (uploadFile && uploadProgress === 3 && s.num <= 2))
                    ? 'text-[#0f766e] font-medium' 
                    : 'text-slate-400 font-normal'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive 
                    ? 'border-2 border-[#0f766e] bg-white text-[#0f766e] shadow-sm ring-4 ring-[#0f766e]/10' 
                    : isDone 
                    ? 'bg-[#0f766e] text-white' 
                    : (uploadFile && uploadProgress === 3 && s.num <= 2)
                    ? 'border border-[#0f766e] bg-white text-[#0f766e]'
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
                {uploadError ? (
                  <span className="text-rose-600 font-medium">❌ Upload failed. Please try uploading again.</span>
                ) : !uploadFile ? (
                  <span className="text-amber-600 font-medium">⚠️ Please upload your resume above to continue.</span>
                ) : isParsing ? (
                  <span className="text-emerald-600 font-medium animate-pulse">⏳ Parsing resume details & internships...</span>
                ) : uploadProgress === 3 ? (
                  <span className="text-emerald-700 font-medium">✓ Resume ready for review</span>
                ) : null}
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

            {/* Profile Review: Prompt asking user to fill up their name */}
            <div className="bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-teal-50/90 border border-teal-200 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3.5 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#0f766e] text-white flex items-center justify-center font-bold flex-shrink-0 text-sm shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Please Enter Your Name
                    {(!firstName.trim() || !lastName.trim()) && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fill up your <strong>First Name</strong> and <strong>Last Name</strong> below to complete your profile review and personalize your roadmap & verified certificates.
                  </p>
                </div>
              </div>
              {(!firstName.trim() || !lastName.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    setModalFirstName(firstName);
                    setModalLastName(lastName);
                    setIsNameModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#0f766e] hover:bg-[#0d594f] text-white text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Enter Name</span>
                </button>
              )}
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
                    ref={firstNameInputRef}
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setStepErrors(prev => ({ ...prev, firstName: null })); }}
                    placeholder="Enter your first name (e.g. Sajid)"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors ${
                      stepErrors.firstName ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-slate-300 focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20'
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
                    placeholder="Enter your last name (e.g. Ahmed)"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors ${
                      stepErrors.lastName ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-slate-300 focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20'
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Role Specialization <span className="text-rose-500">*</span>
                </label>
                {targetRole ? (
                  <span className="text-xs font-semibold text-[#0f766e] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {targetRole}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium">Please select 1 role *</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAREER_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setTargetRole(role);
                      if (stepErrors.targetRole) {
                        setStepErrors(prev => ({ ...prev, targetRole: '' }));
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      targetRole === role 
                        ? 'border-[#0f766e] bg-[#eefaf4] text-[#0f766e] font-bold shadow-sm ring-2 ring-[#0f766e]/20' 
                        : stepErrors.targetRole
                        ? 'border-rose-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{role}</span>
                    {targetRole === role && <CheckCircle2 className="w-4 h-4 text-[#0f766e]" />}
                  </button>
                ))}
              </div>
              {stepErrors.targetRole && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{stepErrors.targetRole}</span>
                </div>
              )}
            </div>

            {/* Experience Level & Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Industry Sector <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetIndustry}
                  onChange={(e) => {
                    setTargetIndustry(e.target.value);
                    if (stepErrors.targetIndustry) {
                      setStepErrors(prev => ({ ...prev, targetIndustry: '' }));
                    }
                  }}
                  className={`w-full bg-white border ${
                    stepErrors.targetIndustry 
                      ? 'border-rose-400 ring-2 ring-rose-200' 
                      : targetIndustry
                      ? 'border-[#0f766e] ring-1 ring-[#0f766e]/20'
                      : 'border-slate-200'
                  } rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f766e] cursor-pointer`}
                >
                  <option value="" disabled>-- Select Target Industry Sector * --</option>
                  {TARGET_INDUSTRY_OPTIONS.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {stepErrors.targetIndustry && (
                  <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{stepErrors.targetIndustry}</span>
                  </p>
                )}
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Primary Objective <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Write manually</span>
              </div>
              <textarea
                rows={3}
                value={visionGoals}
                onChange={(e) => {
                  setVisionGoals(e.target.value);
                  if (stepErrors.visionGoals) {
                    setStepErrors(prev => ({ ...prev, visionGoals: '' }));
                  }
                }}
                placeholder="Write your primary career objective here (e.g. your dream job role, target companies, key technologies you want to master, or milestones for the next 6-12 months)..."
                className={`w-full bg-white border ${
                  stepErrors.visionGoals 
                    ? 'border-rose-400 ring-2 ring-rose-200' 
                    : visionGoals.trim()
                    ? 'border-[#0f766e] ring-1 ring-[#0f766e]/20'
                    : 'border-slate-200'
                } rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0f766e]`}
              />
              {stepErrors.visionGoals && (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{stepErrors.visionGoals}</span>
                </p>
              )}
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
                onClick={() => setCurrentStep(5)}
                className="px-8 py-3.5 rounded-xl bg-[#0f766e] hover:bg-[#0d594f] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Continue to Skill Gap Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 5: SKILL GAP ANALYSIS */}
        {/* ===================================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d5f5e9] border border-[#aeead4] text-[#0f766e] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Skill Gap Evaluation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Skill Gap Analysis for {targetRole}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Detailed benchmark of your uploaded resume against real-world industry requirements.
              </p>
            </div>

            <SkillGapDashboard 
              profile={{
                ...currentUser,
                name: `${firstName.trim()} ${lastName.trim()}`.trim() || 'Candidate',
                careerGoal: targetRole,
                skills: skillsList,
                education: educationList,
                experience: experienceList,
                hasUploadedResume: Boolean(uploadFile || uploadProgress === 3),
                resumeFileName: uploadFile?.name || (uploadProgress === 3 ? (analysisResult?.fileName || 'Uploaded_Resume.pdf') : 'Uploaded_Resume.pdf'),
                resumeText: (skillsList || []).join(', ')
              }}
            />

            {/* Launch Workspace CTA */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Career Path</span>
              </button>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="px-8 py-3.5 rounded-xl bg-[#0f766e] hover:bg-[#0d594f] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Finish Profile Setup & Launch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* NAME INPUT POPUP MODAL (MANDATORY USER NAME ENTRY & STRIKE NOTIFICATION) */}
      {/* ===================================================================== */}
      {isNameModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={handleDismissNameModal}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all ${
              nameModalShake ? 'animate-shake' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="name-modal-title"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-700 via-[#0f766e] to-emerald-700 p-5 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="name-modal-title" className="text-base font-bold text-white tracking-tight">
                    Please Enter Your Name
                  </h3>
                  <p className="text-[11px] text-teal-100 font-medium">
                    Personal Information Required
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissNameModal}
                className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Striking Notification Banner */}
            {nameModalError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-shake shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{nameModalError}</span>
              </div>
            )}

            {/* Modal Body Form */}
            <form onSubmit={handleConfirmNameModal} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Please enter your full identity. We require your <strong>First Name</strong> and <strong>Last Name</strong> to personalize your career roadmap, skill gap analysis, and verified certificates.
              </p>

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={modalFirstInputRef}
                    type="text"
                    value={modalFirstName}
                    onChange={(e) => {
                      setModalFirstName(e.target.value);
                      if (nameModalError) setNameModalError('');
                    }}
                    placeholder="Enter your first name (e.g. Sajid)"
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none transition-colors ${
                      nameModalError && !modalFirstName.trim()
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-300 focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalLastName}
                    onChange={(e) => {
                      setModalLastName(e.target.value);
                      if (nameModalError) setNameModalError('');
                    }}
                    placeholder="Enter your last name (e.g. Ahmed)"
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none transition-colors ${
                      nameModalError && !modalLastName.trim()
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-300 focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#0f766e] hover:bg-[#0d594f] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Confirm Name & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

