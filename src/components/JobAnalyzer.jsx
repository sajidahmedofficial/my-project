// agent-notes: { ctx: "Unified Job & Skill Gap Analyzer supporting AI Job Description extraction, Company Presets, and Interactive Competency Matrix", deps: ["lucide-react", "../utils/mockData", "../utils/aiSimulator", "./SkillGapAnalysis.css"], state: "active", last: "anti@2026-08-06" }
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Zap,
  RefreshCw,
  AlertCircle,
  UserCheck,
  ArrowDown,
  Layers,
  Award,
  Grid,
  FileText
} from 'lucide-react';
import { JOB_PRESETS } from '../utils/mockData';
import { analyzeJobDescription, detectSkillGap, extractSkillsFromText } from '../utils/aiSimulator';
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

const INITIAL_USER_SKILLS = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "SQL",
];

const CATEGORY_LABELS = {
  frontend: "FRONTEND",
  backend: "BACKEND",
  database: "DATABASE",
  tools: "DEVELOPMENT & TOOLS",
  deployment: "DEPLOYMENT",
};

export default function JobAnalyzer({ profile, onGenerateRoadmap, onNavigate }) {
  const hasUploadedResume = Boolean(profile?.hasUploadedResume);

  // Main Mode Switcher: 'matrix' (Visual Chip Matrix) vs 'analyzer' (AI Job Description Analyzer)
  const [viewMode, setViewMode] = useState('matrix');

  // AI Analyzer States (Old Feature)
  const [userSkillsText, setUserSkillsText] = useState(
    profile && profile.skills && profile.skills.length > 0
      ? `My skills: ${profile.skills.join(', ')}`
      : "I know HTML, CSS, JavaScript and React.\nI have basic knowledge of Node.js and SQL."
  );
  const [jdText, setJdText] = useState("Full Stack Developer with Node.js, React, Express, MongoDB, Docker and AWS experience.");
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedUserSkills, setExtractedUserSkills] = useState([]);
  const [extractedJobSkills, setExtractedJobSkills] = useState([]);
  const [jobProfile, setJobProfile] = useState(null);
  const [gapReport, setGapReport] = useState(null);

  // Matrix View States (New Feature)
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

  // Initial auto-run for AI analyzer
  useEffect(() => {
    runComparison(userSkillsText, jdText);
  }, []);

  // Run AI Comparison
  const runComparison = (userText, jobText) => {
    if (!userText.trim() || !jobText.trim()) return;

    setAnalyzing(true);

    setTimeout(() => {
      const uSkills = extractSkillsFromText(userText);
      const jProfile = analyzeJobDescription(jobText);
      const jSkills = extractSkillsFromText(jobText);
      const finalJobSkills = jSkills.length > 0 ? jSkills : jProfile.requiredSkills;

      const gapResults = detectSkillGap(uSkills, finalJobSkills, jProfile);

      setExtractedUserSkills(uSkills);
      setExtractedJobSkills(finalJobSkills);
      setJobProfile(jProfile);
      setGapReport(gapResults);

      // Also update userSkills and roleSkills for Matrix if extracted
      if (uSkills.length > 0) {
        setUserSkills(prev => Array.from(new Set([...prev, ...uSkills])));
      }
      if (jProfile && jProfile.roleCategories) {
        setRoleSkills(jProfile.roleCategories);
      }

      setAnalyzing(false);
    }, 400);
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

  // Target role preset change in Matrix view
  const handleRoleChange = (e) => {
    const roleKey = e.target.value;
    setTargetRoleKey(roleKey);
    if (ROLE_PRESETS[roleKey]) {
      setRoleSkills(ROLE_PRESETS[roleKey].skills);
    }
  };

  /*
   * Matrix calculations
   */
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

  /*
   * Matrix Chip Modifications
   */
  const addRoleSkill = () => {
    const skill = skillInput.trim();
    if (!skill || !activeCategory) return;

    const currentCatSkills = roleSkills[activeCategory] || [];
    const alreadyExists = currentCatSkills.some(
      (existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setRoleSkills((previous) => ({
      ...previous,
      [activeCategory]: [...(previous[activeCategory] || []), skill],
    }));

    setSkillInput("");
    setActiveCategory(null);
  };

  const removeRoleSkill = (category, skillToRemove) => {
    setRoleSkills((previous) => ({
      ...previous,
      [category]: (previous[category] || []).filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const addUserSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;

    const alreadyExists = userSkills.some(
      (existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setUserSkills((previous) => [...previous, skill]);
    setSkillInput("");
    setActiveCategory(null);
  };

  const removeUserSkill = (skillToRemove) => {
    setUserSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  const openRoleSkillDialog = (category) => {
    setActiveCategory(category);
    setSkillInput("");
  };

  const openUserSkillDialog = () => {
    setActiveCategory("user");
    setSkillInput("");
  };

  const closeDialog = () => {
    setActiveCategory(null);
    setSkillInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    if (activeCategory === "user") {
      addUserSkill();
    } else {
      addRoleSkill();
    }
  };

  const triggerGenerateRoadmap = (skillsList) => {
    const missing = skillsList || allRoleSkills.filter(
      (requiredSkill) =>
        !userSkills.some(
          (userSkill) =>
            userSkill.toLowerCase().trim() === requiredSkill.toLowerCase().trim()
        )
    );

    const targetRoleTitle = ROLE_PRESETS[targetRoleKey]?.title || "Frontend Developer";

    if (onGenerateRoadmap) {
      onGenerateRoadmap(missing, targetRoleTitle);
    } else {
      alert(`Roadmap generated for ${targetRoleTitle}!\n\nMissing skills:\n${missing.join("\n")}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent-purple" /> Job & Skill Gap Analyzer
          </h2>
          <p className="text-xs text-gray-400">
            Compare target role requirements, analyze custom job descriptions, and identify missing competencies
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center p-1 bg-gray-900 border border-gray-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'matrix'
                ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Interactive Skill Matrix
          </button>
          <button
            onClick={() => setViewMode('analyzer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'analyzer'
                ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> AI Job & Preset Analyzer
          </button>
        </div>
      </div>

      {/* UPLOAD-FIRST CHECK */}
      {!hasUploadedResume ? (
        <div className="glass rounded-2xl p-8 border border-gray-800 text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center text-accent-purple mx-auto shadow-lg shadow-purple-500/10">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-white">Upload Your Resume to View Skill Gap & Role Match</h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
            Please upload your PDF or DOCX resume to let our AI evaluate your target role competencies, calculate your match score, and identify missing skills.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate && onNavigate('resume')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 hover:opacity-95"
            >
              <Zap className="w-4 h-4" /> Go to Resume Analyzer & Upload Resume ›
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ================================================================ */}
          {/* VIEW MODE 1: INTERACTIVE SKILL MATRIX */}
          {/* ================================================================ */}
          {viewMode === 'matrix' && (
        <div className="skill-page rounded-2xl border border-gray-800">

          {/* ================= TOP SECTION ================= */}
          <div className="top-section">
            <div className="match-card">
              <div className="match-number">
                {matchPercentage}%
              </div>
              <div className="match-label">
                MATCH
              </div>
            </div>

            <div className="role-info">
              <div className="target-label-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div className="target-label">
                  <span>◈</span>
                  TARGET ROLE
                </div>

                <select
                  value={targetRoleKey}
                  onChange={handleRoleChange}
                  className="role-selector-dropdown"
                  aria-label="Select Target Goal / Role"
                >
                  {Object.entries(ROLE_PRESETS).map(([key, role]) => (
                    <option key={key} value={key}>
                      {role.title}
                    </option>
                  ))}
                </select>
              </div>

              <h1>
                {ROLE_PRESETS[targetRoleKey]?.title || jobProfile?.roleTitle || "Full Stack Developer"}
              </h1>

              <h3>
                Matched{" "}
                <span>{matchedSkills.length}</span>{" "}
                competencies expected for this role
              </h3>

              <p>
                Your match is based on the competencies
                expected for the {ROLE_PRESETS[targetRoleKey]?.title || "Full Stack Developer"} role.
              </p>
            </div>

            <button
              className="roadmap-button"
              onClick={() => triggerGenerateRoadmap()}
            >
              <span>
                Generate
                <br />
                Roadmap
              </span>
              <strong>›</strong>
            </button>
          </div>

          <div className="divider" />

          {/* ================= ROLE REQUIREMENTS ================= */}
          <section>
            <div className="section-title">
              <span className="section-icon">♙</span>
              ROLE REQUIREMENTS PROFILE
            </div>

            <div className="requirements-grid">
              {Object.entries(roleSkills).map(
                ([category, skills]) => (
                  <div
                    className="requirement-card"
                    key={category}
                  >
                    <h2>
                      {CATEGORY_LABELS[category] || category.toUpperCase()}
                    </h2>

                    <div className="skill-list">
                      {(skills || []).map((skill) => (
                        <div
                          className={`skill-chip ${
                            matchedSkills.some(
                              (matched) =>
                                matched.toLowerCase().trim() ===
                                skill.toLowerCase().trim()
                            )
                              ? "matched"
                              : "required"
                          }`}
                          key={skill}
                        >
                          <span>{skill}</span>

                          <button
                            className="remove-button"
                            onClick={() =>
                              removeRoleSkill(
                                category,
                                skill
                              )
                            }
                            title={`Remove ${skill}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <button
                        className="add-skill-button"
                        onClick={() =>
                          openRoleSkillDialog(category)
                        }
                      >
                        <span>+</span>
                        Add Skill
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* ================= SKILL COMPARISON ================= */}
          <section className="comparison-section">
            <div className="section-title">
              SKILL COMPARISON
            </div>

            <div className="your-skills-card">
              <div className="your-skills-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0 }}>
                  YOUR SKILLS ({userSkills.length})
                </h2>

                {profile && profile.skills && (
                  <button 
                    className="sync-profile-button"
                    onClick={handleLoadProfileSkills}
                    title="Sync skills from current user profile"
                  >
                    ⚡ Sync Profile Skills ({profile.name ? profile.name.split(' ')[0] : 'User'})
                  </button>
                )}
              </div>

              <div className="user-skills">
                {userSkills.map((skill) => (
                  <div
                    className="user-skill-chip"
                    key={skill}
                  >
                    <span>{skill}</span>

                    <button
                      className="remove-button"
                      onClick={() =>
                        removeUserSkill(skill)
                      }
                      title={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  className="add-skill-button user-add"
                  onClick={openUserSkillDialog}
                >
                  <span>+</span>
                  Add Skill
                </button>
              </div>
            </div>
          </section>

          {/* ================= BOTTOM INFO ================= */}
          <div className="bottom-arrow">
            ↓
          </div>

          <div className="tip">
            <span>💡</span>
            Select a Target Role, or add/remove skills to see how it impacts
            your match percentage. Switch to AI Job Analyzer to paste custom Job Descriptions!
          </div>

          {/* ================= ADD SKILL MODAL ================= */}
          {activeCategory && (
            <div
              className="modal-overlay"
              onClick={closeDialog}
            >
              <div
                className="skill-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  className="modal-close"
                  onClick={closeDialog}
                >
                  ×
                </button>

                <h2>Add Skill</h2>

                <p>
                  {activeCategory === "user"
                    ? "Add a skill you currently have."
                    : `Add a skill to ${
                        CATEGORY_LABELS[activeCategory] || activeCategory.toUpperCase()
                      } requirements.`}
                </p>

                <input
                  type="text"
                  placeholder="Enter skill name..."
                  value={skillInput}
                  onChange={(event) =>
                    setSkillInput(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  autoFocus
                />

                <div className="modal-actions">
                  <button
                    className="cancel-button"
                    onClick={closeDialog}
                  >
                    Cancel
                  </button>

                  <button
                    className="confirm-button"
                    onClick={
                      activeCategory === "user"
                        ? addUserSkill
                        : addRoleSkill
                    }
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW MODE 2: AI JOB DESCRIPTION & PRESET ANALYZER (OLD FEATURE) */}
      {/* ================================================================ */}
      {viewMode === 'analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 2 Inputs & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Input 1: Your Current Skills / Profile */}
            <div className="glass rounded-xl p-5 space-y-3 border border-gray-800 focus-within:border-accent-purple/50 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-purple/20 text-accent-purple text-xs flex items-center justify-center font-bold">1</span>
                  Your Current Skills / Profile
                </h3>
                {profile && profile.skills && profile.skills.length > 0 && (
                  <button
                    onClick={handleLoadProfileSkills}
                    className="text-[11px] text-accent-purple hover:underline flex items-center gap-1 font-medium"
                  >
                    <UserCheck className="w-3 h-3" /> Load Saved Skills
                  </button>
                )}
              </div>
              <textarea
                value={userSkillsText}
                onChange={(e) => setUserSkillsText(e.target.value)}
                placeholder="e.g. I know HTML, CSS, JavaScript and React. I have basic knowledge of Node.js and SQL."
                rows={4}
                className="w-full px-3 py-2 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple resize-none leading-relaxed"
              />
            </div>

            {/* Input 2: Target Job Description or Role */}
            <div className="glass rounded-xl p-5 space-y-3 border border-gray-800 focus-within:border-accent-purple/50 transition-colors">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-purple/20 text-accent-purple text-xs flex items-center justify-center font-bold">2</span>
                Target Job Description / Role
              </h3>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="e.g. Full Stack Developer or paste full job description..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple resize-none leading-relaxed font-mono"
              />
            </div>

            {/* Compare Button */}
            <button
              onClick={handleAnalyze}
              disabled={!userSkillsText.trim() || !jdText.trim() || analyzing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-purple/20 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Extracting Skills & Analyzing Role...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" /> Compare Skills
                </>
              )}
            </button>

            {/* Target Company Presets */}
            <div className="glass rounded-xl p-5 space-y-3 border border-gray-800">
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Select Target Company Preset</h3>
              <div className="space-y-2">
                {JOB_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-3 rounded-lg border border-gray-800 hover:border-gray-700 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{preset.company}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{preset.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Role Detection & Skill Gap Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {analyzing && (
              <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                <div className="w-12 h-12 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Running Role & Skill Analysis...</h4>
                  <p className="text-xs text-gray-500">Detecting role competencies, mandatory skills, and weighted match score</p>
                </div>
              </div>
            )}

            {!analyzing && gapReport && (
              <div className="glass rounded-xl p-6 space-y-6 border border-gray-800">
                {/* Header Match Badge & Role Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 ${
                      gapReport.matchScore >= 75 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-emerald-500/10' 
                        : gapReport.matchScore >= 50 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-amber-500/10' 
                        : 'bg-red-500/10 border-red-500 text-red-400 shadow-red-500/10'
                    }`}>
                      <span className="text-2xl font-black leading-none">{gapReport.matchScore}%</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-gray-300">Match</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-accent-purple/20 text-accent-purple text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                          <Layers className="w-3 h-3" /> TARGET ROLE
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {jobProfile?.roleTitle || "Full Stack Developer"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Matched <span className="text-emerald-400 font-bold">{gapReport.matchedSkills.length}</span> competencies expected for this role
                      </p>
                      <p className="text-[10px] text-gray-500 italic mt-1">
                        Your match is based on the competencies expected for the {jobProfile?.roleTitle || "Full Stack Developer"} role.
                      </p>
                    </div>
                  </div>

                  {gapReport.missingSkills.length > 0 && (
                    <button
                      onClick={() => triggerGenerateRoadmap(gapReport.missingSkills)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-accent-purple/20 self-start sm:self-center"
                    >
                      Generate Roadmap <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Categorized Role Requirements */}
                {jobProfile && jobProfile.roleCategories && (
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-accent-purple" /> Role Requirements Profile
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(jobProfile.roleCategories).map(([catName, catSkills]) => (
                        <div key={catName} className="p-3 rounded-lg border border-gray-800 bg-gray-900/60 space-y-1.5">
                          <span className="text-[11px] font-bold text-accent-purple uppercase tracking-wider block">
                            {catName}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {catSkills.map((sk, idx) => {
                              const isMatched = gapReport.matchedSkills.some(m => m.toLowerCase().trim() === sk.toLowerCase().trim());
                              return (
                                <span 
                                  key={idx} 
                                  className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                                    isMatched 
                                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                                  }`}
                                >
                                  {sk}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Comparison Breakdown */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Skill Comparison</h4>

                  <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                      <span className="flex items-center gap-1.5 text-accent-purple font-bold">
                        YOUR SKILLS ({extractedUserSkills.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedUserSkills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center text-gray-600">
                    <ArrowDown className="w-5 h-5 animate-pulse text-accent-purple" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                      <h5 className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-1.5 tracking-wider">
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> Matched Skills ({gapReport.matchedSkills.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {gapReport.matchedSkills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {skill}
                          </span>
                        ))}
                        {gapReport.matchedSkills.length === 0 && (
                          <span className="text-xs text-gray-500 italic">No matching skills found</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                      <h5 className="text-xs uppercase font-bold text-red-400 flex items-center gap-1.5 tracking-wider">
                        <XCircle className="w-4 h-4 text-red-400" /> Skill Gaps ({gapReport.missingSkills.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {gapReport.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/20 text-red-300 border border-red-500/30">
                            {skill}
                          </span>
                        ))}
                        {gapReport.missingSkills.length === 0 && (
                          <span className="text-xs text-emerald-400 italic font-medium">Perfect fit! Zero gaps detected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tools & Responsibilities */}
                {jobProfile && (
                  <div className="pt-4 border-t border-gray-800 space-y-4">
                    {jobProfile.tools && jobProfile.tools.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Required Tools & Version Control</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {jobProfile.tools.map((tool, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs rounded-lg bg-gray-800 text-gray-300 border border-gray-700">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {jobProfile.responsibilities && jobProfile.responsibilities.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Core Responsibilities</h4>
                        <ul className="space-y-2 text-xs text-gray-300">
                          {jobProfile.responsibilities.map((resp, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-1.5 shrink-0" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!analyzing && !gapReport && (
              <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px] border-dashed border-gray-800">
                <AlertCircle className="w-12 h-12 text-gray-600" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Ready for Skill Gap Comparison</h4>
                  <p className="text-xs text-gray-500">Provide your current skills and target job description on the left to calculate match percentage</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
