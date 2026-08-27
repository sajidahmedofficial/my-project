// agent-notes: { ctx: "Clean minimal SaaS AI Skill Gap & Verification Hub with clear match metrics, domain breakdown, and priority gap cards", deps: ["lucide-react", "../services/skillGapApi"], state: "active", last: "anti@2026-08-27" }
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Map, 
  TrendingUp, 
  ArrowRight, 
  FileText, 
  Layers, 
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
    <div className="space-y-6 text-slate-900 pb-12">
      {/* Header section */}
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Skill Gap & Requirements</h2>
              {report?.sourceResumeFile && (
                <span className="saas-badge text-[11px]">
                  {report.sourceResumeFile}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">Evaluate technical proficiencies against role expectations</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-500 font-medium">Target Role:</span>
            <select
              value={selectedRole}
              onChange={handleRoleSelect}
              className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              {TARGET_ROLE_OPTIONS.map(role => (
                <option key={role} value={role} className="bg-white text-slate-900 font-medium">{role}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowJdInput(!showJdInput)}
            className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" /> {showJdInput ? "Hide JD" : "Custom JD"}
          </button>

          <button
            onClick={handleTriggerAnalysis}
            disabled={status === 'LOADING'}
            className="saas-btn-primary py-1.5 px-3.5 text-xs gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'LOADING' ? 'animate-spin' : ''}`} />
            {status === 'LOADING' ? "Analyzing..." : "Re-Analyze"}
          </button>
        </div>
      </div>

      {/* Optional Custom Job Description Drawer */}
      {showJdInput && (
        <div className="saas-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-900">
              Paste Custom Job Description
            </label>
            <span className="text-[11px] text-slate-500">Compare your resume against custom requirements</span>
          </div>
          <textarea
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            rows={3}
            placeholder="Paste target job description requirements here..."
            className="w-full rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleTriggerAnalysis}
              disabled={status === 'LOADING'}
              className="saas-btn-primary py-1.5 px-3.5 text-xs font-medium disabled:opacity-50"
            >
              Analyze Custom JD
            </button>
          </div>
        </div>
      )}

      {/* 1. LOADING STATE */}
      {status === 'LOADING' && (
        <div className="saas-card p-16 text-center space-y-3 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Analyzing Resume Evidence for {selectedRole}...</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Scanning technical proficiencies and matching against standard competency rubrics...
            </p>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {status === 'ERROR' && (
        <div className="saas-card p-12 text-center space-y-3 flex flex-col items-center justify-center min-h-[260px] border-rose-200">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Unable to analyze skill gap.</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {errorMessage || "The skill gap evaluation service encountered an error. Please try again."}
            </p>
          </div>
          <button
            onClick={handleTriggerAnalysis}
            className="saas-btn-primary py-1.5 px-4 text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Analysis
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {status === 'EMPTY' && (
        <div className="saas-card p-12 text-center space-y-3 flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">No Skill Gap analysis available yet.</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload your resume on the Resume Analyzer tab to extract your skills and generate your skill gap analysis.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('resume')}
                className="saas-btn-primary py-1.5 px-4 text-xs gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Upload Resume
              </button>
            )}
            <button
              onClick={handleTriggerAnalysis}
              className="saas-btn-secondary py-1.5 px-3.5 text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Run Analysis
            </button>
          </div>
        </div>
      )}

      {/* 4. SUCCESS STATE */}
      {status === 'SUCCESS' && report && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Overall Match Score */}
            <div className="saas-card p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Target Role Match</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{matchScore}%</span>
                  <span className={`text-xs font-semibold ${matchScore >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {matchScore >= 75 ? "Strong Fit" : "Gaps Found"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Targeting {selectedRole}
                </p>
              </div>

              <div className="w-12 h-12 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 flex items-center justify-center text-xs font-bold text-slate-900">
                {matchScore}%
              </div>
            </div>

            {/* Card 2: Match Potential */}
            <div className="saas-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Post-Learning Potential</span>
                <span className="saas-badge saas-badge-success text-[10px]">
                  {Math.min(100, matchScore + ((report?.missingSkills?.length || 0) > 0 ? 25 : 0))}% Max
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <span className="text-slate-600 font-medium">Current: {matchScore}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-700 font-semibold">Target: 100%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${matchScore}%` }} />
              </div>
            </div>

            {/* Card 3: Skill Verification Status */}
            <div className="saas-card p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Verified Skills</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{verifiedCount}</span>
                  <span className="text-xs text-slate-500">of {((report?.strongSkills?.length || 0) + (report?.partialSkills?.length || 0) + (report?.missingSkills?.length || 0))} Total</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {(report?.missingSkills || []).length} unverified skill gaps
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Category Progress Breakdown */}
          {report?.categoryScores && (
            <div className="saas-card p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Technical Competency Breakdown
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "Technical Skills", score: report.categoryScores.technicalSkills ?? matchScore },
                  { label: "Programming", score: report.categoryScores.programming ?? 0 },
                  { label: "Frameworks", score: report.categoryScores.frameworks ?? 0 },
                  { label: "Databases", score: report.categoryScores.databases ?? 0 },
                  { label: "Tools & Git", score: report.categoryScores.tools ?? 0 },
                  { label: "Cloud & DevOps", score: report.categoryScores.cloudDevOps ?? 0 }
                ].map((cat, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-600 truncate text-[11px]">{cat.label}</span>
                      <span className="text-slate-900 font-semibold">{cat.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${cat.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {["all", "Programming", "Frameworks", "Databases", "Tools", "Cloud/DevOps"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategoryTab(cat)}
                className={`py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
                  activeCategoryTab === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? 'All Skills' : cat}
              </button>
            ))}
          </div>

          {/* Main 3-Column Skill Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Column 1: Strong Skills */}
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-semibold text-slate-900">
                    Strong Skills ({getFilteredSkills(report?.strongSkills).length})
                  </h3>
                </div>
                <span className="saas-badge saas-badge-success text-[10px]">100% Match</span>
              </div>

              <div className="space-y-2">
                {getFilteredSkills(report?.strongSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span> {skill.skillName}
                      </span>
                      <span className="saas-badge text-[10px]">
                        {skill.currentProficiency || 'Advanced'}
                      </span>
                    </div>

                    {skill.evidence && skill.evidence.length > 0 ? (
                      <div className="space-y-0.5 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                        {skill.evidence.map((ev, eIdx) => (
                          <div key={eIdx} className="flex items-start gap-1">
                            <span>•</span>
                            <span className="leading-tight">{ev}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Partial Skills */}
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-semibold text-slate-900">
                    Partially Known ({getFilteredSkills(report?.partialSkills).length})
                  </h3>
                </div>
                <span className="saas-badge saas-badge-warning text-[10px]">Partial</span>
              </div>

              <div className="space-y-2">
                {getFilteredSkills(report?.partialSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 text-xs">
                        {skill.skillName}
                      </span>
                      {skill.priority && (
                        <span className="saas-badge text-[10px]">
                          {skill.priority}
                        </span>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => handleStartRoadmap(skill.skillName)}
                        className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1"
                      >
                        <Map className="w-3.5 h-3.5" /> Learning Path
                      </button>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(skill.skillName)}
                        className="saas-btn-secondary py-1 px-2.5 text-xs"
                      >
                        Verify Skill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Missing Skills Gap */}
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-xs font-semibold text-slate-900">
                    Missing Skills ({getFilteredSkills(report?.missingSkills).length})
                  </h3>
                </div>
                <span className="saas-badge saas-badge-danger text-[10px]">Gap</span>
              </div>

              <div className="space-y-2">
                {getFilteredSkills(report?.missingSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 text-xs">
                        {skill.skillName}
                      </span>
                      <span className="saas-badge saas-badge-danger text-[10px]">
                        {skill.priority || 'High'}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {skill.reason || "No evidence found in uploaded resume."}
                    </p>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => handleStartRoadmap(skill.skillName)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                      >
                        <Map className="w-3.5 h-3.5" /> Start Roadmap
                      </button>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(skill.skillName)}
                        className="saas-btn-secondary py-1 px-2.5 text-xs"
                      >
                        Verify
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
