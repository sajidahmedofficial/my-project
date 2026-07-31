// agent-notes: { ctx: "Dynamic Student Dashboard with Placement Readiness Gauge, Certificates & Widgets", deps: ["recharts", "lucide-react"], state: "active", last: "anti@2026-07-30" }
import React, { useState } from 'react';
import { 
  Award, 
  CheckSquare, 
  TrendingUp, 
  Layers, 
  Flame, 
  ArrowRight,
  Sparkles,
  Clock,
  BookOpen,
  GraduationCap,
  Briefcase,
  Code2,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function Dashboard({ profile, setProfile, onNavigate }) {
  // Local goals checklist
  const initialGoals = [
    { id: 1, text: "Revise HTML structures & CSS Grid layout rules", done: true },
    { id: 2, text: "Complete React components, props, and rendering lists", done: false },
    { id: 3, text: "Learn REST API basics: status codes and HTTP verbs", done: false },
    { id: 4, text: "Conduct a 5-question Frontend Mock Interview", done: false },
    { id: 5, text: "Upload resume to AI Analyzer for suggestions", done: false }
  ];

  const [goals, setGoals] = useState(initialGoals);

  const toggleGoal = (id) => {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    
    const doneCount = updated.filter(g => g.done).length;
    const progressPercent = Math.round((doneCount / updated.length) * 100);
    
    if (setProfile) {
      setProfile(prev => ({
        ...prev,
        scores: {
          ...prev.scores,
          weeklyGoalsProgress: progressPercent,
          placementReadiness: Math.min(100, Math.round((prev?.scores?.placementReadiness || 70) + (progressPercent - (prev?.scores?.weeklyGoalsProgress || 0)) * 0.15))
        }
      }));
    }
  };

  const scores = profile?.scores || {
    skillScore: 78,
    resumeScore: 84,
    interviewReadiness: 72,
    placementReadiness: 81,
    weeklyGoalsProgress: 40
  };

  const skillsList = profile?.skills || ['React', 'Node.js', 'JavaScript', 'Tailwind CSS', 'Git'];

  // Mock progress chart data
  const progressData = [
    { name: 'Week 1', score: 45, readiness: 35 },
    { name: 'Week 2', score: 52, readiness: 45 },
    { name: 'Week 3', score: 60, readiness: 58 },
    { name: 'Week 4', score: 70, readiness: 68 },
    { name: 'Week 5', score: scores.skillScore, readiness: scores.placementReadiness }
  ];

  // Competency categories data
  const skillBarData = [
    { category: 'Frontend', count: 85 },
    { category: 'Backend', count: 72 },
    { category: 'Database', count: 65 },
    { category: 'Cloud/DevOps', count: 58 }
  ];

  const mockCertificates = [
    { id: 1, title: 'Google Cloud Certified Professional', provider: 'Google', date: '2026' },
    { id: 2, title: 'AWS Certified Cloud Practitioner', provider: 'AWS Skill Builder', date: '2026' },
    { id: 3, title: 'Microsoft Learn Azure Fundamentals', provider: 'Microsoft', date: '2025' }
  ];

  const recommendedCourses = [
    { title: 'Full Stack Open 2026', provider: 'freeCodeCamp', url: 'https://freecodecamp.org', difficulty: 'Intermediate' },
    { title: 'Docker & Kubernetes Microservices', provider: 'Coursera', url: 'https://coursera.org', difficulty: 'Advanced' },
    { title: 'LeetCode Top 75 Interview Questions', provider: 'LeetCode', url: 'https://leetcode.com', difficulty: 'All Levels' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative glass rounded-3xl p-6 md:p-8 overflow-hidden border border-card-border">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-accent-purple" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-purple/20 text-accent-pink border border-accent-pink/30 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" /> 5-Day Study Streak Active
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Welcome back, <span className="gradient-text">{profile?.name?.split(' - ')[0] || 'Student'}</span>
            </h1>
            <p className="text-gray-400 text-xs max-w-xl">
              Target Role: <strong className="text-white">{profile?.careerGoal || 'Full Stack AI Engineer'}</strong> • {profile?.college || 'Stanford University'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('job')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> AI Skill Gap Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Skill Score */}
        <div className="glass rounded-2xl p-4 space-y-1 hover:border-accent-purple/40 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Skill Score</span>
          <div className="text-2xl font-black text-white">{scores.skillScore}%</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-bold">
            <TrendingUp className="w-3 h-3" /> +5% this week
          </span>
        </div>

        {/* Placement Readiness */}
        <div className="glass rounded-2xl p-4 space-y-1 hover:border-accent-pink/40 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Placement Readiness</span>
          <div className="text-2xl font-black text-white">{scores.placementReadiness}%</div>
          <span className="text-[10px] text-accent-pink font-bold">Ready for Campus Drives</span>
        </div>

        {/* Resume Score */}
        <div className="glass rounded-2xl p-4 space-y-1 hover:border-indigo-500/40 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Resume Score</span>
          <div className="text-2xl font-black text-white">{scores.resumeScore}/100</div>
          <span className="text-[10px] text-gray-400 font-bold">AI Extracted</span>
        </div>

        {/* Interview Readiness */}
        <div className="glass rounded-2xl p-4 space-y-1 hover:border-blue-500/40 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Interview Readiness</span>
          <div className="text-2xl font-black text-white">{scores.interviewReadiness}%</div>
          <span className="text-[10px] text-blue-400 font-bold">Mock Practice Ready</span>
        </div>

        {/* Study Streak */}
        <div className="glass rounded-2xl p-4 space-y-1 hover:border-amber-500/40 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Study Streak</span>
          <div className="text-2xl font-black text-amber-400 flex items-center gap-1">
            5 Days <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="text-[10px] text-gray-400 font-bold">Personal Best</span>
        </div>

        {/* Learning Hours */}
        <div className="glass rounded-2xl p-4 space-y-1 hover:border-cyan-500/40 transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Learning Hours</span>
          <div className="text-2xl font-black text-white">18.5 hrs</div>
          <span className="text-[10px] text-cyan-400 font-bold">Logged this month</span>
        </div>
      </div>

      {/* Grid: Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recharts graph (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-5 border border-card-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white">Skill Score & Placement Growth Trend</h3>
                <p className="text-[11px] text-gray-400">Weekly progress evaluation</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-accent-purple font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-purple" /> Skill Score
                </span>
                <span className="flex items-center gap-1.5 text-accent-blue font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-blue" /> Placement Readiness
                </span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                  <Area type="monotone" dataKey="readiness" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReadiness)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Courses & Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Courses */}
            <div className="glass rounded-2xl p-5 border border-card-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-purple" /> AI Recommended Courses
                </h3>
              </div>
              <div className="space-y-3">
                {recommendedCourses.map((c, i) => (
                  <a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-accent-purple/50 flex items-center justify-between transition-all group"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-accent-purple transition-colors">{c.title}</span>
                      <span className="text-[10px] text-gray-400">{c.provider} • {c.difficulty}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-accent-purple shrink-0" />
                  </a>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="glass rounded-2xl p-5 border border-card-border flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Recent Certificates
                </h3>
                <div className="space-y-2.5">
                  {mockCertificates.map(cert => (
                    <div key={cert.id} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{cert.title}</span>
                        <span className="text-[10px] text-emerald-400">{cert.provider} • Verified {cert.date}</span>
                      </div>
                      <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => onNavigate('roadmap')}
                className="mt-4 w-full py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white flex items-center justify-center gap-1.5"
              >
                View Full Learning Roadmap <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Milestones & Tech Stack (1/3 width) */}
        <div className="space-y-6">
          {/* Weekly Goals Widget */}
          <div className="glass rounded-2xl p-5 border border-card-border">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-accent-purple" /> Weekly Goals & Progress
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">Complete goals to boost placement readiness score</p>
            <div className="space-y-2.5">
              {goals.map(goal => (
                <label key={goal.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={goal.done} 
                    onChange={() => toggleGoal(goal.id)}
                    className="mt-0.5 w-4 h-4 rounded bg-gray-900 border-gray-700 text-accent-purple focus:ring-0"
                  />
                  <span className={`leading-relaxed text-gray-300 text-[11px] ${goal.done ? 'line-through text-gray-500' : ''}`}>
                    {goal.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Technical Competencies Tag Cloud */}
          <div className="glass rounded-2xl p-5 border border-card-border space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-accent-pink" /> Technical Skills ({skillsList.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-accent-purple/15 text-accent-purple border border-accent-purple/30">
                  {skill}
                </span>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-800">
              <button 
                onClick={() => onNavigate('interview')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                <Award className="w-4 h-4" /> Take AI Placement Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
