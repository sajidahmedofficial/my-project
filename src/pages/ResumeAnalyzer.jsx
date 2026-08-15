// agent-notes: { ctx: "Clean & modern tabbed ResumeAnalyzer page with complete feature set preserved", deps: ["react", "lucide-react", "../components/resume/*", "../services/resumeApi"], state: "active", last: "anti@2026-08-08" }
import React, { useState } from 'react';
import { Sparkles, Eye, Download, Trophy, AlertCircle, Target, Award, LayoutGrid, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';

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
import '../styles/ResumeAnalyzer.css';

export default function ResumeAnalyzer({ profile, setProfile, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'issues' | 'skills' | 'certs'
  const [viewMode, setViewMode] = useState('tabs'); // 'tabs' | 'scroll'
  
  const [parsing, setParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [verifyingSkillName, setVerifyingSkillName] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Pending AI Suggestion Review State
  const [pendingSuggestion, setPendingSuggestion] = useState(null);

  const [problems, setProblems] = useState([
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

  const [skillsStatus, setSkillsStatus] = useState([
    { name: "HTML", status: "GAINED", progress: 100, certified: true },
    { name: "CSS", status: "GAINED", progress: 100, certified: true },
    { name: "JavaScript", status: "GAINED", progress: 100, certified: true },
    { name: "React", status: "LEARNING", progress: 75, certified: false },
    { name: "Node.js", status: "LEARNING", progress: 40, certified: false },
    { name: "MongoDB", status: "MISSING", progress: 15, certified: false },
  ]);

  const [certificates, setCertificates] = useState([
    { skillName: "HTML", certificateCode: "CERT-HTML-839201" },
    { skillName: "CSS", certificateCode: "CERT-CSS-482910" },
    { skillName: "JavaScript", certificateCode: "CERT-JS-918234" }
  ]);

  const fixedCount = problems.filter(p => p.fixed).length;
  const gainedCount = skillsStatus.filter(s => s.status === 'GAINED').length;
  const unfixedProblemsCount = problems.filter(p => !p.fixed).length;
  const learningSkillsCount = skillsStatus.filter(s => s.status !== 'GAINED').length;
  const certifiedCount = skillsStatus.filter(s => s.certified || s.status === 'GAINED').length;

  const is100PercentComplete = skillsStatus.length > 0 && skillsStatus.every(s => s.status === 'GAINED' || s.progress === 100);

  const [apiResumeScore, setApiResumeScore] = useState(null);
  const [apiAtsScore, setApiAtsScore] = useState(null);
  const [apiGrammarScore, setApiGrammarScore] = useState(null);

  const resumeScore = is100PercentComplete ? 100 : (apiResumeScore || Math.min(100, 68 + fixedCount * 8 + gainedCount * 4));
  const atsScore = is100PercentComplete ? 100 : (apiAtsScore || Math.min(100, 72 + fixedCount * 6));
  const grammarScore = is100PercentComplete ? 100 : (apiGrammarScore || Math.min(100, 84 + (problems[0]?.fixed ? 8 : 0)));
  const skillGapScore = Math.round((gainedCount / (skillsStatus.length || 1)) * 100);

  const processAnalysisResult = (data) => {
    if (!data) return;
    const analysis = data.analysis || data;
    
    if (analysis.candidate?.name && setProfile) {
      setProfile(prev => ({ ...prev, name: analysis.candidate.name }));
    }

    if (analysis.scores) {
      if (analysis.scores.overall) setApiResumeScore(analysis.scores.overall);
      if (analysis.scores.ats) setApiAtsScore(analysis.scores.ats);
      if (analysis.scores.grammar) setApiGrammarScore(analysis.scores.grammar);
    }

    if (analysis.resumeProblems && Array.isArray(analysis.resumeProblems) && analysis.resumeProblems.length > 0) {
      setProblems(analysis.resumeProblems.map((p, idx) => ({
        id: idx + 1,
        problem: p.problem || "Resume section needs optimization",
        original: p.original || p.section || "Original phrasing",
        suggested: p.suggestion || p.suggested || "Suggested improvement",
        fixed: false
      })));
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
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setParsing(true);
    try {
      const res = await uploadResume(file, profile?.careerGoal || "Full Stack Developer");
      if (res) {
        processAnalysisResult(res);
      }
    } catch (err) {
      console.error("Resume analysis API error:", err);
    } finally {
      setParsing(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedFile({ name: `${preset.name.replace(/\s+/g, '_')}_Resume.pdf` });
    if (setProfile) setProfile(preset);
    if (preset.skills) {
      const presetSkills = [
        ...preset.skills.map(name => ({ name, status: 'GAINED', progress: 100, certified: true })),
        { name: "Node.js", status: "LEARNING", progress: 60, certified: false },
        { name: "MongoDB", status: "MISSING", progress: 20, certified: false }
      ];
      setSkillsStatus(presetSkills);
    }
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
    const content = `
====================================================
           SKILLBRIDGE AI AUTO-UPDATED RESUME
====================================================
Candidate Name: ${profile?.name || 'Aarav Sharma'}
Target Role: Full Stack Developer
Resume Score: ${resumeScore}% | ATS Score: ${atsScore}% | Grammar: ${grammarScore}%

VERIFIED SKILLS (100% MASTERY ✓):
${skillsStatus.filter(s => s.status === 'GAINED').map(s => `• ${s.name} (Certified ✓)`).join('\n')}

APPLIED RESUME IMPROVEMENTS:
✓ Grammar corrected
✓ ATS optimized
✓ Formatting improved
✓ Skills updated
✓ Verified skills added
✓ Projects improved
====================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profile?.name || 'User').replace(/\s+/g, '_')}_Final_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentStage = is100PercentComplete ? 9 : (pendingSuggestion ? 7 : (verifyingSkillName ? 5 : (selectedFile ? 3 : 1)));

  return (
    <div className="space-y-6 animate-fade-in pb-12 resume-analyzer-page">
      {/* Header Bar */}
      <div className="glass rounded-2xl p-6 border border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <Sparkles className="w-6 h-6 text-accent-purple" /> AI RESUME ANALYZER
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-[10px] font-bold uppercase tracking-wider">
              Target: Full Stack Developer
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Candidate: <strong className="text-gray-200">{profile?.name || 'Aarav Sharma'}</strong> — Upload, optimize, verify skills & generate certified resumes
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setViewMode(prev => prev === 'tabs' ? 'scroll' : 'tabs')}
            className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Toggle between Tabbed and Full Scroll layouts"
          >
            {viewMode === 'tabs' ? <Layers className="w-4 h-4 text-accent-pink" /> : <LayoutGrid className="w-4 h-4 text-accent-pink" />}
            {viewMode === 'tabs' ? 'Tabbed View' : 'All Sections View'}
          </button>

          {!is100PercentComplete ? (
            <button 
              onClick={handleSimulateFullMastery} 
              className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/20 transition-all shadow-sm"
            >
              <Trophy className="w-4 h-4 text-amber-300" /> Unlock 100% Mastery
            </button>
          ) : (
            <button 
              onClick={handleResetDemo}
              className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Demo
            </button>
          )}

          <button onClick={() => setShowPreview(true)} className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs font-bold flex items-center gap-1.5 hover:border-accent-purple transition-all">
            <Eye className="w-4 h-4 text-accent-purple" /> Preview
          </button>
          <button onClick={handleDownload} className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-accent-purple/20 transition-all hover:opacity-95">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Target Pipeline Flow Banner */}
      <TargetPipelineFlow currentStage={currentStage} />

      {/* Auto Progression Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-accent-purple/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-between shadow-xl animate-pulse">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase tracking-wider">
            AUTO ADVANCING ›
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
        <div className="flex items-center gap-2 border-b border-gray-800 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Overview & Upload
            {pendingSuggestion && (
              <span className="w-2 h-2 rounded-full bg-accent-pink animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'issues'
                ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Issues & Fixes
            {unfixedProblemsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                {unfixedProblemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'skills'
                ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            Skill Gap & Bridge
            {learningSkillsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                {learningSkillsCount} learning
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('certs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'certs'
                ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-accent-pink" />
            Verified Certs & Export
            <span className="px-2 py-0.5 rounded-full bg-accent-pink/20 text-accent-pink text-[10px] font-black">
              {certifiedCount} certs
            </span>
          </button>
        </div>
      )}

      {/* Pending AI Suggestion Card (Global notification if patch ready) */}
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
            <div className="space-y-6 animate-fade-in">
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
                    parsing={parsing} 
                    selectedFile={selectedFile} 
                    onSelectPreset={handleSelectPreset} 
                  />
                </div>
                <div className="lg:col-span-6 glass rounded-2xl p-6 border border-gray-800 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-accent-pink" /> AI ANALYSIS SUMMARY
                    </h3>
                    <div className="space-y-3">
                      <GrammarIssues issuesCount={8} isFixed={problems[0]?.fixed} />
                      <ATSAnalysis warningsCount={4} isFixed={problems[1]?.fixed} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent-purple" />
                      Quick Action: {unfixedProblemsCount > 0 ? `${unfixedProblemsCount} resume fixes waiting` : 'All issues fixed! Verify skills next.'}
                    </span>
                    <button 
                      onClick={() => setActiveTab(unfixedProblemsCount > 0 ? 'issues' : 'skills')} 
                      className="px-3 py-1 rounded-lg bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-[11px]"
                    >
                      {unfixedProblemsCount > 0 ? 'View Fixes ›' : 'Skill Gap ›'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ISSUES & FIXES */}
          {activeTab === 'issues' && (
            <div className="space-y-6 animate-fade-in">
              <ResumeProblems problems={problems} onApplyFix={handleApplyFix} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GrammarIssues issuesCount={8} isFixed={problems[0]?.fixed} />
                <div className="space-y-4">
                  <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" /> ATS FORMATTING & SCANNER CHECKS
                    </h3>
                    <ATSAnalysis warningsCount={4} isFixed={problems[1]?.fixed} />
                    <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 space-y-1.5">
                      <div className="font-bold text-gray-200">ATS Parsing Verification:</div>
                      <div>✓ Standard PDF font embedded</div>
                      <div>✓ Single column clean structure</div>
                      <div>{problems[1]?.fixed ? '✓ Link header updated' : '⚠ Missing GitHub profile URL link'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILL GAP & BRIDGE */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-fade-in">
              <SkillGap skillsStatus={skillsStatus} onOpenSkillBridge={() => onNavigate && onNavigate('job')} />
              <SkillBridgeProgress 
                skillsStatus={skillsStatus} 
                onOpenVerification={handleOpenVerification} 
              />
            </div>
          )}

          {/* TAB 4: VERIFIED CERTS & EXPORT */}
          {activeTab === 'certs' && (
            <div className="space-y-6 animate-fade-in">
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
        <div className="space-y-8 animate-fade-in">
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
                parsing={parsing} 
                selectedFile={selectedFile} 
                onSelectPreset={handleSelectPreset} 
              />
            </div>
            <div className="lg:col-span-6 glass rounded-2xl p-6 border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-pink" /> AI ANALYSIS SUMMARY
              </h3>
              <GrammarIssues issuesCount={8} isFixed={problems[0]?.fixed} />
              <ATSAnalysis warningsCount={4} isFixed={problems[1]?.fixed} />
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

