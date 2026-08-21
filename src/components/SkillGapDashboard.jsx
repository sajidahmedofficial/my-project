// agent-notes: { ctx: "Playful cartoon AI Skill Gap & Verification Hub with 3D buttons, bouncy category tabs, priority gap cards & progress bars", deps: ["lucide-react", "../services/skillGapApi"], state: "active", last: "anti@2026-08-21" }
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

  // Auto-run analysis whenever target role, resume, or profile verified skills change
  useEffect(() => {
    runAnalysis(selectedRole, customJd);
  }, [profile?.skills, profile?.verifiedSkills, profile?.resumeId, profile?.resumeText, selectedRole]);

  const runAnalysis = async (targetRole, jdText) => {
    setStatus('LOADING');
    setErrorMessage(null);

    try {
      const userSkills = profile?.skills || [];
      const verifiedSkills = profile?.verifiedSkills || [];
      const resumeId = profile?.resumeId || localStorage.getItem('sb_active_resume_id') || "";
      const resumeText = profile?.resumeText || localStorage.getItem('sb_resume_text') || "";
      const activeFileName = profile?.resumeFileName || localStorage.getItem('sb_resume_filename') || "";

      const res = await skillGapApi.analyzeSkillGap({
        resumeId,
        resumeText,
        userSkills,
        targetRole,
        jobDescription: jdText,
        verifiedSkills,
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
    <div className="space-y-6 animate-fade-in text-white pb-12 select-none">
      {/* Header section */}
      <div className="cartoon-card p-6 md:p-8 border-2 border-purple-500/30 relative overflow-hidden bg-gradient-to-r from-[#171d33] via-[#1c243f] to-[#1a2138]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 border-2 border-white/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">Skill-Gap & Verification Hub</h2>
                {report?.sourceResumeFile && (
                  <span className="cartoon-badge cartoon-badge-purple text-[10px]">
                    {report.sourceResumeFile}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 font-medium">Technical proficiency evaluation, gap breakdown, and verification pipeline</p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-[#0d1220] border-2 border-purple-500/30 rounded-2xl px-3 py-1.5">
              <span className="text-[11px] text-purple-300 font-black">Target:</span>
              <select
                value={selectedRole}
                onChange={handleRoleSelect}
                className="bg-transparent text-xs font-black text-white focus:outline-none cursor-pointer"
              >
                {TARGET_ROLE_OPTIONS.map(role => (
                  <option key={role} value={role} className="bg-[#121727] text-white font-bold">{role}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowJdInput(!showJdInput)}
              className={`cartoon-btn py-2 px-3.5 text-xs font-black gap-1.5 ${
                showJdInput 
                  ? 'cartoon-btn-purple' 
                  : 'cartoon-btn-dark'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> {showJdInput ? "Hide JD" : "Custom JD"}
            </button>

            <button
              onClick={handleTriggerAnalysis}
              disabled={status === 'LOADING'}
              className="cartoon-btn cartoon-btn-pink py-2 px-4 text-xs font-black gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === 'LOADING' ? 'animate-spin' : ''}`} />
              {status === 'LOADING' ? "Analyzing..." : "Re-Analyze"}
            </button>
          </div>
        </div>
      </div>

      {/* Optional Custom Job Description Drawer */}
      {showJdInput && (
        <div className="cartoon-card p-5 border-2 border-purple-500/40 space-y-3 bg-[#13192c]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" /> Custom Job Description / Role Requirements
            </label>
            <span className="text-[10px] text-gray-400 font-bold">Paste job requirements to compare against your uploaded resume</span>
          </div>
          <textarea
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            rows={3}
            placeholder="Paste target job description text here (e.g. 'Looking for Frontend Engineer with React, TypeScript, Next.js, Docker, and Automated Unit Testing experience...')"
            className="w-full rounded-2xl bg-[#0b0f19] border-2 border-purple-500/30 p-3.5 text-xs text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none font-medium"
          />
          <div className="flex justify-end">
            <button
              onClick={handleTriggerAnalysis}
              disabled={status === 'LOADING'}
              className="cartoon-btn cartoon-btn-purple py-2 px-4 text-xs font-black disabled:opacity-50"
            >
              Analyze Custom JD
            </button>
          </div>
        </div>
      )}

      {/* 1. LOADING STATE */}
      {status === 'LOADING' && (
        <div className="cartoon-card p-16 border-2 border-purple-500/30 text-center space-y-4 flex flex-col items-center justify-center min-h-[340px]">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border-2 border-purple-400 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <RefreshCw className="w-7 h-7 animate-spin text-pink-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Analyzing Resume Evidence for {selectedRole}...</h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto font-medium">
              Scanning technical skills, projects, experience, and extracting concrete evidence...
            </p>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {status === 'ERROR' && (
        <div className="cartoon-card p-12 border-2 border-rose-500/40 bg-rose-950/20 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">Unable to analyze skill gap.</h3>
            <p className="text-xs text-rose-300 max-w-md mx-auto font-medium">
              {errorMessage || "The skill gap evaluation service encountered an error. Please try again."}
            </p>
          </div>
          <button
            onClick={handleTriggerAnalysis}
            className="cartoon-btn cartoon-btn-purple py-2 px-5 text-xs font-black gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Analysis
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {status === 'EMPTY' && (
        <div className="cartoon-card p-12 border-2 border-purple-500/30 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-14 h-14 rounded-2xl bg-[#0d1220] border-2 border-purple-500/30 flex items-center justify-center text-purple-400">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">No Skill Gap analysis available yet.</h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto font-medium">
              Upload your resume on the Resume Analyzer tab to extract your skills and generate your skill gap analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('resume')}
                className="cartoon-btn cartoon-btn-purple py-2 px-5 text-xs font-black gap-2"
              >
                <FileText className="w-4 h-4" /> Upload Resume
              </button>
            )}
            <button
              onClick={handleTriggerAnalysis}
              className="cartoon-btn cartoon-btn-dark py-2 px-4 text-xs font-bold gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Run Analysis
            </button>
          </div>
        </div>
      )}

      {/* 4. SUCCESS STATE */}
      {status === 'SUCCESS' && report && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Overall Match Score */}
            <div className="cartoon-card p-6 border-2 border-purple-500/30 flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] uppercase font-black text-purple-300 tracking-wider block">Target Job Match</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{matchScore}%</span>
                  <span className={`text-xs font-black ${matchScore >= 75 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {matchScore >= 75 ? "High Match" : "Gap Identified"}
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-medium">
                  For <strong className="text-white font-black">{selectedRole}</strong>
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
                    strokeDasharray={`${matchScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="url(#purpleGrad)"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <defs>
                    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-xs font-black text-white">{matchScore}%</span>
              </div>
            </div>

            {/* Card 2: Resume Impact */}
            <div className="cartoon-card p-6 border-2 border-cyan-500/30 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-cyan-300 tracking-wider">Resume Match Potential</span>
                <span className="cartoon-badge cartoon-badge-mint text-[10px]">
                  {Math.min(100, matchScore + ((report?.missingSkills?.length || 0) > 0 ? 25 : 0))}% Target
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block">Current Match</span>
                  <span className="text-xl font-black text-gray-300">{matchScore}%</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-[10px] text-emerald-400 font-black block">After Verification</span>
                  <span className="text-xl font-black text-emerald-400">100%</span>
                </div>
              </div>
              <div className="w-full bg-[#0d1220] rounded-full h-2 overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${matchScore}%` }} />
              </div>
            </div>

            {/* Card 3: Skill Verification Status */}
            <div className="cartoon-card p-6 border-2 border-emerald-500/30 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider block">Verified Skills Gained</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-300">{verifiedCount}</span>
                  <span className="text-xs text-gray-400 font-bold">/ {((report?.strongSkills?.length || 0) + (report?.partialSkills?.length || 0) + (report?.missingSkills?.length || 0))} Total</span>
                </div>
                <p className="text-xs text-gray-300 font-medium">
                  {(report?.missingSkills || []).length} Missing skills pending verification
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 border-2 border-white/20 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Category Progress Breakdown Bars */}
          {report?.categoryScores && (
            <div className="cartoon-card p-6 border-2 border-purple-500/25 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Technical Competency Breakdown by Domain
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "Technical Skills", score: report.categoryScores.technicalSkills ?? matchScore, color: "from-purple-500 to-indigo-500" },
                  { label: "Programming", score: report.categoryScores.programming ?? 0, color: "from-blue-500 to-cyan-500" },
                  { label: "Frameworks", score: report.categoryScores.frameworks ?? 0, color: "from-pink-500 to-rose-500" },
                  { label: "Databases", score: report.categoryScores.databases ?? 0, color: "from-amber-500 to-yellow-500" },
                  { label: "Tools & Git", score: report.categoryScores.tools ?? 0, color: "from-emerald-500 to-teal-500" },
                  { label: "Cloud & DevOps", score: report.categoryScores.cloudDevOps ?? 0, color: "from-orange-500 to-red-500" }
                ].map((cat, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#0d1220] border-2 border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-gray-300 truncate">{cat.label}</span>
                      <span className="font-black text-white">{cat.score}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-white/10">
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
                className={`cartoon-badge py-2 px-4 text-xs font-black capitalize transition-all cursor-pointer ${
                  activeCategoryTab === cat
                    ? 'cartoon-badge-purple scale-105 shadow-md'
                    : 'bg-[#151b2e] text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Main 3-Column Skill Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Strong Skills */}
            <div className="cartoon-card p-5 border-2 border-emerald-500/30 space-y-4 bg-emerald-950/10">
              <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                    Strong Skills ({getFilteredSkills(report?.strongSkills).length})
                  </h3>
                </div>
                <span className="cartoon-badge cartoon-badge-mint text-[10px]">100% Match</span>
              </div>

              <div className="space-y-2.5">
                {getFilteredSkills(report?.strongSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3.5 rounded-2xl bg-[#0d1220] border-2 border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-xs flex items-center gap-1.5">
                        <span className="text-emerald-400 font-black">✓</span> {skill.skillName}
                      </span>
                      <span className="cartoon-badge cartoon-badge-mint text-[10px]">
                        {skill.currentProficiency || 'Advanced'}
                      </span>
                    </div>

                    {skill.evidence && skill.evidence.length > 0 ? (
                      <div className="space-y-1 pt-1 border-t border-white/10">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block">Resume Evidence:</span>
                        {skill.evidence.map((ev, eIdx) => (
                          <div key={eIdx} className="text-xs text-emerald-300/90 flex items-start gap-1 font-medium">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Partial Skills */}
            <div className="cartoon-card p-5 border-2 border-cyan-500/30 space-y-4 bg-cyan-950/10">
              <div className="flex items-center justify-between pb-2 border-b-2 border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                    Partially Known ({getFilteredSkills(report?.partialSkills).length})
                  </h3>
                </div>
                <span className="cartoon-badge cartoon-badge-cyan text-[10px]">~50% Gap</span>
              </div>

              <div className="space-y-2.5">
                {getFilteredSkills(report?.partialSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3.5 rounded-2xl bg-[#0d1220] border-2 border-cyan-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-xs flex items-center gap-1.5">
                        <span className="text-cyan-400 font-black">◐</span> {skill.skillName}
                      </span>
                      {skill.priority && (
                        <span className="cartoon-badge cartoon-badge-cyan text-[10px]">
                          {skill.priority}
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleStartRoadmap(skill.skillName)}
                        className="text-xs font-black text-cyan-300 hover:underline flex items-center gap-1"
                      >
                        <Map className="w-3.5 h-3.5" /> Learning Path
                      </button>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(skill.skillName)}
                        className="cartoon-btn cartoon-btn-cyan py-1 px-3 text-xs font-black gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" /> Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Missing Skills Gap */}
            <div className="cartoon-card p-5 border-2 border-pink-500/30 space-y-4 bg-pink-950/10">
              <div className="flex items-center justify-between pb-2 border-b-2 border-pink-500/20">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-xs font-black text-pink-300 uppercase tracking-wider">
                    Missing Skills ({getFilteredSkills(report?.missingSkills).length})
                  </h3>
                </div>
                <span className="cartoon-badge cartoon-badge-pink text-[10px]">100% Gap</span>
              </div>

              <div className="space-y-2.5">
                {getFilteredSkills(report?.missingSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3.5 rounded-2xl bg-[#0d1220] border-2 border-pink-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-xs flex items-center gap-1.5">
                        <span className="text-rose-400 font-black">✗</span> {skill.skillName}
                      </span>
                      <span className="cartoon-badge cartoon-badge-pink text-[10px]">
                        {skill.priority || 'High'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-300 font-medium leading-relaxed">
                      {skill.reason || "No evidence found in uploaded resume."}
                    </p>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleStartRoadmap(skill.skillName)}
                        className="text-xs font-black text-purple-300 hover:text-white flex items-center gap-1"
                      >
                        <Map className="w-3.5 h-3.5" /> Start Roadmap
                      </button>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(skill.skillName)}
                        className="cartoon-btn cartoon-btn-yellow py-1 px-3 text-xs font-black gap-1"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" /> Verify Skill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
