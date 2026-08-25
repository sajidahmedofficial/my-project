// agent-notes: { ctx: "Playful cartoon Unified Job & Skill Gap Analyzer with backend skillGapApi integration, interactive Competency Matrix & AI extraction", deps: ["lucide-react", "../services/skillGapApi", "../utils/mockData", "../utils/aiSimulator", "./SkillGapAnalysis.css"], state: "active", last: "anti@2026-08-25" }
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Briefcase, 
  ChevronRight, 
  Zap,
  RefreshCw,
  AlertCircle,
  Grid,
  FileText,
  Sparkles
} from 'lucide-react';
import { JOB_PRESETS } from '../utils/mockData';
import { analyzeJobDescription, detectSkillGap, extractSkillsFromText } from '../utils/aiSimulator';
import { skillGapApi } from '../services/skillGapApi';
import './SkillGapAnalysis.css';

const ROLE_PRESETS = {
  fullstack: {
    title: "Full Stack Developer",
    skills: {
      frontend: ["HTML", "CSS", "JavaScript", "React"],
      backend: ["Node.js", "Express.js", "REST API", "Authentication"],
      database: ["SQL", "MongoDB"],
      tools: ["Git", "GitHub", "Testing"],
      deployment: ["Docker", "AWS"],
    }
  },
  frontend: {
    title: "Frontend Developer",
    skills: {
      frontend: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Redux", "TailwindCSS"],
      tools: ["Git", "GitHub", "Vite", "Jest"],
      deployment: ["Vercel", "Netlify"],
    }
  },
  backend: {
    title: "Backend Engineer",
    skills: {
      backend: ["Node.js", "Express.js", "Python", "REST API", "GraphQL", "Authentication", "Microservices"],
      database: ["SQL", "PostgreSQL", "MongoDB", "Redis"],
      tools: ["Git", "GitHub", "Postman", "Docker"],
      deployment: ["AWS", "Docker", "CI/CD"],
    }
  },
  data: {
    title: "Data Scientist / AI Engineer",
    skills: {
      backend: ["Python", "NumPy", "Pandas", "Scikit-Learn", "PyTorch"],
      database: ["SQL", "PostgreSQL"],
      tools: ["Git", "Jupyter", "Docker", "MLflow"],
      deployment: ["AWS", "FastAPI"],
    }
  },
  devops: {
    title: "DevOps & Cloud Engineer",
    skills: {
      backend: ["Linux", "Bash", "Python"],
      tools: ["Git", "GitHub Actions", "Terraform", "Ansible"],
      deployment: ["Docker", "Kubernetes", "AWS", "GCP", "CI/CD"],
    }
  }
};

const CATEGORY_LABELS = {
  frontend: "FRONTEND",
  backend: "BACKEND",
  database: "DATABASE",
  tools: "DEVELOPMENT & TOOLS",
  deployment: "DEPLOYMENT",
};

export default function JobAnalyzer({ profile, onGenerateRoadmap, onNavigate, onOpenVerification }) {
  const hasUploadedResume = Boolean(profile?.hasUploadedResume);

  // Main Mode Switcher: 'matrix' (Visual Chip Matrix) vs 'analyzer' (AI Job Description Analyzer)
  const [viewMode, setViewMode] = useState('matrix');

  // AI Analyzer States
  const [userSkillsText, setUserSkillsText] = useState(
    profile && profile.skills && profile.skills.length > 0
      ? `My skills: ${profile.skills.join(', ')}`
      : "I know HTML, CSS, JavaScript and React.\nI have basic knowledge of Node.js and SQL."
  );
  const [jdText, setJdText] = useState("Full Stack Developer with Node.js, React, Express, MongoDB, Docker and AWS experience.");
  const [analyzing, setAnalyzing] = useState(false);
  const [jobProfile, setJobProfile] = useState(null);
  const [gapReport, setGapReport] = useState(null);

  // Matrix View States
  const [targetRoleKey, setTargetRoleKey] = useState("fullstack");
  const [roleSkills, setRoleSkills] = useState(ROLE_PRESETS.fullstack.skills);
  const [userSkills, setUserSkills] = useState(() => {
    if (hasUploadedResume && Array.isArray(profile?.skills) && profile.skills.length > 0) {
      return profile.skills;
    }
    return [];
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [skillInput, setSkillInput] = useState("");

  // Sync profile skills on mount or change
  useEffect(() => {
    if (hasUploadedResume && Array.isArray(profile?.skills) && profile.skills.length > 0) {
      setUserSkills(profile.skills);
    } else if (!hasUploadedResume) {
      setUserSkills([]);
    }
  }, [profile, hasUploadedResume]);

  useEffect(() => {
    runComparison(userSkillsText, jdText);
  }, []);

  const runComparison = async (userText, jobText) => {
    if (!userText.trim() || !jobText.trim()) return;
    setAnalyzing(true);

    const uSkills = extractSkillsFromText(userText);
    const targetRole = ROLE_PRESETS[targetRoleKey]?.title || "Full Stack Developer";

    try {
      // Authoritative backend skill gap analysis (agrees with SkillGapDashboard)
      const res = await skillGapApi.analyzeSkillGap({
        resumeText: userText,
        userSkills: uSkills.length > 0 ? uSkills : (profile?.skills || []),
        targetRole,
        jobDescription: jobText,
        verifiedSkills: profile?.verifiedSkills || [],
        userId: profile?.id || profile?.email || "guest_user"
      });

      if (res && res.report) {
        const report = res.report;
        const matched = (report.strongSkills || []).map(s => s.skillName || s);
        const partial = (report.partialSkills || []).map(s => s.skillName || s);
        const missing = (report.missingSkills || []).map(s => s.skillName || s);

        const allMatched = [...new Set([...matched, ...partial])];

        setGapReport({
          matchScore: report.readinessScore ?? report.matchScore ?? (
            allMatched.length + missing.length > 0
              ? Math.round((allMatched.length / (allMatched.length + missing.length)) * 100)
              : 100
          ),
          matchedSkills: allMatched,
          missingSkills: missing
        });

        setJobProfile({
          roleTitle: report.targetRole || targetRole,
          requiredSkills: [...allMatched, ...missing]
        });

        if (uSkills.length > 0) {
          setUserSkills(prev => Array.from(new Set([...prev, ...uSkills])));
        }
      } else {
        fallbackLocalComparison(userText, jobText);
      }
    } catch (err) {
      console.warn("[JobAnalyzer] Backend skill gap API notice, using local fallback:", err.message);
      fallbackLocalComparison(userText, jobText);
    } finally {
      setAnalyzing(false);
    }
  };

  const fallbackLocalComparison = (userText, jobText) => {
    const uSkills = extractSkillsFromText(userText);
    const jProfile = analyzeJobDescription(jobText);
    const jSkills = extractSkillsFromText(jobText);
    const finalJobSkills = jSkills.length > 0 ? jSkills : jProfile.requiredSkills;
    const gapResults = detectSkillGap(uSkills, finalJobSkills, jProfile);

    setJobProfile(jProfile);
    setGapReport(gapResults);

    if (uSkills.length > 0) {
      setUserSkills(prev => Array.from(new Set([...prev, ...uSkills])));
    }
    if (jProfile && jProfile.roleCategories) {
      setRoleSkills(jProfile.roleCategories);
    }
  };

  const handleAnalyze = () => {
    runComparison(userSkillsText, jdText);
  };

  const handleSelectPreset = (preset) => {
    setJdText(preset.description);
    runComparison(userSkillsText, preset.description);
  };

  const handleLoadProfileSkills = () => {
    if (profile && profile.skills && profile.skills.length > 0) {
      const profileText = `My current skills: ${profile.skills.join(', ')}.`;
      setUserSkillsText(profileText);
      setUserSkills(profile.skills);
      runComparison(profileText, jdText);
    }
  };

  const handleRoleChange = (e) => {
    const roleKey = e.target.value;
    setTargetRoleKey(roleKey);
    if (ROLE_PRESETS[roleKey]) {
      setRoleSkills(ROLE_PRESETS[roleKey].skills);
    }
  };

  const allRoleSkills = useMemo(() => {
    return Object.values(roleSkills).flat();
  }, [roleSkills]);

  const matchedSkills = useMemo(() => {
    return userSkills.filter((skill) =>
      allRoleSkills.some(
        (requiredSkill) =>
          requiredSkill.toLowerCase().trim() === skill.toLowerCase().trim()
      )
    );
  }, [userSkills, allRoleSkills]);

  const matchPercentage = useMemo(() => {
    if (allRoleSkills.length === 0) return 0;
    return Math.round((matchedSkills.length / allRoleSkills.length) * 100);
  }, [matchedSkills, allRoleSkills]);

  const addRoleSkill = () => {
    const skill = skillInput.trim();
    if (!skill || !activeCategory) return;

    const currentCatSkills = roleSkills[activeCategory] || [];
    const alreadyExists = currentCatSkills.some(
      (s) => s.toLowerCase().trim() === skill.toLowerCase()
    );

    if (!alreadyExists) {
      setRoleSkills((prev) => ({
        ...prev,
        [activeCategory]: [...currentCatSkills, skill],
      }));
    }
    closeDialog();
  };

  const removeRoleSkill = (category, skillToRemove) => {
    setRoleSkills((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter(
        (s) => s.toLowerCase().trim() !== skillToRemove.toLowerCase().trim()
      ),
    }));
  };

  const addUserSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;

    const alreadyExists = userSkills.some(
      (s) => s.toLowerCase().trim() === skill.toLowerCase()
    );

    if (!alreadyExists) {
      setUserSkills((prev) => [...prev, skill]);
    }
    closeDialog();
  };

  const removeUserSkill = (skillToRemove) => {
    setUserSkills((prev) =>
      prev.filter(
        (s) => s.toLowerCase().trim() !== skillToRemove.toLowerCase().trim()
      )
    );
  };

  const openAddRoleDialog = (category) => {
    setActiveCategory(category);
    setSkillInput("");
  };

  const openAddUserDialog = () => {
    setActiveCategory('user');
    setSkillInput("");
  };

  const closeDialog = () => {
    setActiveCategory(null);
    setSkillInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (activeCategory === 'user') {
        addUserSkill();
      } else {
        addRoleSkill();
      }
    } else if (e.key === "Escape") {
      closeDialog();
    }
  };

  const triggerGenerateRoadmap = (missingSkills) => {
    if (onGenerateRoadmap) {
      onGenerateRoadmap(missingSkills, ROLE_PRESETS[targetRoleKey]?.title);
    } else if (onNavigate) {
      onNavigate('roadmap');
    }
  };

  const missingRoleSkills = useMemo(() => {
    return allRoleSkills.filter(
      (skill) =>
        !userSkills.some(
          (uSkill) => uSkill.toLowerCase().trim() === skill.toLowerCase().trim()
        )
    );
  }, [allRoleSkills, userSkills]);

  return (
    <div className="space-y-6 animate-fade-in text-white pb-12 select-none">
      {/* Top Banner Notice */}
      {!hasUploadedResume && (
        <div className="cartoon-card p-4 border-2 border-yellow-500/40 bg-yellow-950/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-200 font-bold">
              Showing standard template skills. Upload your resume for automated tailored scoring.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('resume')}
              className="cartoon-btn cartoon-btn-yellow py-1.5 px-4 text-xs font-black shrink-0"
            >
              Upload Resume ›
            </button>
          )}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setViewMode('matrix')}
          className={`cartoon-btn text-xs font-black py-2.5 px-5 gap-2 ${
            viewMode === 'matrix' ? 'cartoon-btn-purple' : 'cartoon-btn-dark'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Competency Matrix</span>
        </button>

        <button
          onClick={() => setViewMode('analyzer')}
          className={`cartoon-btn text-xs font-black py-2.5 px-5 gap-2 ${
            viewMode === 'analyzer' ? 'cartoon-btn-purple' : 'cartoon-btn-dark'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Job Description Matcher</span>
        </button>
      </div>

      {/* ================================================================ */}
      {/* VIEW MODE 1: VISUAL COMPETENCY MATRIX */}
      {/* ================================================================ */}
      {viewMode === 'matrix' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="cartoon-card p-6 border-2 border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-black text-white">Target Role Match</h2>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Live interactive readiness matrix comparing your profile against verified job benchmarks.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                value={targetRoleKey}
                onChange={handleRoleChange}
                className="cartoon-btn cartoon-btn-dark text-xs font-black py-2.5 px-4 rounded-2xl bg-[#151b2e] border-2 border-purple-500/30 text-white cursor-pointer focus:outline-none"
              >
                {Object.entries(ROLE_PRESETS).map(([key, role]) => (
                  <option key={key} value={key} className="bg-[#0d1220] text-white">
                    {role.title}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3 bg-[#0d1220] border-2 border-purple-500/30 px-4 py-2 rounded-2xl">
                <span className="text-xl font-black text-purple-400">{matchPercentage}%</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fit</span>
              </div>
            </div>
          </div>

          {/* Matrix Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Required Role Skills */}
            <div className="cartoon-card p-6 border-2 border-purple-500/30 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white">Required Role Competencies</h3>
                  <p className="text-[10px] text-gray-400">Industry standard requirements for this position</p>
                </div>
                <span className="cartoon-badge cartoon-badge-purple text-xs">
                  {allRoleSkills.length} Total
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(roleSkills).map(([catKey, skills]) => (
                  <div key={catKey} className="space-y-2">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">
                      {CATEGORY_LABELS[catKey] || catKey}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => {
                        const isLearned = userSkills.some(
                          (uSkill) => uSkill.toLowerCase().trim() === skill.toLowerCase().trim()
                        );
                        return (
                          <div
                            key={idx}
                            className={`group relative inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-all select-none ${
                              isLearned
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm'
                                : 'bg-[#151b2e] border-purple-500/20 text-gray-400 hover:border-purple-500/40'
                            }`}
                          >
                            <span>{isLearned ? '✓' : '•'} {skill}</span>
                            <button
                              onClick={() => removeRoleSkill(catKey, skill)}
                              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 text-xs ml-0.5"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => openAddRoleDialog(catKey)}
                        className="text-xs font-bold px-2.5 py-1 rounded-xl border border-dashed border-purple-500/40 text-purple-400 hover:bg-purple-950/20"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Skills */}
            <div className="cartoon-card p-6 border-2 border-purple-500/30 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white">Your Current Skills</h3>
                  <p className="text-[10px] text-gray-400">Extracted from resume or added manually</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="cartoon-badge cartoon-badge-mint text-xs">
                    {userSkills.length} Verified
                  </span>
                  <button
                    onClick={openAddUserDialog}
                    className="cartoon-btn cartoon-btn-mint text-xs font-black py-1 px-2.5"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {userSkills.length === 0 ? (
                  <p className="text-xs text-gray-500 italic p-4">No skills loaded. Add custom skills or upload resume.</p>
                ) : (
                  userSkills.map((skill, idx) => {
                    const isRequired = allRoleSkills.some(
                      (rSkill) => rSkill.toLowerCase().trim() === skill.toLowerCase().trim()
                    );
                    return (
                      <div
                        key={idx}
                        className={`group relative inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-all ${
                          isRequired
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                            : 'bg-[#151b2e] border-white/10 text-gray-300'
                        }`}
                      >
                        <span>{skill}</span>
                        {onOpenVerification && (
                          <button
                            onClick={() => onOpenVerification(skill)}
                            className="text-[10px] text-emerald-400 hover:underline ml-1 font-black"
                            title="Verify skill"
                          >
                            [Verify]
                          </button>
                        )}
                        <button
                          onClick={() => removeUserSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 text-xs ml-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {missingRoleSkills.length > 0 && (
                <div className="pt-4 border-t-2 border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                      Identified Missing Skills ({missingRoleSkills.length})
                    </span>
                  </div>
                  <button
                    onClick={() => triggerGenerateRoadmap(missingRoleSkills)}
                    className="cartoon-btn cartoon-btn-purple w-full py-3 text-xs font-black gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Generate Personalized Roadmap for Missing Skills ›</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Skill Dialog Modal */}
          {activeCategory && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="cartoon-card p-6 border-2 border-purple-400 max-w-sm w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">
                    Add New {activeCategory === 'user' ? 'Profile' : 'Role'} Skill
                  </h3>
                  <button onClick={closeDialog} className="text-gray-400 hover:text-white font-bold">✕</button>
                </div>

                <input
                  type="text"
                  placeholder="Enter skill name (e.g. Docker, TypeScript)..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full px-4 py-3 bg-[#0d1220] border-2 border-purple-500/30 rounded-2xl text-xs text-white font-bold focus:outline-none focus:border-purple-400"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={closeDialog} className="cartoon-btn cartoon-btn-dark py-2 px-4 text-xs font-bold">
                    Cancel
                  </button>
                  <button onClick={activeCategory === 'user' ? addUserSkill : addRoleSkill} className="cartoon-btn cartoon-btn-purple py-2 px-5 text-xs font-black">
                    Add Skill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW MODE 2: AI JOB DESCRIPTION & PRESET ANALYZER */}
      {/* ================================================================ */}
      {viewMode === 'analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="cartoon-card p-5 border-2 border-purple-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider">
                  1. Your Current Skills / Profile
                </h3>
                {profile && profile.skills && (
                  <button onClick={handleLoadProfileSkills} className="text-xs font-bold text-cyan-300 hover:underline">
                    Load Saved
                  </button>
                )}
              </div>
              <textarea
                value={userSkillsText}
                onChange={(e) => setUserSkillsText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-[#0d1220] border-2 border-purple-500/30 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-400 font-medium resize-none"
              />
            </div>

            <div className="cartoon-card p-5 border-2 border-purple-500/25 space-y-3">
              <h3 className="text-xs font-black text-pink-300 uppercase tracking-wider">
                2. Target Job Description / Role
              </h3>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-[#0d1220] border-2 border-purple-500/30 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-400 font-mono resize-none"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!userSkillsText.trim() || !jdText.trim() || analyzing}
              className="cartoon-btn cartoon-btn-purple w-full py-3.5 text-xs font-black gap-2 disabled:opacity-50"
            >
              {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
              <span>{analyzing ? "Extracting Skills via Backend..." : "Compare Skills (Unified Analysis)"}</span>
            </button>

            {/* Company Presets */}
            <div className="cartoon-card p-5 border-2 border-purple-500/25 space-y-3">
              <h3 className="text-xs font-black text-yellow-300 uppercase tracking-wider">Target Company Presets</h3>
              <div className="space-y-2">
                {JOB_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="cartoon-card cartoon-card-interactive w-full text-left p-3.5 border-2 border-purple-500/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-black text-white block">{preset.company}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{preset.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Output */}
          <div className="lg:col-span-7 space-y-6">
            {!analyzing && gapReport && (
              <div className="cartoon-card p-6 border-2 border-purple-500/30 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b-2 border-white/10">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 border-2 border-white/20 flex flex-col items-center justify-center text-white font-black shadow-lg">
                    <span className="text-2xl leading-none">{gapReport.matchScore}%</span>
                    <span className="text-[8px] uppercase tracking-wider mt-1 font-bold">Match</span>
                  </div>
                  <div>
                    <div className="cartoon-badge cartoon-badge-purple text-[10px] mb-1">Detected Role</div>
                    <h3 className="text-lg font-black text-white">{jobProfile?.roleTitle || "Full Stack Developer"}</h3>
                    <p className="text-xs text-gray-300 font-medium">Matched {gapReport.matchedSkills.length} expected competencies</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Matched Skills ({gapReport.matchedSkills.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {gapReport.matchedSkills.map((s, idx) => (
                      <span key={idx} className="cartoon-badge cartoon-badge-mint text-xs">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider">Missing Skills ({gapReport.missingSkills.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {gapReport.missingSkills.map((s, idx) => (
                      <span key={idx} className="cartoon-badge cartoon-badge-pink text-xs">
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => triggerGenerateRoadmap(gapReport.missingSkills)}
                  className="cartoon-btn cartoon-btn-purple w-full py-3 text-xs font-black gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Generate Tailored Roadmap</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
