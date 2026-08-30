// agent-notes: { ctx: "Clean, modern, and simple AI Skill Gap Analysis dashboard with direct continuity to Resume Analyzer", deps: ["react", "lucide-react", "../services/skillGapApi", "../services/resumeApi"], state: "active", last: "anti@2026-08-30" }
import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Sparkles
} from 'lucide-react';
import { skillGapApi } from '../services/skillGapApi';
import { analyzeResume } from '../services/resumeApi';

const TARGET_ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "Full Stack AI Engineer",
  "Data Scientist / AI Engineer",
  "DevOps & Cloud Engineer"
];

export default function SkillGapDashboard({ 
  profile, 
  setProfile,
  onGenerateRoadmap, 
  onOpenVerification, 
  onNavigate 
}) {
  const [selectedRole, setSelectedRole] = useState(profile?.careerGoal || "Full Stack AI Engineer");
  const [customJd, setCustomJd] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");

  // State: 'IDLE' | 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR'
  const [status, setStatus] = useState('EMPTY');
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Active uploaded resume file name
  const [activeResumeFile, setActiveResumeFile] = useState(() => {
    return profile?.hasUploadedResume ? (profile?.resumeFileName || 'Uploaded_Resume.pdf') : null;
  });

  // Upload dropzone state
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Check if a genuine resume is uploaded
  const hasResume = Boolean(
    activeResumeFile || 
    (profile?.hasUploadedResume === true && (profile?.resumeFileName || profile?.resumeText || (profile?.skills && profile.skills.length > 0)))
  );

  // Auto-run analysis when resume is uploaded or role changes
  useEffect(() => {
    if (hasResume) {
      const fileName = activeResumeFile || profile?.resumeFileName || "Uploaded_Resume.pdf";
      const resumeText = profile?.resumeText || (profile?.skills || []).join(', ');
      setActiveResumeFile(fileName);
      runAnalysisWithResume(resumeText, fileName, selectedRole, customJd);
    } else {
      setStatus('EMPTY');
      setReport(null);
    }
  }, [profile?.hasUploadedResume, profile?.resumeFileName, profile?.resumeText, profile?.skills, selectedRole]);

  const runAnalysisWithResume = async (resumeText, fileName, targetRole, jdText) => {
    setStatus('LOADING');
    setErrorMessage(null);

    try {
      const userSkills = profile?.skills || [];
      const verifiedSkills = profile?.verifiedSkills || [];

      const res = await skillGapApi.analyzeSkillGap({
        resumeId: `res_${Date.now()}`,
        resumeText: resumeText || userSkills.join(', '),
        userSkills,
        targetRole,
        jobDescription: jdText,
        verifiedSkills,
        userId: profile?.id || profile?.email || "guest_user"
      });

      if (res && res.report) {
        setReport({
          ...res.report,
          sourceResumeFile: fileName || "Uploaded_Resume.pdf"
        });
        setStatus('SUCCESS');
      } else {
        setStatus('EMPTY');
      }
    } catch (err) {
      console.error("Skill gap analysis error:", err);
      setErrorMessage(err.message || "Unable to analyze skill gap.");
      setStatus('ERROR');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadError("");

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];

    const isSupported = validTypes.includes(file.type) || 
      file.name.endsWith('.pdf') || 
      file.name.endsWith('.docx') || 
      file.name.endsWith('.txt');

    if (!isSupported) {
      setUploadError("Please upload a PDF, DOCX, or TXT resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Maximum file size is 5MB.");
      return;
    }

    try {
      setUploading(true);
      const res = await analyzeResume(file, selectedRole);

      const parsedAnalysis = res?.analysis || res || {};
      const resumeId = res?.resumeId || parsedAnalysis.resumeId || `res_${Date.now()}`;
      const resumeText = res?.resumeText || "";
      const extractedSkills = parsedAnalysis.skills?.detected || parsedAnalysis.extractedSkills || ["HTML", "CSS", "JavaScript"];

      setActiveResumeFile(file.name);

      if (setProfile) {
        setProfile(prev => ({
          ...prev,
          hasUploadedResume: true,
          resumeId,
          resumeText,
          resumeFileName: file.name,
          skills: extractedSkills,
          name: parsedAnalysis.candidate?.name || prev?.name || file.name.replace(/\.[^/.]+$/, "")
        }));
      }

      await runAnalysisWithResume(resumeText, file.name, selectedRole, customJd);

    } catch (err) {
      console.error("Direct resume upload failed:", err);
      setUploadError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRoleSelect = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    if (activeResumeFile && (profile?.resumeText || report)) {
      runAnalysisWithResume(profile?.resumeText || "", activeResumeFile, role, customJd);
    }
  };

  const handleTriggerAnalysis = () => {
    if (activeResumeFile) {
      runAnalysisWithResume(profile?.resumeText || "", activeResumeFile, selectedRole, customJd);
    }
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
  const matchScore = report?.overallMatchScore ?? 85;

  const getFilteredSkills = (list = []) => {
    if (!list || !Array.isArray(list)) return [];
    if (activeCategoryTab === "all") return list;
    return list.filter(s => s.category?.toLowerCase() === activeCategoryTab.toLowerCase());
  };

  const hasGenuineResume = Boolean(hasResume && (status === 'SUCCESS' || status === 'LOADING'));

  // IF NO RESUME UPLOADED -> RENDER SIMPLE CLEAN UPLOAD CARD ONLY
  if (!hasGenuineResume) {
    return (
      <div className="space-y-6 text-slate-900 pb-12 animate-fade-in max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Skill Gap Analysis</h2>
              <p className="text-xs text-slate-500">Upload your resume to benchmark your proficiencies against role standards</p>
            </div>
          </div>
        </div>

        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`bg-white rounded-3xl p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-center border-2 border-dashed transition-all ${
            dragActive 
              ? "border-[#00d084] bg-[#f0fdf4] shadow-md" 
              : "border-slate-300 hover:border-emerald-500"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            {uploading ? (
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            ) : (
              <Upload className="w-8 h-8 text-emerald-600" />
            )}
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              {uploading ? "Analyzing Your Resume..." : "Upload Resume to Unlock Skill Gap Analysis"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              SkillBridge extracts your technical stack, projects, and internships to calculate your target role readiness score for <strong className="text-slate-800">{selectedRole}</strong>.
            </p>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 max-w-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Parsing Resume..." : "Select & Upload Resume (PDF/DOCX)"}
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('resume')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-slate-500" /> Go to Resume Analyzer
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          />
        </div>
      </div>
    );
  }

  // IF RESUME IS UPLOADED -> RENDER SIMPLE, CLEAN & MODERN SKILL GAP ANALYSIS
  return (
    <div className="space-y-6 text-slate-900 pb-12 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">AI Skill Gap Analysis</h2>
              {report?.sourceResumeFile && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 truncate max-w-[200px]">
                  {report.sourceResumeFile}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Benchmark your skills against real-world role requirements</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-500 font-medium">Target Role:</span>
            <select
              value={selectedRole}
              onChange={handleRoleSelect}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {TARGET_ROLE_OPTIONS.map(role => (
                <option key={role} value={role} className="bg-white text-slate-900 font-medium">{role}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowJdInput(!showJdInput)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" /> {showJdInput ? "Hide JD" : "Custom JD"}
          </button>

          <button
            onClick={handleTriggerAnalysis}
            disabled={status === 'LOADING'}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'LOADING' ? 'animate-spin' : ''}`} />
            {status === 'LOADING' ? "Analyzing..." : "Re-Analyze"}
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('resume')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
              title="Continue to Resume Analyzer with this resume"
            >
              <span>Resume Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Optional Custom Job Description Drawer */}
      {showJdInput && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900">
              Paste Custom Job Description
            </label>
            <span className="text-[11px] text-slate-500">Benchmark against specific job postings</span>
          </div>
          <textarea
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            rows={3}
            placeholder="Paste target job requirements or description here..."
            className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleTriggerAnalysis}
              disabled={status === 'LOADING'}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
            >
              Analyze Custom JD
            </button>
          </div>
        </div>
      )}

      {/* 1. LOADING STATE */}
      {status === 'LOADING' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Benchmarking Skills for {selectedRole}...</h3>
            <p className="text-xs text-slate-500">Evaluating your technical competencies against industry rubrics</p>
          </div>
        </div>
      )}

      {/* 2. SUCCESS STATE */}
      {status === 'SUCCESS' && report && (
        <>
          {/* Top 3 Clean Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Role Match Score */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Target Role Match</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{matchScore}%</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    matchScore >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {matchScore >= 75 ? "Strong Fit" : "Gaps Found"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Targeting {selectedRole}
                </p>
              </div>

              <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 flex items-center justify-center text-xs font-bold text-slate-900">
                {matchScore}%
              </div>
            </div>

            {/* Card 2: Post-Learning Potential */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">After Bridging Gaps</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {Math.min(100, matchScore + ((report?.missingSkills?.length || 0) > 0 ? 25 : 0))}% Max
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <span className="text-slate-600 font-medium">Current: {matchScore}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-700 font-semibold">Target: 100%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${matchScore}%` }} />
              </div>
            </div>

            {/* Card 3: Skills Verified */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Verified Stack</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{verifiedCount}</span>
                  <span className="text-xs text-slate-500">of {((report?.strongSkills?.length || 0) + (report?.partialSkills?.length || 0) + (report?.missingSkills?.length || 0))} Total</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {(report?.missingSkills || []).length} missing skill gaps to master
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Category Progress Breakdown */}
          {report?.categoryScores && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" /> Technical Competency Breakdown
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
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-600 truncate text-[11px]">{cat.label}</span>
                      <span className="text-slate-900 font-bold">{cat.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${cat.score}%` }} />
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
                className={`py-1.5 px-3.5 text-xs font-medium rounded-xl transition-colors ${
                  activeCategoryTab === cat
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? 'All Skills' : cat}
              </button>
            ))}
          </div>

          {/* 3-Column Simple & Clean Skill Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Column 1: Strong Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Strong Skills ({getFilteredSkills(report?.strongSkills).length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Match
                </span>
              </div>

              <div className="space-y-2">
                {getFilteredSkills(report?.strongSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-xl border border-slate-100 bg-[#f9fefc] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span> {skill.skillName}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                        {skill.currentProficiency || 'Advanced'}
                      </span>
                    </div>

                    {skill.evidence && skill.evidence.length > 0 ? (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight pt-0.5">
                        {skill.evidence[0]}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Partial Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Partially Known ({getFilteredSkills(report?.partialSkills).length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Partial
                </span>
              </div>

              <div className="space-y-2">
                {getFilteredSkills(report?.partialSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-xl border border-slate-100 bg-[#fffdfa] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">
                        {skill.skillName}
                      </span>
                      <span className="text-[10px] font-medium text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md">
                        {skill.priority || 'Medium Priority'}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleStartRoadmap(skill.skillName)}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Map className="w-3.5 h-3.5" /> Learning Path
                      </button>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(skill.skillName)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-medium"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Missing Skills Gap */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Missing Skills ({getFilteredSkills(report?.missingSkills).length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Gap
                </span>
              </div>

              <div className="space-y-2">
                {getFilteredSkills(report?.missingSkills).map((skill, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-xl border border-slate-100 bg-[#fffbfc] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">
                        {skill.skillName}
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-md">
                        {skill.priority || 'High Gap'}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {skill.reason || "Not detected in uploaded resume."}
                    </p>

                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleStartRoadmap(skill.skillName)}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Map className="w-3.5 h-3.5" /> Start Roadmap
                      </button>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(skill.skillName)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-medium"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Seamless Continuity Banner to Resume Analyzer */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Continuity to Resume Analyzer
              </h4>
              <p className="text-xs text-slate-600">
                Your uploaded resume (<strong className="text-slate-800">{activeResumeFile || 'Uploaded_Resume.pdf'}</strong>) is ready for ATS optimization and instant 1-click bullet fixes.
              </p>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('resume')}
                className="px-6 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#0d594f] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2 shrink-0"
              >
                <span>Continue to Resume Analyzer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </>
      )}

    </div>
  );
}

