// agent-notes: { ctx: "Skill Gap Dashboard connected directly to uploaded resumeId and parsed resume text with detailed evidence citations", deps: ["react", "lucide-react", "../services/skillGapApi"], state: "active", last: "anti@2026-08-20" }
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Map, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Layers, 
  Code2, 
  Database, 
  Wrench, 
  Cloud, 
  RefreshCw, 
  ShieldCheck,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { skillGapApi } from '../services/skillGapApi';

const TARGET_ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "Data Scientist / AI Engineer",
  "DevOps & Cloud Engineer"
];

export default function SkillGapDashboard({ 
  profile, 
  onGenerateRoadmap, 
  onOpenVerification, 
  onNavigate 
}) {
  const [selectedRole, setSelectedRole] = useState(profile?.careerGoal || "Frontend Developer");
  const [customJd, setCustomJd] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");

  // State: 'IDLE' | 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR'
  const [status, setStatus] = useState('IDLE');
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Auto-run analysis whenever target role, resume, or profile skills change
  useEffect(() => {
    runAnalysis(selectedRole, customJd);
  }, [profile?.skills, profile?.resumeId, profile?.resumeText, selectedRole]);

  const runAnalysis = async (targetRole, jdText) => {
    setStatus('LOADING');
    setErrorMessage(null);

    try {
      const userSkills = profile?.skills || [];
      const resumeId = profile?.resumeId || localStorage.getItem('sb_active_resume_id') || "";
      const resumeText = profile?.resumeText || localStorage.getItem('sb_resume_text') || "";
      const activeFileName = profile?.resumeFileName || localStorage.getItem('sb_resume_filename') || "";

      const res = await skillGapApi.analyzeSkillGap({
        resumeId,
        resumeText,
        userSkills,
        targetRole,
        jobDescription: jdText,
        userId: profile?.id || profile?.email || "guest_user"
      });

      if (res && res.report) {
        setReport({
          ...res.report,
          sourceResumeFile: activeFileName
        });
        const hasSkills = (res.report.strongSkills?.length || 0) + (res.report.partialSkills?.length || 0) + (res.report.missingSkills?.length || 0) > 0;
        if (hasSkills) {
          setStatus('SUCCESS');
        } else {
          setStatus('EMPTY');
        }
      } else {
        setStatus('EMPTY');
      }
    } catch (err) {
      console.error("Skill gap analysis error:", err);
      setErrorMessage(err.message || "Unable to analyze skill gap.");
      setStatus('ERROR');
    }
  };

  const handleRoleSelect = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
  };

  const handleTriggerAnalysis = () => {
    runAnalysis(selectedRole, customJd);
  };

  const handleStartRoadmap = (skillName) => {
    const missing = skillName ? [skillName] : (report?.missingSkills || []).map(s => s.skillName);
    if (onGenerateRoadmap) {
      onGenerateRoadmap(missing, selectedRole);
    } else if (onNavigate) {
      onNavigate('roadmap');
    }
  };

  const verifiedCount = (profile?.verifiedSkills || []).length;
  const matchScore = report?.overallMatchScore ?? 0;

  // Filter skills by category tab
  const getFilteredSkills = (list = []) => {
    if (!list || !Array.isArray(list)) return [];
    if (activeCategoryTab === "all") return list;
    return list.filter(s => s.category?.toLowerCase() === activeCategoryTab.toLowerCase());
  };

  return (
    <div className="space-y-6 animate-fade-in text-white pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-accent-purple/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">AI Skill-Gap & Verification Hub</h2>
                {report?.sourceResumeFile && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-purple/20 border border-accent-purple/40 text-accent-purple text-[10px] font-bold">
                    Resume: {report.sourceResumeFile}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">Deep technical proficiency evaluation, gap breakdown, and verification pipeline</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5">
            <span className="text-[11px] text-gray-400 font-bold">Target Role:</span>
            <select
              value={selectedRole}
              onChange={handleRoleSelect}
              className="bg-transparent text-xs font-extrabold text-accent-purple focus:outline-none cursor-pointer"
            >
              {TARGET_ROLE_OPTIONS.map(role => (
                <option key={role} value={role} className="bg-gray-900 text-white font-medium">{role}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowJdInput(!showJdInput)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showJdInput 
                ? 'bg-accent-purple/20 border-accent-purple text-accent-purple' 
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> {showJdInput ? "Hide Custom JD" : "Paste Custom JD"}
          </button>

          <button
            onClick={handleTriggerAnalysis}
            disabled={status === 'LOADING'}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white text-xs font-extrabold shadow-md shadow-accent-purple/20 hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'LOADING' ? 'animate-spin' : ''}`} />
            {status === 'LOADING' ? "Analyzing..." : "Re-Analyze Gap"}
          </button>
        </div>
      </div>

      {/* Optional Custom Job Description Drawer */}
      {showJdInput && (
        <div className="glass rounded-2xl p-4 border border-accent-purple/30 space-y-3 bg-accent-purple/5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-accent-purple flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Custom Job Description / Role Requirements
            </label>
            <span className="text-[10px] text-gray-400">Paste job requirements to compare against your uploaded resume</span>
          </div>
          <textarea
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            rows={3}
            placeholder="Paste target job description text here (e.g. 'Looking for Frontend Engineer with React, TypeScript, Next.js, Docker, and Automated Unit Testing experience...')"
            className="w-full rounded-xl bg-gray-950/80 border border-gray-800 p-3 text-xs text-gray-200 placeholder-gray-500 focus:border-accent-purple focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleTriggerAnalysis}
              disabled={status === 'LOADING'}
              className="px-4 py-1.5 rounded-lg bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              Analyze Custom JD
            </button>
          </div>
        </div>
      )}

      {/* 1. LOADING STATE */}
      {status === 'LOADING' && (
        <div className="glass rounded-2xl p-16 border border-gray-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple shadow-lg shadow-purple-500/10">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Analyzing Resume Evidence for {selectedRole}...</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Scanning technical skills, projects, experience, education, and extracting concrete evidence...
            </p>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {status === 'ERROR' && (
        <div className="glass rounded-2xl p-12 border border-rose-500/30 bg-rose-950/10 text-center space-y-4 flex flex-col items-center justify-center min-h-[320px]">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Unable to analyze skill gap.</h3>
            <p className="text-xs text-rose-300 max-w-md mx-auto">
              {errorMessage || "The skill gap evaluation service encountered an error. Please try again."}
            </p>
          </div>
          <button
            onClick={handleTriggerAnalysis}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-xs shadow-lg shadow-accent-purple/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Analysis
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {status === 'EMPTY' && (
        <div className="glass rounded-2xl p-12 border border-gray-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[320px]">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Skill Gap analysis available yet.</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Upload your resume on the Resume Analyzer tab to extract your skills and generate your skill gap analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('resume')}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-4 h-4 text-accent-purple" /> Upload Resume
              </button>
            )}
            <button
              onClick={handleTriggerAnalysis}
              className="px-4 py-2 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Run Analysis
            </button>
          </div>
        </div>
      )}

      {/* 4. SUCCESS STATE: REAL ANALYSIS REPORT */}
      {status === 'SUCCESS' && report && (
        <>
          {/* Top Metric Cards (3-column grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Overall Match Score */}
            <div className="glass rounded-2xl p-5 border border-gray-800 flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Target Job Match</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{matchScore}%</span>
                  <span className={`text-xs font-bold ${matchScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {matchScore >= 75 ? "High Readiness" : "Gap Identified"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  For <span className="text-white font-semibold">{selectedRole}</span>
                </p>
              </div>

              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-accent-purple transition-all duration-1000"
                    strokeDasharray={`${matchScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="url(#purpleGradient)"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-xs font-extrabold text-white">{matchScore}%</span>
              </div>
            </div>

            {/* Card 2: Resume Impact (Before vs After) */}
            <div className="glass rounded-2xl p-5 border border-gray-800 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Resume Match Potential</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">
                  {Math.min(100, matchScore + ((report?.missingSkills?.length || 0) > 0 ? 25 : 0))}% Target
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-gray-400 block">Current Match</span>
                  <span className="text-xl font-bold text-gray-300">{matchScore}%</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-[10px] text-emerald-400 block font-bold">After Full Verification</span>
                  <span className="text-xl font-black text-emerald-400">100%</span>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-accent-purple to-emerald-400 h-full rounded-full" style={{ width: `${matchScore}%` }} />
              </div>
            </div>

            {/* Card 3: Skill Verification Status */}
            <div className="glass rounded-2xl p-5 border border-gray-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Verified Skills Gained</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">{verifiedCount}</span>
                  <span className="text-xs text-gray-400">/ {((report?.strongSkills?.length || 0) + (report?.partialSkills?.length || 0) + (report?.missingSkills?.length || 0))} Total</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {(report?.missingSkills || []).length} Missing skills pending verification
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Category Progress Breakdown Bars */}
          {report?.categoryScores && (
            <div className="glass rounded-2xl p-5 border border-gray-800 space-y-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-purple" /> Technical Competency Breakdown by Domain
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "Technical Skills", score: report.categoryScores.technicalSkills ?? matchScore, icon: Code2, color: "from-purple-500 to-indigo-500" },
                  { label: "Programming", score: report.categoryScores.programming ?? 0, icon: Code2, color: "from-blue-500 to-cyan-500" },
                  { label: "Frameworks", score: report.categoryScores.frameworks ?? 0, icon: Layers, color: "from-accent-pink to-rose-500" },
                  { label: "Databases", score: report.categoryScores.databases ?? 0, icon: Database, color: "from-amber-500 to-yellow-500" },
                  { label: "Tools & Git", score: report.categoryScores.tools ?? 0, icon: Wrench, color: "from-emerald-500 to-teal-500" },
                  { label: "Cloud & DevOps", score: report.categoryScores.cloudDevOps ?? 0, icon: Cloud, color: "from-orange-500 to-red-500" }
                ].map((cat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-300 truncate">{cat.label}</span>
                      <span className="font-extrabold text-white">{cat.score}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${cat.color}`} style={{ width: `${cat.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["all", "Programming", "Frameworks", "Databases", "Tools", "Cloud/DevOps"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategoryTab(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                  activeCategoryTab === cat
                    ? 'bg-accent-purple text-white shadow-md shadow-accent-purple/20'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Main 3-Column Skill Breakdown (Strong, Partial, Missing) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Strong Skills Already Known (✓) */}
            <div className="glass rounded-2xl p-5 border border-emerald-500/20 space-y-4 bg-emerald-950/5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                    Strong Skills ({getFilteredSkills(report?.strongSkills).length})
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">100% Match</span>
              </div>

              <div className="space-y-2.5">
                {getFilteredSkills(report?.strongSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3.5 rounded-xl bg-gray-900/90 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span> {skill.skillName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {skill.currentProficiency || 'Advanced'}
                      </span>
                    </div>

                    {/* Resume Evidence Snippets */}
                    {skill.evidence && skill.evidence.length > 0 ? (
                      <div className="space-y-1 pt-1 border-t border-gray-800">
                        <span className="text-[9px] uppercase font-bold text-gray-500 block">Resume Evidence:</span>
                        {skill.evidence.map((ev, eIdx) => (
                          <div key={eIdx} className="text-[10px] text-emerald-300/90 flex items-start gap-1">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    ) : skill.reason ? (
                      <p className="text-[11px] text-gray-400 leading-relaxed">{skill.reason}</p>
                    ) : null}
                  </div>
                ))}
                {getFilteredSkills(report?.strongSkills).length === 0 && (
                  <p className="text-xs text-gray-500 italic p-4 text-center">No strong skills found in this category.</p>
                )}
              </div>
            </div>

            {/* Column 2: Partial Skills (◐) */}
            <div className="glass rounded-2xl p-5 border border-blue-500/20 space-y-4 bg-blue-950/5">
              <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">
                    Partially Known Skills ({getFilteredSkills(report?.partialSkills).length})
                  </h3>
                </div>
                <span className="text-[10px] text-blue-400 font-bold">~50% Gap</span>
              </div>

              <div className="space-y-2.5">
                {getFilteredSkills(report?.partialSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3.5 rounded-xl bg-gray-900/90 border border-blue-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        <span className="text-blue-400 font-bold">◐</span> {skill.skillName}
                      </span>
                      {skill.priority && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                          Priority: {skill.priority}
                        </span>
                      )}
                    </div>

                    {skill.evidence && skill.evidence.length > 0 ? (
                      <div className="space-y-1 pt-1 border-t border-gray-800">
                        <span className="text-[9px] uppercase font-bold text-gray-500 block">Resume Mention:</span>
                        {skill.evidence.map((ev, eIdx) => (
                          <div key={eIdx} className="text-[10px] text-blue-300/90 flex items-start gap-1">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    ) : skill.reason ? (
                      <p className="text-[11px] text-gray-400 leading-relaxed">{skill.reason}</p>
                    ) : null}

                    <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleStartRoadmap(skill.skillName)}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Map className="w-3 h-3" /> View Learning Path
                      </button>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(skill.skillName)}
                        className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-[11px] transition-all flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 fill-white" /> Verify
                      </button>
                    </div>
                  </div>
                ))}
                {getFilteredSkills(report?.partialSkills).length === 0 && (
                  <p className="text-xs text-gray-500 italic p-4 text-center">No partial skills in this category.</p>
                )}
              </div>
            </div>

            {/* Column 3: Missing Skills Gap (✗) */}
            <div className="glass rounded-2xl p-5 border border-amber-500/30 space-y-4 bg-amber-950/5">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    Missing Skills ({getFilteredSkills(report?.missingSkills).length})
                  </h3>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">100% Gap</span>
              </div>

              <div className="space-y-2.5">
                {getFilteredSkills(report?.missingSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3.5 rounded-xl bg-gray-900/90 border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">✗</span> {skill.skillName}
                      </span>
                      {skill.priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          skill.priority === 'High' 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {skill.priority} Priority
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {skill.reason || "No evidence found in uploaded resume."}
                    </p>

                    <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleStartRoadmap(skill.skillName)}
                        className="text-[11px] font-bold text-accent-purple hover:text-accent-pink flex items-center gap-1"
                      >
                        <Map className="w-3 h-3" /> Start Roadmap
                      </button>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(skill.skillName)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] transition-all flex items-center gap-1 shadow-md shadow-amber-500/20"
                      >
                        <Zap className="w-3 h-3 fill-black" /> Verify Skill
                      </button>
                    </div>
                  </div>
                ))}
                {getFilteredSkills(report?.missingSkills).length === 0 && (
                  <div className="p-6 text-center text-emerald-400 text-xs font-bold">
                    🎉 Excellent! Zero missing skills found for {selectedRole}!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Pipeline Callout */}
          <div className="glass rounded-2xl p-6 border border-accent-purple/30 bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-pink" /> Complete the End-to-End Skill Bridge Cycle
              </h4>
              <p className="text-xs text-gray-300 max-w-2xl">
                Complete learning roadmap tasks → Take MCQ & Coding assessments → Submit verified project → AI evaluates and automatically updates your resume with verified badges and generates your official certificate.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleStartRoadmap()}
                className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Map className="w-4 h-4 text-accent-purple" /> Full Learning Roadmap
              </button>
              {(report?.missingSkills?.length || 0) > 0 && (
                <button
                  onClick={() => onOpenVerification && onOpenVerification(report?.missingSkills?.[0]?.skillName)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-black text-xs shadow-lg shadow-accent-purple/25 hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" /> Start Verification ({report?.missingSkills?.[0]?.skillName}) ›
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
