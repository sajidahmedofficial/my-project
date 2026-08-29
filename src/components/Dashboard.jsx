// agent-notes: { ctx: "SkillBridge career dashboard with hero skill gap card, career benchmarks & software engineering tools", deps: ["lucide-react", "recharts", "./common/AIAssistantAvatar"], state: "active", last: "anti@2026-08-29" }

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
  Cloud
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

export default function Dashboard({ profile, setProfile, onNavigate, onOpenVerification }) {
  const hasUploadedResume = Boolean(profile?.hasUploadedResume);
  const [avatarState, setAvatarState] = useState('idle');
  const [selectedRole, setSelectedRole] = useState(
    typeof profile?.careerGoal === 'string' ? profile.careerGoal : 'Full Stack Developer'
  );

  // Software roles catalog
  const roleSkillPresets = {
    'Full Stack Developer': {
      verified: ['JavaScript - Expert Level', 'React.js - Expert Level', 'Node.js - Intermediate'],
      gaps: ['TypeScript & GraphQL - Learn This', 'AWS & Docker Cloud - Learn This', 'System Architecture - Learn This']
    },
    'AI & Data Engineer': {
      verified: ['Python - Expert Level', 'Data Analysis - Intermediate', 'SQL Databases - Advanced'],
      gaps: ['Machine Learning & PyTorch - Learn This', 'AWS Cloud & MLOps - Learn This', 'LLM Prompt Architecture - Learn This']
    },
    'Frontend Engineer': {
      verified: ['React.js - Expert Level', 'Tailwind CSS - Advanced', 'JavaScript (ES6+) - Expert'],
      gaps: ['Next.js App Router - Learn This', 'Web Performance & Vitals - Learn This', 'End-to-End Testing (Cypress) - Learn This']
    },
    'Backend Engineer': {
      verified: ['Node.js & Express - Advanced', 'PostgreSQL / MongoDB - Advanced', 'RESTful API Design - Expert'],
      gaps: ['Microservices & Redis - Learn This', 'Kubernetes & CI/CD - Learn This', 'Distributed Systems - Learn This']
    }
  };

  const currentRoleData = roleSkillPresets[selectedRole] || roleSkillPresets['Full Stack Developer'];

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
      id: 'coding',
      title: 'Coding Practice Lab',
      desc: 'Interactive software engineering challenges with real-time test execution.',
      icon: Code2,
      tag: 'Code Runner',
      accent: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'interview',
      title: 'AI Mock Interview',
      desc: 'Simulate live technical & behavioral rounds with speech evaluation.',
      icon: Award,
      tag: 'Live Prep',
      accent: 'bg-purple-50 text-purple-700 border-purple-200'
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
    { id: 2, text: 'Solve 2 Medium Coding challenges in Coding Lab', done: false },
    { id: 3, text: 'Complete Full Stack System Design roadmap stage', done: false },
    { id: 4, text: 'Rehearse 1 Mock Technical Interview round', done: false }
  ]);

  const toggleGoal = (id) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 pb-12">
      
      {/* ========================================================================= */}
      {/* 1. EXACT HERO SECTION MATCHING SCREENSHOT */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e8f7f2] via-[#edfbf6] to-[#f9fefc] border border-[#d1f2e6] p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d5f5e9] border border-[#aeead4] text-[#0f766e] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#0f766e]" />
              <span>AI-Powered Career Growth</span>
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
                onClick={() => onNavigate('resume')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0d594f] hover:bg-[#09473f] text-white text-sm font-semibold shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <span>Start Your Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('skillgap')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium transition-all"
              >
                <Layers className="w-4 h-4 text-[#0d594f]" />
                <span>Explore Role Matrix</span>
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
              {currentRoleData.verified.map((skill, idx) => (
                <div 
                  key={`ver-${idx}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#eefaf4] border border-[#c3eed7] text-[#0f766e] text-xs sm:text-sm font-medium transition-all hover:bg-[#e6f7ee]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#d3f4e2] text-[#0f766e] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{skill}</span>
                </div>
              ))}

              {/* Skill Gaps (Orange / Amber Pills) */}
              {currentRoleData.gaps.map((gap, idx) => (
                <div 
                  key={`gap-${idx}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#fef8ed] border border-[#fbdca7] text-[#b45309] text-xs sm:text-sm font-medium transition-all hover:bg-[#fdf3df]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#faecd2] text-[#b45309] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{gap}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SOFTWARE ENGINEERING CORE METRICS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Resume ATS Score</span>
            <FileText className="w-4 h-4 text-[#0d594f]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">88 / 100</div>
          <p className="text-[11px] text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Passed 14 ATS formatting checks</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Role Alignment Match</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">82%</div>
          <p className="text-[11px] text-indigo-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+15% match gain this month</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Coding Lab Score</span>
            <Code2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">12 Challenges</div>
          <p className="text-[11px] text-purple-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Algorithms & Data Structures</span>
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
