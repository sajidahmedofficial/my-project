// agent-notes: { ctx: "Playful cartoon Unified Job & Skill Gap Analyzer with 3D buttons, interactive Competency Matrix & AI Job Description extraction", deps: ["lucide-react", "../utils/mockData", "../utils/aiSimulator", "./SkillGapAnalysis.css"], state: "active", last: "anti@2026-08-21" }
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
  FileText,
  Sparkles,
  Trophy
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
  const [extractedUserSkills, setExtractedUserSkills] = useState([]);
  const [extractedJobSkills, setExtractedJobSkills] = useState([]);
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
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Header & View Switcher */}
      <div className="cartoon-card p-6 md:p-8 border-2 border-purple-500/30 relative overflow-hidden bg-gradient-to-r from-[#171d33] via-[#1c243f] to-[#1a2138]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="cartoon-badge cartoon-badge-pink mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Target Matrix & Job Analyzer
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-yellow-400" />
              <span>Job Competency Matrix</span>
            </h2>
            <p className="text-xs text-gray-300 font-medium mt-1">
              Compare target role requirements, evaluate job descriptions & benchmark missing skills
            </p>
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center p-1.5 bg-[#0d1220] border-2 border-purple-500/30 rounded-2xl">
            <button
              onClick={() => setViewMode('matrix')}
              className={`cartoon-btn py-1.5 px-3.5 text-xs font-black gap-1.5 ${
                viewMode === 'matrix' ? 'cartoon-btn-purple' : 'cartoon-btn-dark'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Interactive Matrix
            </button>
            <button
              onClick={() => setViewMode('analyzer')}
              className={`cartoon-btn py-1.5 px-3.5 text-xs font-black gap-1.5 ${
                viewMode === 'analyzer' ? 'cartoon-btn-pink' : 'cartoon-btn-dark'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> AI Job Analyzer
            </button>
          </div>
        </div>
      </div>

      {/* UPLOAD-FIRST CHECK */}
      {!hasUploadedResume ? (
        <div className="cartoon-card p-10 border-2 border-purple-500/30 text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border-2 border-purple-400 flex items-center justify-center text-purple-300 mx-auto shadow-lg shadow-purple-500/20">
            <FileText className="w-8 h-8 text-pink-400" />
          </div>
          <h3 className="text-xl font-black text-white">Upload Resume to View Role Match & Competency Gap</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto font-medium">
            Please upload your resume to calculate your match score and unlock verified learning roadmaps.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate && onNavigate('resume')}
              className="cartoon-btn cartoon-btn-purple py-3 px-6 text-xs font-black gap-2"
            >
              <Zap className="w-4 h-4 fill-current" /> Go to Resume Analyzer ›
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ================================================================ */}
          {/* VIEW MODE 1: INTERACTIVE SKILL MATRIX */}
          {/* ================================================================ */}
          {viewMode === 'matrix' && (
            <div className="cartoon-card p-6 md:p-8 border-2 border-purple-500/30 space-y-8">
              {/* TOP SECTION */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-[#0d1220] border-2 border-purple-500/30">
                <div className="flex items-center gap-5 text-center sm:text-left">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 border-2 border-white/30 flex flex-col items-center justify-center shadow-xl text-white font-black">
                    <span className="text-3xl leading-none">{matchPercentage}%</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider mt-1">MATCH</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="cartoon-badge cartoon-badge-purple text-[10px]">TARGET ROLE</span>
                      <select
                        value={targetRoleKey}
                        onChange={handleRoleChange}
                        className="bg-[#151b2e] border-2 border-purple-500/30 text-white text-xs font-black rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                      >
                        {Object.entries(ROLE_PRESETS).map(([key, role]) => (
                          <option key={key} value={key} className="bg-[#121727] text-white font-bold">
                            {role.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <h3 className="text-sm font-black text-gray-200">
                      Matched <span className="text-emerald-400 font-black">{matchedSkills.length}</span> competencies expected for this role
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => triggerGenerateRoadmap()}
                  className="cartoon-btn cartoon-btn-purple py-3 px-6 text-xs font-black gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Generate Roadmap</span>
                </button>
              </div>

              {/* ROLE REQUIREMENTS */}
              <section className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" /> Role Requirements Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(roleSkills).map(([category, skills]) => (
                    <div key={category} className="cartoon-card p-5 border-2 border-purple-500/20 space-y-3 bg-[#0d1220]/80">
                      <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                        {CATEGORY_LABELS[category] || category.toUpperCase()}
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {(skills || []).map((skill) => {
                          const isMatched = matchedSkills.some(m => m.toLowerCase().trim() === skill.toLowerCase().trim());
                          return (
                            <span
                              key={skill}
                              className={`cartoon-badge text-xs ${
                                isMatched 
                                  ? 'cartoon-badge-mint' 
                                  : 'cartoon-badge-purple'
                              }`}
                            >
                              <span>{skill}</span>
                              <button
                                onClick={() => removeRoleSkill(category, skill)}
                                className="ml-1 text-gray-400 hover:text-white font-bold"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}

                        <button
                          onClick={() => openRoleSkillDialog(category)}
                          className="cartoon-badge bg-white/5 border-dashed border-white/20 text-gray-300 hover:text-white text-xs cursor-pointer"
                        >
                          + Add Skill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SKILL COMPARISON */}
              <section className="space-y-4 pt-4 border-t-2 border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Your Profile Skills ({userSkills.length})
                  </h3>

                  {profile && profile.skills && (
                    <button 
                      onClick={handleLoadProfileSkills}
                      className="cartoon-btn cartoon-btn-dark py-1.5 px-3 text-xs font-bold gap-1"
                    >
                      <Zap className="w-3 h-3 text-yellow-400" /> Sync Profile
                    </button>
                  )}
                </div>

                <div className="cartoon-card p-5 border-2 border-purple-500/20 bg-[#0d1220]/80">
                  <div className="flex flex-wrap gap-2">
                    {userSkills.map((skill) => (
                      <span key={skill} className="cartoon-badge cartoon-badge-cyan text-xs">
                        <span>{skill}</span>
                        <button
                          onClick={() => removeUserSkill(skill)}
                          className="ml-1 text-gray-400 hover:text-white font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    <button
                      onClick={openUserSkillDialog}
                      className="cartoon-badge bg-white/5 border-dashed border-white/20 text-gray-300 hover:text-white text-xs cursor-pointer"
                    >
                      + Add My Skill
                    </button>
                  </div>
                </div>
              </section>

              {/* MISSING SKILLS & VERIFICATION */}
              <section className="space-y-4 pt-4 border-t-2 border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-yellow-300 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    Identified Missing Skills Gap ({allRoleSkills.filter(s => !userSkills.some(u => u.toLowerCase().trim() === s.toLowerCase().trim())).length})
                  </h3>

                  <button
                    onClick={() => triggerGenerateRoadmap()}
                    className="cartoon-btn cartoon-btn-purple py-1.5 px-4 text-xs font-black"
                  >
                    View Roadmap ›
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allRoleSkills.filter(s => !userSkills.some(u => u.toLowerCase().trim() === s.toLowerCase().trim())).map((missingSkill) => (
                    <div 
                      key={missingSkill}
                      className="cartoon-card p-4 border-2 border-yellow-500/30 flex items-center justify-between gap-2 bg-[#0d1220]"
                    >
                      <div>
                        <span className="font-black text-white text-xs block truncate">{missingSkill}</span>
                        <span className="text-[10px] text-yellow-300 font-bold block">Missing competency</span>
                      </div>
                      <button
                        onClick={() => onOpenVerification && onOpenVerification(missingSkill)}
                        className="cartoon-btn cartoon-btn-yellow py-1 px-3 text-xs font-black gap-1"
                      >
                        <Zap className="w-3 h-3 fill-current" /> Verify
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* ADD SKILL MODAL */}
              {activeCategory && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={closeDialog}>
                  <div className="cartoon-card max-w-md w-full p-6 border-2 border-purple-500 space-y-4 bg-[#151b2e]" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white">Add New Skill</h3>
                      <button onClick={closeDialog} className="text-gray-400 hover:text-white font-bold">✕</button>
                    </div>

                    <input
                      type="text"
                      placeholder="Enter skill name..."
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
                  <span>{analyzing ? "Extracting Skills..." : "Compare Skills"}</span>
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
        </>
      )}
    </div>
  );
}
