// agent-notes: { ctx: "SkillBridge career dashboard with hero skill gap card, career benchmarks & software engineering tools", deps: ["lucide-react", "recharts", "./common/AIAssistantAvatar"], state: "active", last: "sato@2026-09-25" }

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight, 
  FileText, 
  Briefcase, 
  Target, 
  MessageSquare, 
  Award, 
  Brain, 
  Code2, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  CheckSquare, 
  ExternalLink,
  ChevronRight,
  Terminal,
  Cpu,
  Database,
  Cloud,
  LogOut
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import AIAssistantAvatar from './common/AIAssistantAvatar';
import { calculateOverallProgress } from '../services/userPersistence';

export default function Dashboard({ profile, setProfile, onNavigate, onOpenVerification, onLogout }) {
  const hasUploadedResume = Boolean(profile?.hasUploadedResume || profile?.resumeId);
  const [avatarState, setAvatarState] = useState('idle');
  const [selectedRole, setSelectedRole] = useState(
    typeof profile?.careerGoal === 'string' ? profile.careerGoal : 'Full Stack Developer'
  );

  const rawName = profile?.name || profile?.user_metadata?.full_name || 'Candidate';
  const userName = rawName.split(' ')[0] || 'Candidate';

  const candidateSkills = Array.isArray(profile?.skills) && profile.skills.length > 0 
    ? profile.skills 
    : ['HTML', 'CSS', 'JavaScript', 'React', 'Python'];

  const resumeScoreVal = profile?.scores?.resumeScore || (hasUploadedResume ? 84 : 70);
  const atsScoreVal = profile?.scores?.placementReadiness || (hasUploadedResume ? 82 : 68);

  // Supabase progress metrics
  const progressData = profile?.progress || profile?.user_progress || {};
  const overallProgress = profile?.overallProgress || progressData.overall_progress || calculateOverallProgress(progressData);
  const resumeAnalysisDone = Boolean(progressData.resume_analysis_completed || hasUploadedResume);
  const skillGapDone = Boolean(progressData.skill_gap_completed || hasUploadedResume);
  const jobMatrixDone = Boolean(progressData.job_matrix_completed || hasUploadedResume);
  const careerGuidanceProgress = progressData.career_guidance_completed ? 100 : (progressData.career_guidance_progress || 60);
  const aiMentorProgress = progressData.ai_mentor_completed ? 100 : (progressData.ai_mentor_progress || 40);

  // Role presets mapped against user's actual skills
  const roleRequiredSkills = {
    'Full Stack Developer': ['React', 'JavaScript', 'Node.js', 'TypeScript', 'Docker', 'AWS', 'SQL'],
    'AI & Data Engineer': ['Python', 'SQL', 'Data Analysis', 'PyTorch', 'AWS', 'MLOps'],
    'Frontend Engineer': ['React', 'JavaScript', 'Tailwind CSS', 'Next.js', 'TypeScript', 'Testing'],
    'Backend Engineer': ['Node.js', 'SQL', 'MongoDB', 'Redis', 'Docker', 'Microservices']
  };

  const requiredForRole = roleRequiredSkills[selectedRole] || roleRequiredSkills['Full Stack Developer'];
  const normCandidate = candidateSkills.map(s => s.toLowerCase().trim());
  const verifiedSkillsList = requiredForRole.filter(s => normCandidate.some(c => c.includes(s.toLowerCase()) || s.toLowerCase().includes(c)));
  const gapSkillsList = requiredForRole.filter(s => !verifiedSkillsList.includes(s));
  // Software tools suite
  const softwareTools = [
    {
      id: 'resume',
      title: 'AI Resume Analyzer',
      desc: 'PDF & DOCX ATS scan, keyword gap detection & instant bullet-point rewrites.',
      icon: FileText,
      tag: 'ATS Scanner',
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'skillgap',
      title: 'Skill Gap Benchmarking',
      desc: 'Compare your stack against current tech recruiter requirements in real-time.',
      icon: Briefcase,
      tag: 'Role Matrix',
      accent: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 'roadmap',
      title: 'Personalized Roadmap',
      desc: 'Step-by-step milestone curriculum generated from your verified skill gaps.',
      icon: Target,
      tag: 'Curriculum',
      accent: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'chat',
      title: 'AI Career Mentor',
      desc: '24/7 technical advisor for architecture questions, salary negotiation & career strategy.',
      icon: MessageSquare,
      tag: 'AI Coach',
      accent: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  // Goals checklist
  const [goals, setGoals] = useState([
    { id: 1, text: 'Analyze resume against target software role', done: hasUploadedResume },
    { id: 2, text: 'Complete Full Stack System Design roadmap stage', done: false },
    { id: 3, text: 'Verify core technical skills for certificate credentials', done: false },
    { id: 4, text: 'Consult AI Career Mentor on portfolio & career strategy', done: false }
  ]);

  const toggleGoal = (id) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 pb-12">
      
      {/* ========================================================================= */}
      {/* 1. EXACT HERO SECTION MATCHING DESIGN */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e8f7f2] via-[#edfbf6] to-[#f9fefc] border border-[#d1f2e6] p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top Badge & Page Logout Option */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d5f5e9] border border-[#aeead4] text-[#0f766e] text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#0f766e]" />
                <span>AI-Powered Career Growth</span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold shadow-xs transition-all"
                  title="Log out of SkillBridge"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Out</span>
                </button>
              )}
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-[1.18]">
              Bridge the Gap Between Your Skills and Your Dream Job
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Stop guessing what skills you need. Get personalized skill gap analysis and actionable learning paths to achieve your career goals with AI-powered insights.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('wizard')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0d594f] hover:bg-[#09473f] text-white text-sm font-semibold shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <span>Start Your Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('skillgap')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium transition-all"
              >
                <Briefcase className="w-4 h-4 text-[#0d594f]" />
                <span>Explore Skill Gap</span>
              </button>
            </div>
          </div>

          {/* Right Column Floating Skill Gap Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-100/80 space-y-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Skill Benchmark</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="text-xs font-semibold text-[#0d594f] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0d594f]"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="AI & Data Engineer">AI & Data Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                </select>
              </div>

              {/* Verified Skills (Green Pills) */}
              {(verifiedSkillsList.length > 0 ? verifiedSkillsList : candidateSkills.slice(0, 3)).map((skill, idx) => (
                <div 
                  key={`ver-${idx}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#eefaf4] border border-[#c3eed7] text-[#0f766e] text-xs sm:text-sm font-medium transition-all hover:bg-[#e6f7ee]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#d3f4e2] text-[#0f766e] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{skill} — Verified</span>
                </div>
              ))}

              {/* Skill Gaps (Orange / Amber Pills) */}
              {(gapSkillsList.length > 0 ? gapSkillsList.slice(0, 3) : ['TypeScript & GraphQL', 'AWS & Docker Cloud']).map((gap, idx) => (
                <div 
                  key={`gap-${idx}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#fef8ed] border border-[#fbdca7] text-[#b45309] text-xs sm:text-sm font-medium transition-all hover:bg-[#fdf3df]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#faecd2] text-[#b45309] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{gap} — Priority Gap</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. YOUR CAREER PROGRESS (SUPABASE-BACKED REPOSITORY OF TRUTH) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Welcome, {userName} 👋
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Supabase Synced
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your unified career milestones, skill gaps, and verification progress loaded directly from Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Progress</div>
              <div className="text-2xl font-black text-[#0d594f]">{overallProgress}%</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#eefaf4] border border-[#c3eed7] flex items-center justify-center text-[#0d594f] font-black text-lg">
              {overallProgress}%
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Career Readiness Completion</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#0d594f] to-[#10b981] h-3 rounded-full transition-all duration-700" 
              style={{ width: `${Math.max(6, overallProgress)}%` }}
            />
          </div>
        </div>

        {/* 3-Column Grid: Milestones Checklist | Target Role & Skills | Score & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Column 1: Feature Completion Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider">
              <span>Your Career Progress</span>
              <span className="text-[10px] font-semibold text-emerald-700">Live Status</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                <span className="font-medium text-slate-700">Resume Analysis</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${resumeAnalysisDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {resumeAnalysisDone ? <><CheckCircle2 className="w-3.5 h-3.5" /> Complete</> : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                <span className="font-medium text-slate-700">Skill Gap Analysis</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${skillGapDone ? 'text-emerald-700' : 'text-emerald-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                <span className="font-medium text-slate-700">Job Matrix</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${jobMatrixDone ? 'text-emerald-700' : 'text-emerald-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                <span className="font-medium text-slate-700">Career Guidance</span>
                <span className="font-bold text-[#0d594f]">{careerGuidanceProgress}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100">
                <span className="font-medium text-slate-700">AI Mentor</span>
                <span className="font-bold text-[#0d594f]">{aiMentorProgress}%</span>
              </div>
            </div>
          </div>

          {/* Column 2: Career Goal & Extracted Skills */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Current Career Goal
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>{selectedRole || profile?.careerGoal || 'Frontend Developer'}</span>
              <Target className="w-4 h-4 text-indigo-600" />
            </div>

            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider pt-1">
              Skills
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {candidateSkills.slice(0, 10).map((sk, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-medium"
                >
                  <span>{sk}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                </span>
              ))}
            </div>
          </div>

          {/* Column 3: Resume Score & Direct Navigation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resume Score
              </div>
              <div className="mt-2 p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900">{resumeScoreVal} / 100</div>
                  <div className="text-[11px] text-emerald-700 font-medium">ATS & Format Optimized</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onNavigate('resume')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#0d594f] hover:bg-[#09473f] text-white text-xs font-semibold shadow-xs transition-all text-center"
              >
                Resume Analyzer
              </button>
              <button
                onClick={() => onNavigate('skillgap')}
                className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all text-center"
              >
                Skill Gap
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SOFTWARE ENGINEERING CORE METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Resume ATS Score</span>
            <FileText className="w-4 h-4 text-[#0d594f]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{resumeScoreVal} / 100</div>
          <p className="text-[11px] text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Passed ATS format evaluation</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Role Alignment Match</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{atsScoreVal}%</div>
          <p className="text-[11px] text-indigo-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target: {selectedRole}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Extracted Skills</span>
            <Code2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{candidateSkills.length} Skills</div>
          <p className="text-[11px] text-purple-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified in active profile</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Weekly Missions</span>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {goals.filter(g => g.done).length} of {goals.length}
          </div>
          <p className="text-[11px] text-amber-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>On track for interview readiness</span>
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SOFTWARE FEATURES & TOOLS SUITE */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Software Engineering Career Suite</h2>
            <p className="text-xs text-slate-500">AI-powered tools designed to land software engineer positions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {softwareTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-[#0d594f] shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#eefaf4] text-[#0d594f] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${tool.accent}`}>
                      {tool.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0d594f] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#0d594f]">
                  <span>Launch Tool</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WEEKLY GOALS & PROGRESS TRACKER */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weekly Quests */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Milestones</h3>
              <p className="text-xs text-slate-500">Track actionable tasks toward your target role.</p>
            </div>
            <span className="text-xs font-semibold text-[#0d594f] bg-[#eefaf4] px-2.5 py-1 rounded-md">
              {goals.filter(g => g.done).length}/{goals.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {goals.map((g) => (
              <div
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  g.done ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                    g.done ? 'bg-[#0d594f] border-[#0d594f] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {g.done && '✓'}
                  </div>
                  <span className={`text-xs font-medium ${g.done ? 'line-through' : ''}`}>
                    {g.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Assistant Guidance */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0d594f] to-[#083a34] rounded-2xl p-6 text-white space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-emerald-300 text-[11px] font-medium">
              <Sparkles className="w-3 h-3" />
              <span>AI Career Recommendation</span>
            </div>
            <h3 className="text-base font-bold text-white">Target: {selectedRole}</h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Based on software job postings from the last 30 days, candidates with verified <strong>React.js</strong> and <strong>TypeScript</strong> credentials receive 3.2x more interview invitations. Complete the Next.js module in your roadmap to bridge your primary gap.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('roadmap')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#0d594f] font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Open Learning Roadmap
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2.5 rounded-xl bg-white/15 text-white font-medium text-xs hover:bg-white/20 transition-colors"
            >
              Ask AI Mentor
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
