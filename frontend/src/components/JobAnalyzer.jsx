// agent-notes: { ctx: "Clean minimal SaaS Unified Job & Skill Gap Analyzer with backend skillGapApi integration, Competency Matrix & AI extraction", deps: ["lucide-react", "../services/skillGapApi", "../utils/mockData", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-27" }
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Briefcase, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle, 
  Grid, 
  FileText, 
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Plus
} from 'lucide-react';
import { JOB_PRESETS } from '../utils/mockData';
import { analyzeJobDescription, detectSkillGap, extractSkillsFromText } from '../utils/aiSimulator';
import { skillGapApi } from '../services/skillGapApi';

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
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  tools: "Tools & Development",
  deployment: "Deployment & Cloud",
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
      console.warn("Backend skill gap comparison failed, using local AI fallback:", err);
      fallbackLocalComparison(userText, jobText);
    } finally {
      setAnalyzing(false);
    }
  };

  const fallbackLocalComparison = (userText, jobText) => {
    const jobParsed = analyzeJobDescription(jobText);
    setJobProfile(jobParsed);
    const gap = detectSkillGap(userText, jobParsed.requiredSkills);
    setGapReport(gap);
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
      const skillsStr = `My skills: ${profile.skills.join(', ')}`;
      setUserSkillsText(skillsStr);
      runComparison(skillsStr, jdText);
    }
  };

  const allRoleSkills = useMemo(() => {
    return Object.values(roleSkills).flat();
  }, [roleSkills]);

  const matchPercentage = useMemo(() => {
    if (allRoleSkills.length === 0) return 0;
    const matchedCount = allRoleSkills.filter((roleSkill) =>
      userSkills.some(
        (uSkill) => uSkill.toLowerCase().trim() === roleSkill.toLowerCase().trim()
      )
    ).length;
    return Math.round((matchedCount / allRoleSkills.length) * 100);
  }, [allRoleSkills, userSkills]);

  const handleRoleChange = (e) => {
    const newRoleKey = e.target.value;
    setTargetRoleKey(newRoleKey);
    setRoleSkills(ROLE_PRESETS[newRoleKey]?.skills || {});
  };

  const removeRoleSkill = (category, skillToRemove) => {
    setRoleSkills((prev) => ({
      ...prev,
      [category]: prev[category].filter((s) => s !== skillToRemove),
    }));
  };

  const removeUserSkill = (skillToRemove) => {
    setUserSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const openAddRoleDialog = (category) => {
    setActiveCategory(category);
    setSkillInput("");
  };

  const openAddUserDialog = () => {
    setActiveCategory("user");
    setSkillInput("");
  };

  const closeDialog = () => {
    setActiveCategory(null);
    setSkillInput("");
  };

  const addRoleSkill = () => {
    if (!skillInput.trim() || !activeCategory) return;
    setRoleSkills((prev) => ({
      ...prev,
      [activeCategory]: [...(prev[activeCategory] || []), skillInput.trim()],
    }));
    closeDialog();
  };

  const addUserSkill = () => {
    if (!skillInput.trim()) return;
    const trimmed = skillInput.trim();
    if (!userSkills.includes(trimmed)) {
      setUserSkills((prev) => [...prev, trimmed]);
    }
    closeDialog();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (activeCategory === "user") {
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
    <div className="space-y-6 text-slate-900 pb-12">
      {/* Top Banner Notice if no resume uploaded */}
      {!hasUploadedResume && (
        <div className="saas-card p-4 bg-amber-50/60 border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="text-xs text-amber-900 font-medium">
              Showing standard template skills. Upload your resume for automatic parsing and custom role matching.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('resume')}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline shrink-0"
            >
              Upload Resume →
            </button>
          )}
        </div>
      )}

      {/* Segmented View Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Competency Matrix
          </button>
          <button
            onClick={() => setViewMode('analyzer')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'analyzer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Job Description Matcher
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: VISUAL COMPETENCY MATRIX */}
      {viewMode === 'matrix' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="saas-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Role Competency Matrix</h2>
              </div>
              <p className="text-xs text-slate-500">
                Interactive matrix comparing your current profile against role benchmarks
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={targetRoleKey}
                onChange={handleRoleChange}
                className="bg-white border border-slate-200 text-xs font-semibold text-slate-900 py-1.5 px-3 rounded-lg cursor-pointer focus:outline-none focus:border-indigo-600"
              >
                {Object.entries(ROLE_PRESETS).map(([key, role]) => (
                  <option key={key} value={key} className="text-slate-900">
                    {role.title}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-bold text-indigo-600">{matchPercentage}%</span>
                <span className="text-[11px] text-slate-500 font-medium">Match</span>
              </div>
            </div>
          </div>

          {/* Matrix Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Required Role Skills */}
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Required Competencies</h3>
                  <p className="text-[11px] text-slate-500">Industry standard requirements</p>
                </div>
                <span className="saas-badge text-xs">
                  {allRoleSkills.length} Total
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(roleSkills).map(([catKey, skills]) => (
                  <div key={catKey} className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      {CATEGORY_LABELS[catKey] || catKey}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill, idx) => {
                        const isLearned = userSkills.some(
                          (uSkill) => uSkill.toLowerCase().trim() === skill.toLowerCase().trim()
                        );
                        return (
                          <div
                            key={idx}
                            className={`group relative inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all ${
                              isLearned
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{isLearned ? '✓' : '•'} {skill}</span>
                            <button
                              onClick={() => removeRoleSkill(catKey, skill)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 text-xs ml-0.5"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => openAddRoleDialog(catKey)}
                        className="text-xs font-medium px-2 py-0.5 rounded border border-dashed border-slate-300 text-slate-500 hover:border-indigo-600 hover:text-indigo-600"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Skills */}
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Your Profile Skills</h3>
                  <p className="text-[11px] text-slate-500">From uploaded resume or added manually</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="saas-badge text-xs">
                    {userSkills.length} Skills
                  </span>
                  <button
                    onClick={openAddUserDialog}
                    className="saas-btn-secondary py-1 px-2 text-xs"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {userSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-2">No skills loaded yet.</p>
                ) : (
                  userSkills.map((skill, idx) => {
                    const isRequired = allRoleSkills.some(
                      (rSkill) => rSkill.toLowerCase().trim() === skill.toLowerCase().trim()
                    );
                    return (
                      <div
                        key={idx}
                        className={`group relative inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all ${
                          isRequired
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{skill}</span>
                        {onOpenVerification && (
                          <button
                            onClick={() => onOpenVerification(skill)}
                            className="text-[10px] text-indigo-600 hover:underline font-semibold ml-0.5"
                            title="Verify skill"
                          >
                            [Verify]
                          </button>
                        )}
                        <button
                          onClick={() => removeUserSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 text-xs ml-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {missingRoleSkills.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-700">
                      Identified Missing Skills ({missingRoleSkills.length})
                    </span>
                  </div>
                  <button
                    onClick={() => triggerGenerateRoadmap(missingRoleSkills)}
                    className="saas-btn-primary w-full py-2.5 text-xs font-medium gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Personalized Learning Roadmap for Missing Skills</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Skill Dialog Modal */}
          {activeCategory && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="saas-card p-6 border border-slate-200 max-w-sm w-full space-y-4 shadow-modal">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Add New {activeCategory === 'user' ? 'Profile' : 'Role'} Skill
                  </h3>
                  <button onClick={closeDialog} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                </div>

                <input
                  type="text"
                  placeholder="e.g. TypeScript, Docker, Kubernetes..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={closeDialog} className="saas-btn-secondary py-1.5 px-3 text-xs">
                    Cancel
                  </button>
                  <button onClick={activeCategory === 'user' ? addUserSkill : addRoleSkill} className="saas-btn-primary py-1.5 px-4 text-xs font-medium">
                    Add Skill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: AI JOB DESCRIPTION & PRESET ANALYZER */}
      {viewMode === 'analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="saas-card p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  1. Your Current Skills / Profile
                </h3>
                {profile && profile.skills && (
                  <button onClick={handleLoadProfileSkills} className="text-xs font-semibold text-indigo-600 hover:underline">
                    Load Profile
                  </button>
                )}
              </div>
              <textarea
                value={userSkillsText}
                onChange={(e) => setUserSkillsText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600 resize-none"
              />
            </div>

            <div className="saas-card p-5 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                2. Target Job Description
              </h3>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600 resize-none font-mono text-[11px]"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!userSkillsText.trim() || !jdText.trim() || analyzing}
              className="saas-btn-primary w-full py-2.5 text-xs font-medium gap-2 disabled:opacity-50"
            >
              {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{analyzing ? "Extracting & Matching Skills..." : "Compare Skills"}</span>
            </button>

            {/* Company Presets */}
            <div className="saas-card p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Company Job Presets</h3>
              <div className="space-y-2">
                {JOB_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">{preset.company}</span>
                      <span className="text-[11px] text-slate-500">{preset.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Output */}
          <div className="lg:col-span-7 space-y-6">
            {!analyzing && gapReport && (
              <div className="saas-card p-6 space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-bold">
                    <span className="text-xl leading-none">{gapReport.matchScore}%</span>
                    <span className="text-[9px] uppercase tracking-wider mt-1 text-slate-400 font-medium">Match</span>
                  </div>
                  <div>
                    <div className="saas-badge text-[10px] mb-1">Target Role</div>
                    <h3 className="text-base font-bold text-slate-900">{jobProfile?.roleTitle || "Full Stack Developer"}</h3>
                    <p className="text-xs text-slate-500">Matched {gapReport.matchedSkills.length} expected competencies</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Matched Skills ({gapReport.matchedSkills.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {gapReport.matchedSkills.map((s, idx) => (
                      <span key={idx} className="saas-badge saas-badge-success text-xs">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Missing Skills ({gapReport.missingSkills.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {gapReport.missingSkills.map((s, idx) => (
                      <span key={idx} className="saas-badge saas-badge-danger text-xs">
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => triggerGenerateRoadmap(gapReport.missingSkills)}
                  className="saas-btn-primary w-full py-2.5 text-xs font-medium gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Tailored Roadmap for Missing Skills</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
