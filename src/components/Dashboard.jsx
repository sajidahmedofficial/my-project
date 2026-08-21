// agent-notes: { ctx: "Playful interactive cartoon student dashboard with Sparky AI avatar, 3D metric cards, quick actions & gamified goals", deps: ["recharts", "lucide-react", "./common/AIAssistantAvatar"], state: "active", last: "anti@2026-08-21" }
import React, { useState } from 'react';
import { 
  Award, 
  CheckSquare, 
  TrendingUp, 
  Flame, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Briefcase,
  Brain,
  MessageSquare,
  Trophy,
  Star,
  CheckCircle2
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

  // Local goals checklist
  const initialGoals = [
    { id: 1, text: "Revise HTML structures & CSS Grid layout rules", done: true },
    { id: 2, text: "Complete React components, props, and rendering lists", done: false },
    { id: 3, text: "Learn REST API basics: status codes and HTTP verbs", done: false },
    { id: 4, text: "Conduct a 5-question Frontend Mock Interview", done: false },
    { id: 5, text: "Upload resume to AI Analyzer for suggestions", done: hasUploadedResume }
  ];

  const [goals, setGoals] = useState(initialGoals);

  // Sync goal 5 status if resume upload changes
  React.useEffect(() => {
    setGoals(prev => prev.map(g => g.id === 5 ? { ...g, done: hasUploadedResume } : g));
  }, [hasUploadedResume]);

  const toggleGoal = (id) => {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    
    const doneCount = updated.filter(g => g.done).length;
    const progressPercent = Math.round((doneCount / updated.length) * 100);
    
    // Trigger happy reaction from Sparky
    setAvatarState('success');
    setTimeout(() => setAvatarState('idle'), 2500);

    if (setProfile) {
      setProfile(prev => ({
        ...prev,
        scores: {
          ...prev?.scores,
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

  const skillsList = profile?.skills || ['React.js', 'Node.js', 'JavaScript', 'Tailwind CSS', 'Git'];

  // Progress chart data
  const progressData = [
    { name: 'Week 1', score: 45, readiness: 35 },
    { name: 'Week 2', score: 55, readiness: 48 },
    { name: 'Week 3', score: 68, readiness: 62 },
    { name: 'Week 4', score: 75, readiness: 72 },
    { name: 'Week 5', score: hasUploadedResume ? scores.skillScore : 82, readiness: hasUploadedResume ? scores.placementReadiness : 80 }
  ];

  const quickActions = [
    {
      id: 'resume',
      title: 'Resume Analyzer',
      desc: 'ATS scan & score boost',
      icon: FileText,
      color: 'from-pink-500 to-rose-500',
      border: 'border-pink-500/40',
      badge: 'Smart Scan'
    },
    {
      id: 'skillgap',
      title: 'Skill Gap Hub',
      desc: 'Benchmark & verify',
      icon: Briefcase,
      color: 'from-cyan-500 to-blue-600',
      border: 'border-cyan-500/40',
      badge: 'AI Evaluator'
    },
    {
      id: 'aptitude',
      title: 'Aptitude Practice',
      desc: 'Daily quantitative quests',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      border: 'border-purple-500/40',
      badge: 'Level Up'
    },
    {
      id: 'chat',
      title: 'AI Career Mentor',
      desc: 'Voice & text guidance',
      icon: MessageSquare,
      color: 'from-fuchsia-500 to-purple-600',
      border: 'border-fuchsia-500/40',
      badge: 'Voice Active'
    },
    {
      id: 'roadmap',
      title: 'Learning Roadmap',
      desc: 'Step-by-step milestones',
      icon: Target,
      color: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-500/40',
      badge: '3 Stages'
    },
    {
      id: 'interview',
      title: 'Mock Interview',
      desc: 'Simulate live hiring rounds',
      icon: Award,
      color: 'from-amber-500 to-orange-600',
      border: 'border-amber-500/40',
      badge: 'Placement Prep'
    }
  ];

  const mockCertificates = [
    { id: 1, title: 'Google Cloud Certified Professional', provider: 'Google', date: '2026', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40' },
    { id: 2, title: 'AWS Certified Cloud Practitioner', provider: 'AWS Skill Builder', date: '2026', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40' },
    { id: 3, title: 'Meta React Front-End Developer', provider: 'Meta & Coursera', date: '2025', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' }
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* 1. Welcome Hero with Sparky Avatar */}
      <div className="cartoon-card p-6 md:p-8 relative overflow-hidden bg-gradient-to-r from-[#171d33] via-[#1c243f] to-[#1a2138] border-2 border-purple-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <AIAssistantAvatar 
              size="lg" 
              state={avatarState} 
              onClick={() => {
                setAvatarState('speaking');
                setTimeout(() => setAvatarState('idle'), 3000);
              }}
              showSpeechBubble={true}
              speechText={`Ready for today's placement missions, ${profile?.name?.split(' - ')[0] || 'Friend'}?`}
            />

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                <span>5-Day Study Streak Active 🔥</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">{profile?.name?.split(' - ')[0] || 'Student'}</span>!
              </h1>
              <p className="text-gray-300 text-xs font-medium">
                Aiming for <strong className="text-white font-black">{profile?.careerGoal || 'Full Stack Developer'}</strong> • {profile?.college || 'Stanford University'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('job')}
              className="cartoon-btn cartoon-btn-purple py-3 px-6 text-xs font-black gap-2"
            >
              <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <span>Explore Job Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Key Metric Cartoon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Resume Score */}
        <div className="cartoon-card p-5 border-2 border-pink-500/30 hover:border-pink-400/60 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black text-pink-400 uppercase tracking-wider block">Resume Score</span>
            <div className="text-3xl font-black text-white">
              {hasUploadedResume ? `${scores.resumeScore}/100` : '85/100'}
            </div>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI ATS Optimized
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 border-2 border-pink-300/40">
            <FileText className="w-7 h-7" />
          </div>
        </div>

        {/* Skill Match */}
        <div className="cartoon-card p-5 border-2 border-cyan-500/30 hover:border-cyan-400/60 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider block">Skill Match</span>
            <div className="text-3xl font-black text-white">
              {scores.skillScore || 78}%
            </div>
            <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% this week
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 border-2 border-cyan-300/40">
            <Briefcase className="w-7 h-7" />
          </div>
        </div>

        {/* Verified Skills */}
        <div className="cartoon-card p-5 border-2 border-emerald-500/30 hover:border-emerald-400/60 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Verified Skills</span>
            <div className="text-3xl font-black text-white">
              {skillsList.length} Badges
            </div>
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Certified via Test
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 border-2 border-emerald-300/40">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Weekly Quests */}
        <div className="cartoon-card p-5 border-2 border-purple-500/30 hover:border-purple-400/60 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">Weekly Quests</span>
            <div className="text-3xl font-black text-white">
              {goals.filter(g => g.done).length}/{goals.length} Done
            </div>
            <span className="text-[11px] font-bold text-yellow-300 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> +250 XP earned
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 border-2 border-purple-300/40">
            <CheckSquare className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 3. Interactive Quick Actions Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>Interactive Tool Hub</span>
          </h2>
          <span className="cartoon-badge cartoon-badge-purple">One-Click Launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`cartoon-card cartoon-card-interactive p-5 border-2 ${action.border} flex items-center justify-between group`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shadow-md border-2 border-white/20 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white block group-hover:text-purple-300 transition-colors">
                      {action.title}
                    </span>
                    <span className="text-xs text-gray-400 block font-medium">
                      {action.desc}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-purple-600 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Grid: Charts & Weekly Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recharts growth graph (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="cartoon-card p-6 border-2 border-purple-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Skill Growth & Placement Trend</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">Weekly performance and assessment milestones</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <span className="w-3 h-3 rounded-full bg-purple-500 shadow" /> Skill Score
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow" /> Readiness
                </span>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cartoonPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="cartoonCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#151b2e', borderColor: '#8b5cf6', borderRadius: '16px', color: '#fff', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#cartoonPurple)" />
                  <Area type="monotone" dataKey="readiness" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#cartoonCyan)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Certifications & Badges */}
          <div className="cartoon-card p-6 border-2 border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Certifications</span>
              </h3>
              <span className="cartoon-badge cartoon-badge-mint">Official Badges</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {mockCertificates.map(cert => (
                <div key={cert.id} className={`p-3.5 rounded-2xl border-2 ${cert.badgeColor} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/10">{cert.date}</span>
                  </div>
                  <span className="font-extrabold text-xs text-white block truncate">{cert.title}</span>
                  <span className="text-[10px] text-gray-300 font-bold block">{cert.provider}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Gamified Missions & Skills */}
        <div className="space-y-6">
          {/* Weekly Goals Checklist */}
          <div className="cartoon-card p-6 border-2 border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-yellow-400" />
                <span>Weekly Missions</span>
              </h3>
              <span className="cartoon-badge cartoon-badge-yellow">XP Boost</span>
            </div>
            <p className="text-xs text-gray-400 mb-4 font-medium">Check off missions to increase placement score</p>
            
            <div className="space-y-2.5">
              {goals.map(goal => (
                <label 
                  key={goal.id} 
                  className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    goal.done 
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-gray-400' 
                      : 'bg-[#1a223a] border-purple-500/20 hover:border-purple-500/50 text-gray-200'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={goal.done} 
                    onChange={() => toggleGoal(goal.id)}
                    className="mt-0.5 w-4 h-4 rounded-md accent-purple-500 cursor-pointer"
                  />
                  <span className={`text-xs font-bold leading-relaxed ${goal.done ? 'line-through text-gray-400' : 'text-white'}`}>
                    {goal.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Technical Skills Showcase */}
          <div className="cartoon-card p-6 border-2 border-pink-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-pink-400" />
                <span>Technical Skills ({skillsList.length})</span>
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <span key={idx} className="cartoon-badge cartoon-badge-purple py-1 px-3 text-xs font-extrabold">
                  {skill}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t-2 border-white/10 space-y-2.5">
              <button 
                onClick={() => onOpenVerification && onOpenVerification("React.js")}
                className="cartoon-btn cartoon-btn-yellow w-full py-2.5 text-xs font-black gap-2"
              >
                <Zap className="w-4 h-4 fill-current" /> Verify Skill & Earn Certificate
              </button>
              
              <button 
                onClick={() => onNavigate('interview')}
                className="cartoon-btn cartoon-btn-pink w-full py-2.5 text-xs font-black gap-2"
              >
                <Award className="w-4 h-4" /> Start Placement Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
