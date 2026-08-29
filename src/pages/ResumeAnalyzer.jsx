// agent-notes: { ctx: "Clean & modern tabbed ResumeAnalyzer page with complete feature set preserved", deps: ["react", "lucide-react", "../components/resume/*", "../services/resumeApi"], state: "active", last: "anti@2026-08-08" }
import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, Download, Trophy, AlertCircle, Target, Award, LayoutGrid, Layers, RefreshCw, CheckCircle2, GraduationCap, Briefcase } from 'lucide-react';

import UploadResume from '../components/resume/UploadResume';
import ResumeScore from '../components/resume/ResumeScore';
import GrammarIssues from '../components/resume/GrammarIssues';
import ResumeProblems from '../components/resume/ResumeProblems';
import ATSAnalysis from '../components/resume/ATSAnalysis';
import SkillGap from '../components/resume/SkillGap';
import SkillBridgeProgress from '../components/resume/SkillBridgeProgress';
import VerifiedSkills from '../components/resume/VerifiedSkills';
import CertificateList from '../components/resume/CertificateList';
import ResumePreview from '../components/resume/ResumePreview';
import DownloadResume from '../components/resume/DownloadResume';
import SkillVerificationModal from '../components/resume/SkillVerificationModal';
import ResumeSuggestionCard from '../components/resume/ResumeSuggestionCard';
import FinalMasteryDashboard from '../components/resume/FinalMasteryDashboard';
import TargetPipelineFlow from '../components/resume/TargetPipelineFlow';

import { uploadResume, applyProblemFix } from '../services/resumeApi';
import { downloadResumeAsPdf } from '../utils/resumePdfGenerator';
import '../styles/ResumeAnalyzer.css';

const getInitialResumeState = (profile) => {
  if (!profile?.hasUploadedResume && !profile?.resumeId) {
    try {
      localStorage.removeItem('sb_resume_analysis');
      localStorage.removeItem('sb_active_resume_id');
      localStorage.removeItem('sb_resume_text');
    } catch {}
    return null;
  }
  try {
    const userKey = `sb_resume_analysis_${profile?.id || profile?.email || 'user'}`;
    const savedStr = localStorage.getItem(userKey) || localStorage.getItem('sb_resume_analysis');
    if (savedStr) {
      const parsed = JSON.parse(savedStr);
      if (parsed && typeof parsed === 'object' && parsed.analyzed && parsed.selectedFile && parsed.selectedFile?.name && parsed.selectedFile.name !== 'Uploaded_Resume.pdf') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse sb_resume_analysis:', e);
  }
  return null;
};

export default function ResumeAnalyzer({ profile, setProfile, onNavigate }) {
  const savedState = getInitialResumeState(profile);

  const [activeTab, setActiveTab] = useState(savedState?.activeTab || 'overview'); // 'overview' | 'issues' | 'skills' | 'certs'
  const [viewMode, setViewMode] = useState(savedState?.viewMode || 'tabs'); // 'tabs' | 'scroll'
  
  const [analyzed, setAnalyzed] = useState(() => Boolean(savedState?.analyzed && savedState?.selectedFile));
  const [parsing, setParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(() => savedState?.selectedFile || null);
  const [showPreview, setShowPreview] = useState(false);
  const [verifyingSkillName, setVerifyingSkillName] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Clear any residual demo data if profile does not have an uploaded resume
  useEffect(() => {
    if (!profile?.hasUploadedResume && !profile?.resumeId) {
      setAnalyzed(false);
      setSelectedFile(null);
      setProblems([]);
      setGrammarIssues([]);
      setAtsProblems([]);
      setSkillsStatus([]);
      setCertificates([]);
      setPendingSuggestion(null);
      setApiResumeScore(null);
      setApiAtsScore(null);
      setApiGrammarScore(null);
      try {
        localStorage.removeItem('sb_resume_analysis');
        localStorage.removeItem('sb_active_resume_id');
        localStorage.removeItem('sb_resume_text');
      } catch {}
    }
  }, [profile?.id, profile?.email, profile?.hasUploadedResume, profile?.resumeId]);
  
  // Pending AI Suggestion Review State
  const [pendingSuggestion, setPendingSuggestion] = useState(() => savedState?.pendingSuggestion || null);

  const [education, setEducation] = useState(() => savedState?.education || []);
  const [experience, setExperience] = useState(() => savedState?.experience || []);
  const [hasExperience, setHasExperience] = useState(() => savedState?.hasExperience ?? false);
  const [hasEducation, setHasEducation] = useState(() => savedState?.hasEducation ?? false);
  const [experienceAnalysis, setExperienceAnalysis] = useState(() => savedState?.experienceAnalysis || null);
  const [educationAnalysis, setEducationAnalysis] = useState(() => savedState?.educationAnalysis || null);

  const [problems, setProblems] = useState(() => savedState?.problems || []);
  const [grammarIssues, setGrammarIssues] = useState(() => savedState?.grammarIssues || []);
  const [atsProblems, setAtsProblems] = useState(() => savedState?.atsProblems || []);
  const [skillsStatus, setSkillsStatus] = useState(() => savedState?.skillsStatus || []);
  const [certificates, setCertificates] = useState(() => savedState?.certificates || []);

  const fixedCount = problems.filter(p => p.fixed).length;
  const gainedCount = skillsStatus.filter(s => s.status === 'GAINED').length;
  const unfixedProblemsCount = problems.filter(p => !p.fixed).length;
  const learningSkillsCount = skillsStatus.filter(s => s.status !== 'GAINED').length;
  const certifiedCount = skillsStatus.filter(s => s.certified || s.status === 'GAINED').length;

  const is100PercentComplete = skillsStatus.length > 0 && skillsStatus.every(s => s.status === 'GAINED' || s.progress === 100);

  const [apiResumeScore, setApiResumeScore] = useState(() => savedState?.apiResumeScore || null);
  const [apiAtsScore, setApiAtsScore] = useState(() => savedState?.apiAtsScore || null);
  const [apiGrammarScore, setApiGrammarScore] = useState(() => savedState?.apiGrammarScore || null);

  useEffect(() => {
    if (analyzed && selectedFile) {
      const stateToSave = {
        analyzed,
        selectedFile,
        activeTab,
        viewMode,
        problems,
        grammarIssues,
        atsProblems,
        skillsStatus,
        certificates,
        education,
        experience,
        hasExperience,
        hasEducation,
        experienceAnalysis,
        educationAnalysis,
        apiResumeScore,
        apiAtsScore,
        apiGrammarScore,
        pendingSuggestion
      };
      localStorage.setItem('sb_resume_analysis', JSON.stringify(stateToSave));
    }
  }, [analyzed, selectedFile, activeTab, viewMode, problems, grammarIssues, atsProblems, skillsStatus, certificates, education, experience, hasExperience, hasEducation, experienceAnalysis, educationAnalysis, apiResumeScore, apiAtsScore, apiGrammarScore, pendingSuggestion]);

  const resumeScore = is100PercentComplete ? 100 : (apiResumeScore || Math.min(100, 75 + fixedCount * 8 + gainedCount * 3));
  const atsScore = is100PercentComplete ? 100 : (apiAtsScore || Math.min(100, 72 + fixedCount * 6));
  const grammarScore = is100PercentComplete ? 100 : (apiGrammarScore || Math.min(100, 84 + (problems[0]?.fixed ? 8 : 0)));
  const skillGapScore = Math.round((gainedCount / (skillsStatus.length || 1)) * 100);

  const processAnalysisResult = (data) => {
    if (!data) return;
    const analysis = data.analysis || data || {};
    const overallScore = analysis.scores?.overall || 84;
    const atsScoreVal = analysis.scores?.ats || 81;
    const grammarScoreVal = analysis.scores?.grammar || 72;
    const skillScoreVal = analysis.scores?.skills || 78;
    const resumeId = data.resumeId || analysis.resumeId;
    const resumeText = data.resumeText || "";

    const parsedEdu = Array.isArray(analysis.education) ? analysis.education : [];
    const parsedExp = Array.isArray(analysis.experience) ? analysis.experience : [];
    const isExpFound = Boolean(analysis.hasExperience || parsedExp.length > 0);
    const isEduFound = Boolean(analysis.hasEducation || parsedEdu.length > 0);

    setEducation(parsedEdu);
    setExperience(parsedExp);
    setHasExperience(isExpFound);
    setHasEducation(isEduFound);
    setExperienceAnalysis(analysis.experienceAnalysis || null);
    setEducationAnalysis(analysis.educationAnalysis || null);

    if (resumeId) {
      localStorage.setItem('sb_active_resume_id', resumeId);
    }
    if (resumeText) {
      localStorage.setItem('sb_resume_text', resumeText);
    }
    if (data.fileName) {
      localStorage.setItem('sb_resume_filename', data.fileName);
    }

    if (setProfile) {
      setProfile(prev => ({
        ...prev,
        hasUploadedResume: true,
        resumeId: resumeId || prev?.resumeId,
        resumeText: resumeText || prev?.resumeText,
        resumeFileName: data.fileName || prev?.resumeFileName,
        name: analysis.candidate?.name || prev?.name || 'Aarav Sharma',
        skills: analysis.skills?.detected || prev?.skills || ["HTML", "CSS", "JavaScript"],
        scores: {
          ...prev?.scores,
          resumeScore: overallScore,
          skillScore: skillScoreVal,
          placementReadiness: atsScoreVal,
          interviewReadiness: grammarScoreVal
        }
      }));
    }

    if (analysis.scores) {
      if (analysis.scores.overall) setApiResumeScore(analysis.scores.overall);
      if (analysis.scores.ats) setApiAtsScore(analysis.scores.ats);
      if (analysis.scores.grammar) setApiGrammarScore(analysis.scores.grammar);
    } else {
      setApiResumeScore(overallScore);
      setApiAtsScore(atsScoreVal);
      setApiGrammarScore(grammarScoreVal);
    }

    if (analysis.grammarIssues && Array.isArray(analysis.grammarIssues) && analysis.grammarIssues.length > 0) {
      setGrammarIssues(analysis.grammarIssues.map((g, idx) => ({
        id: idx + 1,
        severity: g.severity || 'medium',
        original: g.original || 'Original text',
        problem: g.problem || 'Grammar issue identified',
        correction: g.correction || g.suggested || 'Suggested correction'
      })));
    } else {
      setGrammarIssues([
        {
          id: 1,
          severity: "medium",
          original: "Responsible for managing web apps and backend services.",
          problem: "Weak action verb without quantifiable impact metrics.",
          correction: "Architected scalable full-stack web applications handling 50k+ active users."
        }
      ]);
    }

    if (analysis.atsProblems && Array.isArray(analysis.atsProblems)) {
      setAtsProblems(analysis.atsProblems);
    } else {
      setAtsProblems([{ problem: "Missing links", suggestion: "Add GitHub portfolio link" }]);
    }

    if (analysis.resumeProblems && Array.isArray(analysis.resumeProblems) && analysis.resumeProblems.length > 0) {
      setProblems(analysis.resumeProblems.map((p, idx) => ({
        id: idx + 1,
        problem: p.problem || "Resume section needs optimization",
        original: p.original || p.section || "Original phrasing",
        suggested: p.suggestion || p.suggested || "Suggested improvement",
        fixed: false
      })));
    } else {
      setProblems([
        {
          id: 1,
          problem: "Quantifiable impact metrics missing from work experience",
          original: "Responsible for developing web applications using React.",
          suggested: "Developed responsive React applications improving user engagement by 35%.",
          fixed: false
        },
        {
          id: 2,
          problem: "Missing portfolio / proof of work link in header",
          original: "GitHub / Portfolio URL missing",
          suggested: "Add GitHub profile link to contact header",
          fixed: false
        }
      ]);
    }

    if (analysis.skills) {
      const detected = analysis.skills.detected || [];
      const missing = analysis.skills.missing || [];
      const weak = analysis.skills.weak || [];

      const newSkills = [
        ...detected.map(name => ({ name, status: 'GAINED', progress: 100, certified: true })),
        ...weak.map(name => ({ name, status: 'LEARNING', progress: 60, certified: false })),
        ...missing.map(name => ({ name, status: 'MISSING', progress: 20, certified: false }))
      ];

      if (newSkills.length > 0) {
        setSkillsStatus(newSkills);
      }
    } else {
      setSkillsStatus([
        { name: "HTML", status: "GAINED", progress: 100, certified: true },
        { name: "CSS", status: "GAINED", progress: 100, certified: true },
        { name: "JavaScript", status: "GAINED", progress: 100, certified: true },
        { name: "React", status: "LEARNING", progress: 75, certified: false },
        { name: "Node.js", status: "LEARNING", progress: 40, certified: false }
      ]);
    }

    setCertificates([
      { skillName: "HTML", certificateCode: "CERT-HTML-839201" },
      { skillName: "CSS", certificateCode: "CERT-CSS-482910" },
      { skillName: "JavaScript", certificateCode: "CERT-JS-918234" }
    ]);

    setAnalyzed(true);
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setParsing(true);
    try {
      const res = await uploadResume(file, profile?.careerGoal || "Full Stack Developer");
      if (res) {
        processAnalysisResult(res);
      } else {
        processAnalysisResult({ analysis: {} });
      }
    } catch (err) {
      console.error("Resume analysis API error:", err);
      processAnalysisResult({ analysis: {} });
    } finally {
      setParsing(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedFile({ name: `${preset.name.replace(/\s+/g, '_')}_Resume.pdf` });
    if (setProfile) setProfile(preset);
    processAnalysisResult({
      analysis: {
        candidate: { name: preset.name },
        scores: { overall: 80, ats: 76, grammar: 88, format: 85, skills: 60, projects: 75 },
        skills: {
          detected: preset.skills || ["HTML", "CSS", "JavaScript"],
          weak: ["React", "Node.js"],
          missing: ["MongoDB"]
        }
      }
    });
  };

  const handleApplyFix = async (problemId) => {
    await applyProblemFix(problemId);
    setProblems(prev => {
      const nextProblems = prev.map(p => p.id === problemId ? { ...p, fixed: true } : p);
      const remainingUnfixed = nextProblems.filter(p => !p.fixed).length;
      
      setToastMessage("Fix applied! Automatically advancing to Next Task (Skill Gap & Bridge)...");
      setTimeout(() => {
        setActiveTab('skills');
        setToastMessage(null);
      }, 1000);

      return nextProblems;
    });
  };

  const handleOpenVerification = (skillName) => {
    setVerifyingSkillName(skillName);
  };

  const handleCompleteVerification = ({ skillName, certificateCode }) => {
    const structuredPatch = {
      skillName,
      certificateCode,
      patch: {
        changes: [
          {
            section: "Skills",
            action: "add",
            value: skillName,
            reason: "Verified through Skill Bridge"
          },
          {
            section: "Projects",
            action: "update",
            original: "Personal Web Application",
            updated: `Production ${skillName} application with automated test coverage`,
            reason: `${skillName} skill verified`
          }
        ]
      }
    };

    setPendingSuggestion(structuredPatch);
  };

  const handleApplyAllSuggestions = () => {
    if (!pendingSuggestion) return;
    const { skillName, certificateCode } = pendingSuggestion;

    setSkillsStatus(prev => {
      const updated = prev.map(s => {
        if (s.name.toLowerCase() === skillName.toLowerCase()) {
          return {
            ...s,
            progress: 100,
            status: 'GAINED',
            certified: true
          };
        }
        return s;
      });

      const allDone = updated.every(s => s.status === 'GAINED' || s.progress === 100);
      setToastMessage(allDone ? "All skills verified! Moving to Final Certificates..." : `Applied suggestions for ${skillName}! Moving to next task...`);
      setTimeout(() => {
        setActiveTab(allDone ? 'certs' : 'skills');
        setToastMessage(null);
      }, 1000);

      return updated;
    });

    setCertificates(prev => [
      ...prev,
      { skillName, certificateCode }
    ]);

    setPendingSuggestion(null);
  };

  const handleRejectSuggestion = () => {
    setPendingSuggestion(null);
  };

  const handleSimulateFullMastery = () => {
    setSkillsStatus(prev => prev.map(s => ({
      ...s,
      progress: 100,
      status: 'GAINED',
      certified: true
    })));
  };

  const handleResetDemo = () => {
    setSkillsStatus([
      { name: "HTML", status: "GAINED", progress: 100, certified: true },
      { name: "CSS", status: "GAINED", progress: 100, certified: true },
      { name: "JavaScript", status: "GAINED", progress: 100, certified: true },
      { name: "React", status: "LEARNING", progress: 75, certified: false },
      { name: "Node.js", status: "LEARNING", progress: 40, certified: false },
      { name: "MongoDB", status: "MISSING", progress: 15, certified: false },
    ]);
    setProblems([
      {
        id: 1,
        problem: "Weak action statement lacking quantifiable impact",
        original: '"Responsible for developing web applications using React."',
        suggested: '"Developed responsive React applications improving user engagement by 35%."',
        fixed: false
      },
      {
        id: 2,
        problem: "Missing proof of work / open source contributions link",
        original: 'GitHub / Portfolio link missing from contact header',
        suggested: 'Add GitHub profile URL: https://github.com/developer-profile',
        fixed: false
      }
    ]);
    setPendingSuggestion(null);
  };

  const handleDownload = () => {
    downloadResumeAsPdf({
      profile,
      skillsStatus,
      problems,
      certificates
    });
  };

  const handleUploadNew = () => {
    setAnalyzed(false);
    setSelectedFile(null);
    setProblems([]);
    setGrammarIssues([]);
    setAtsProblems([]);
    setSkillsStatus([]);
    setCertificates([]);
    setPendingSuggestion(null);
    setApiResumeScore(null);
    setApiAtsScore(null);
    setApiGrammarScore(null);
    localStorage.removeItem('sb_resume_analysis');
    localStorage.removeItem('sb_active_resume_id');
    localStorage.removeItem('sb_resume_text');
    setActiveTab('overview');
  };

  const currentStage = is100PercentComplete ? 9 : (pendingSuggestion ? 7 : (verifyingSkillName ? 5 : (selectedFile ? 3 : 1)));

  const handleStepClick = (step) => {
    if (step.tab) {
      setActiveTab(step.tab);
    }
    setTimeout(() => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollBy({ top: 380, behavior: 'smooth' });
      }
    }, 80);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 resume-analyzer-page text-slate-900">
      {/* Header Bar */}
      <div className="saas-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> AI Resume Analyzer
            </h1>
            <span className="saas-badge text-[11px]">
              Full Stack Target
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Candidate: <strong className="text-slate-900">{profile?.name || 'Aarav Sharma'}</strong> — Upload, optimize, verify skills & generate certified resumes
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {analyzed && (
            <button 
              onClick={handleUploadNew}
              className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5"
              title="Upload another resume"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload New Resume</span>
            </button>
          )}

          <button 
            onClick={() => setViewMode(prev => prev === 'tabs' ? 'scroll' : 'tabs')}
            className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5"
            title="Toggle between Tabbed and Full Scroll layouts"
          >
            {viewMode === 'tabs' ? <Layers className="w-3.5 h-3.5 text-slate-500" /> : <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />}
            <span>{viewMode === 'tabs' ? 'Tabbed View' : 'All Sections'}</span>
          </button>

          {!is100PercentComplete ? (
            <button 
              onClick={handleSimulateFullMastery} 
              className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> 100% Mastery
            </button>
          ) : (
            <button 
              onClick={handleResetDemo}
              className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Reset Demo
            </button>
          )}

          <button onClick={() => setShowPreview(true)} className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview
          </button>
          <button onClick={handleDownload} className="saas-btn-primary py-1.5 px-3.5 text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>

      {/* Target Pipeline Flow Banner */}
      <TargetPipelineFlow currentStage={currentStage} onStepClick={handleStepClick} />

      {/* Auto Progression Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {toastMessage}
          </span>
          <span className="saas-badge saas-badge-success text-[10px]">
            Advancing ›
          </span>
        </div>
      )}

      {/* Render 100% Final Mastery Dashboard if candidate reaches 100% */}
      {is100PercentComplete && (
        <FinalMasteryDashboard 
          targetRole="Full Stack Developer"
          skillsStatus={skillsStatus}
          onPreviewResume={() => setShowPreview(true)}
          onDownloadFinalResume={handleDownload}
          onDownloadCertificates={handleDownload}
        />
      )}

      {/* Navigation Tabs Header */}
      {viewMode === 'tabs' && (
        <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview & Upload</span>
            {pendingSuggestion && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'issues'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Issues & Fixes</span>
            {unfixedProblemsCount > 0 && (
              <span className="saas-badge saas-badge-warning text-[10px]">
                {unfixedProblemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'skills'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Skill Gap</span>
            {learningSkillsCount > 0 && (
              <span className="saas-badge text-[10px]">
                {learningSkillsCount} learning
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('certs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'certs'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certificates & Export</span>
            <span className="saas-badge saas-badge-success text-[10px]">
              {certifiedCount}
            </span>
          </button>
        </div>
      )}

      {/* Pending AI Suggestion Card */}
      {pendingSuggestion && (
        <ResumeSuggestionCard
          patch={pendingSuggestion.patch}
          onApplyAllSuggestions={handleApplyAllSuggestions}
          onReject={handleRejectSuggestion}
        />
      )}

      {/* VIEW MODE: TABBED LAYOUT */}
      {viewMode === 'tabs' ? (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW & UPLOAD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {!analyzed ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <UploadResume 
                      onFileSelect={handleFileSelect} 
                      onAnalysis={processAnalysisResult}
                      parsing={parsing} 
                      selectedFile={selectedFile} 
                      onSelectPreset={handleSelectPreset} 
                      analyzed={analyzed}
                      profile={profile}
                    />
                  </div>
                  <div className="lg:col-span-5 saas-card p-6 flex flex-col justify-center items-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Upload Resume for Analysis</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                      Upload your PDF or DOCX resume to analyze ATS compatibility, formatting quality, grammar nuances, and skill requirements.
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Evaluated against current industry role benchmarks.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <ResumeScore 
                    resumeScore={resumeScore} 
                    atsScore={atsScore} 
                    grammarScore={grammarScore} 
                    skillGapScore={skillGapScore} 
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6">
                      <UploadResume 
                        onFileSelect={handleFileSelect} 
                        onAnalysis={processAnalysisResult}
                        parsing={parsing} 
                        selectedFile={selectedFile} 
                        onSelectPreset={handleSelectPreset} 
                        analyzed={analyzed}
                        profile={profile}
                      />
                    </div>
                    <div className="lg:col-span-6 saas-card p-5 space-y-3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                          Audit Summary
                        </h3>
                        <div className="space-y-3">
                          <GrammarIssues issues={grammarIssues} isFixed={problems[0]?.fixed} />
                          <ATSAnalysis warningsCount={atsProblems.length || 2} isFixed={problems[1]?.fixed} />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                        <span className="text-indigo-900 font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          {unfixedProblemsCount > 0 ? `${unfixedProblemsCount} fixes available` : 'All issues fixed'}
                        </span>
                        <button 
                          onClick={() => setActiveTab(unfixedProblemsCount > 0 ? 'issues' : 'skills')} 
                          className="saas-btn-primary py-1 px-3 text-xs"
                        >
                          {unfixedProblemsCount > 0 ? 'Review Fixes ›' : 'View Skills ›'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scanned Education & Experience Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    {/* 1. Scanned Education Analysis */}
                    <div className="lg:col-span-6 saas-card p-5 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Scanned Education Analysis
                            </h3>
                            <span className="text-[11px] text-slate-500">Degree & Institution Verification</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          hasEducation ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {hasEducation ? `${education.length} Detected` : 'Not Listed'}
                        </span>
                      </div>

                      {hasEducation && education.length > 0 ? (
                        <div className="space-y-3">
                          {education.map((edu, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{edu.school || 'University / College'}</h4>
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                  {edu.year || '2025'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 font-medium">
                                {edu.degree || 'Degree Program'} • {edu.field || 'Computer Science'}
                              </p>
                            </div>
                          ))}
                          <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Education background qualifies for technical roles.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                          <p className="text-xs font-semibold text-slate-700">No Education Section Detected</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            No university or degree was found in your resume text. Adding your degree enhances ATS parsing.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 2. Scanned Work Experience Analysis */}
                    <div className="lg:col-span-6 saas-card p-5 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Work Experience Analysis
                            </h3>
                            <span className="text-[11px] text-slate-500">Employment & Internship History</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          hasExperience ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {hasExperience ? `${experience.length} Role(s)` : 'Fresher (0 Years)'}
                        </span>
                      </div>

                      {hasExperience && experience.length > 0 ? (
                        <div className="space-y-3">
                          {experience.map((exp, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{exp.role || 'Software Role'}</h4>
                                <span className="text-[10px] font-medium text-slate-500">{exp.duration || 'Past'}</span>
                              </div>
                              <p className="text-[11px] text-slate-700 font-semibold">{exp.company || 'Company'}</p>
                              {exp.description && (
                                <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>No Work Experience Detected (Fresher)</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            No employment history was detected in your uploaded resume. Your profile is evaluated as a <strong>Fresher / Student Candidate</strong>.
                          </p>
                          <div className="pt-1 text-[11px] text-amber-900 font-medium space-y-1 bg-white/70 p-2.5 rounded-lg border border-amber-200/60">
                            <p className="font-bold text-[10px] uppercase tracking-wider text-amber-800">Tips to stand out as a Fresher:</p>
                            <p>• Highlight 2-3 technical personal projects with live GitHub links.</p>
                            <p>• Earn verified skill certificates in the SkillBridge lab.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: ISSUES & FIXES */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
              {!analyzed ? (
                <div className="saas-card p-8 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-900">No Resume Uploaded</h3>
                  <p className="text-xs text-slate-500">Please upload your resume to view issues and suggestions.</p>
                  <button onClick={() => setActiveTab('overview')} className="saas-btn-primary py-1.5 px-4 text-xs font-medium">
                    Go to Upload
                  </button>
                </div>
              ) : (
                <>
                  <ResumeProblems problems={problems} onApplyFix={handleApplyFix} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GrammarIssues issues={grammarIssues} isFixed={problems[0]?.fixed} />
                    <div className="saas-card p-5 space-y-3">
                      <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        ATS Format Compliance
                      </h3>
                      <ATSAnalysis warningsCount={atsProblems.length || 2} isFixed={problems[1]?.fixed} />
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                        <div>✓ Standard embedded typography</div>
                        <div>✓ Single column hierarchical layout</div>
                        <div>{problems[1]?.fixed ? '✓ Contact & portfolio header verified' : '⚠ Missing online portfolio link'}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: SKILL GAP & BRIDGE */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {!analyzed ? (
                <div className="saas-card p-8 text-center space-y-3">
                  <Target className="w-8 h-8 text-indigo-600 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-900">No Resume Uploaded</h3>
                  <p className="text-xs text-slate-500">Please upload your resume to generate your Skill Gap breakdown.</p>
                  <button onClick={() => setActiveTab('overview')} className="saas-btn-primary py-1.5 px-4 text-xs font-medium">
                    Go to Upload
                  </button>
                </div>
              ) : (
                <>
                  <SkillGap 
                    skillsStatus={skillsStatus} 
                    onOpenSkillBridge={() => onNavigate && onNavigate('job')} 
                    onOpenVerification={handleOpenVerification}
                  />
                  <SkillBridgeProgress 
                    skillsStatus={skillsStatus} 
                    onOpenVerification={handleOpenVerification} 
                  />
                </>
              )}
            </div>
          )}

          {/* TAB 4: VERIFIED CERTS & EXPORT */}
          {activeTab === 'certs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VerifiedSkills skillsStatus={skillsStatus} />
                <CertificateList certificates={certificates} candidateName={profile?.name || "Aarav Sharma"} />
              </div>
              <DownloadResume skillsStatus={skillsStatus} onPreview={() => setShowPreview(true)} onDownload={handleDownload} />
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE: ALL SECTIONS (SCROLLABLE VIEW) */
        <div className="space-y-6">
          {!analyzed ? (
            <div className="saas-card p-8 text-center space-y-4">
              <Sparkles className="w-8 h-8 text-indigo-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">Upload Your Resume to Start</h3>
              <p className="text-xs text-slate-500">Scores, ATS checks, and grammar issues will be calculated automatically.</p>
              <UploadResume 
                onFileSelect={handleFileSelect} 
                onAnalysis={processAnalysisResult}
                parsing={parsing} 
                selectedFile={selectedFile} 
                onSelectPreset={handleSelectPreset} 
                analyzed={analyzed}
                profile={profile}
              />
            </div>
          ) : (
            <>
              <ResumeScore 
                resumeScore={resumeScore} 
                atsScore={atsScore} 
                grammarScore={grammarScore} 
                skillGapScore={skillGapScore} 
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <UploadResume 
                    onFileSelect={handleFileSelect} 
                    onAnalysis={processAnalysisResult}
                    parsing={parsing} 
                    selectedFile={selectedFile} 
                    onSelectPreset={handleSelectPreset} 
                    analyzed={analyzed}
                    profile={profile}
                  />
                </div>
                <div className="lg:col-span-6 saas-card p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Audit Overview
                  </h3>
                  <GrammarIssues issues={grammarIssues} isFixed={problems[0]?.fixed} />
                  <ATSAnalysis warningsCount={atsProblems.length || 2} isFixed={problems[1]?.fixed} />
                </div>
              </div>

              <ResumeProblems problems={problems} onApplyFix={handleApplyFix} />
              
              <SkillGap skillsStatus={skillsStatus} onOpenSkillBridge={() => onNavigate && onNavigate('job')} />
              
              <SkillBridgeProgress 
                skillsStatus={skillsStatus} 
                onOpenVerification={handleOpenVerification} 
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VerifiedSkills skillsStatus={skillsStatus} />
                <CertificateList certificates={certificates} candidateName={profile?.name || "Aarav Sharma"} />
              </div>

              <DownloadResume skillsStatus={skillsStatus} onPreview={() => setShowPreview(true)} onDownload={handleDownload} />
            </>
          )}
        </div>
      )}

      {/* Skill Verification Pipeline Modal */}
      {verifyingSkillName && (
        <SkillVerificationModal
          skillName={verifyingSkillName}
          onClose={() => setVerifyingSkillName(null)}
          onCompleteVerification={handleCompleteVerification}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <ResumePreview 
          profile={profile} 
          skillsStatus={skillsStatus} 
          problems={problems} 
          onClose={() => setShowPreview(false)} 
          onDownload={() => { setShowPreview(false); handleDownload(); }} 
        />
      )}
    </div>
  );
}

