// agent-notes: { ctx: "Clean minimal SaaS student dashboard with metric cards, growth chart, missions checklist & tool shortcuts including roleplay simulation", deps: ["recharts", "lucide-react", "./common/AIAssistantAvatar"], state: "active", last: "anti@2026-08-29" }
import React, { useState } from 'react';
import { 
  Award, 
  CheckSquare, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Code2,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Briefcase,
  Brain,
  MessageSquare,
  Layers,
  CheckCircle2,
  Bot
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
    
    setAvatarState('success');
    setTimeout(() => setAvatarState('idle'), 2000);

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
      desc: 'ATS scan & score improvement',
      icon: FileText,
      badge: 'ATS Scanner'
    },
    {
      id: 'skillgap',
      title: 'Skill Gap Analysis',
      desc: 'Benchmark skills vs job market',
      icon: Briefcase,
      badge: 'Evaluation'
    },
    {
      id: 'roadmap',
      title: 'Learning Roadmap',
      desc: 'Curated milestone stages',
      icon: Target,
      badge: 'Roadmap'
    },
    {
      id: 'chat',
      title: 'AI Career Mentor',
      desc: 'Real-time guidance & advice',
      icon: MessageSquare,
      badge: 'AI Mentor'
    },
    {
      id: 'interview',
      title: 'Mock Interview',
      desc: 'Simulate technical interview rounds',
      icon: Award,
      badge: 'Prep'
    },
    {
      id: 'roleplay',
      title: 'AI Roleplay Simulator',
      desc: 'Simulate high-stakes scenarios & negotiations',
      icon: Bot,
      badge: 'Interactive'
    },
    {
      id: 'aptitude',
      title: 'Aptitude Practice',
      desc: 'Quantitative & logical questions',
      icon: Brain,
      badge: 'Practice'
    }
  ];

  const mockCertificates = [
    { id: 1, title: 'Google Cloud Professional', provider: 'Google', date: '2026' },
    { id: 2, title: 'AWS Cloud Practitioner', provider: 'AWS Skill Builder', date: '2026' },
    { id: 3, title: 'Meta Front-End Developer', provider: 'Meta', date: '2025' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Welcome Hero */}
      <div className="saas-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <AIAssistantAvatar 
            size="lg" 
            state={avatarState} 
            onClick={() => {
              setAvatarState('speaking');
              setTimeout(() => setAvatarState('idle'), 2500);
            }}
            showSpeechBubble={true}
            speechText={`Welcome back, ${profile?.name?.split(' - ')[0] || 'User'}`}
          />

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {profile?.name?.split(' - ')[0] || 'Student'}
            </h1>
            <p className="text-sm text-slate-500">
              Targeting <span className="font-medium text-slate-800">{typeof profile?.careerGoal === 'object' ? profile.careerGoal?.name || 'Full Stack Developer' : (profile?.careerGoal || 'Full Stack Developer')}</span> • {typeof profile?.college === 'object' ? profile.college?.name || profile.college?.college || 'Computer Science Department' : (profile?.college || 'Computer Science Department')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onNavigate('job')}
            className="saas-btn-primary w-full md:w-auto text-xs px-4 py-2 gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Explore Job Matrix</span>
          </button>
          <button
            onClick={() => onNavigate('resume')}
            className="saas-btn-secondary w-full md:w-auto text-xs px-4 py-2"
          >
            Upload Resume
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resume Score */}
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Resume ATS Score</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {hasUploadedResume ? `${scores.resumeScore}/100` : '85/100'}
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ATS parsing verified</span>
          </p>
        </div>

        {/* Skill Match */}
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Target Role Match</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {scores.skillScore || 78}%
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            <span>+12% progress this month</span>
          </p>
        </div>

        {/* Verified Skills */}
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Verified Skills</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {skillsList.length} Skills
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Award className="w-3 h-3 text-indigo-600" />
            <span>Standardized assessment</span>
          </p>
        </div>

        {/* Weekly Quests */}
        <div className="saas-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Weekly Missions</span>
            <CheckSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {goals.filter(g => g.done).length} of {goals.length} Completed
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Keep up the pace</span>
          </p>
        </div>
      </div>

      {/* 3. Quick Actions Tools Hub */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Platform Modules</h2>
          <span className="text-xs text-slate-500 font-medium">All tools integrated</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="saas-card saas-card-interactive p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                      {action.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {action.desc}
                    </span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Chart & Missions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Progress Area Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="saas-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Placement Readiness Trend</h3>
                <p className="text-xs text-slate-500">Weekly evaluation scores and skill mastery</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Skill Score
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Readiness
                </span>
              </div>
            </div>
            
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#indigoGradient)" />
                  <Area type="monotone" dataKey="readiness" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#slateGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Verified Certifications */}
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Verified Credentials</h3>
              <span className="saas-badge saas-badge-indigo text-[11px]">Official</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {mockCertificates.map(cert => (
                <div key={cert.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-medium text-slate-500">{cert.date}</span>
                  </div>
                  <span className="font-medium text-xs text-slate-900 block truncate">{cert.title}</span>
                  <span className="text-[11px] text-slate-500 block">{cert.provider}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Missions & Skills */}
        <div className="space-y-6">
          {/* Weekly Missions */}
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Weekly Missions</h3>
              <span className="text-xs text-slate-500 font-medium">{goals.filter(g => g.done).length}/{goals.length} done</span>
            </div>
            <p className="text-xs text-slate-500">Check off items as you complete study tasks</p>
            
            <div className="space-y-2 pt-1">
              {goals.map(goal => (
                <label 
                  key={goal.id} 
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                    goal.done 
                      ? 'bg-slate-50/80 border-slate-200 text-slate-400' 
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={goal.done} 
                    onChange={() => toggleGoal(goal.id)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={`leading-relaxed ${goal.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {goal.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Skills & Verification Trigger */}
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Assessed Skills</h3>
              <span className="text-xs text-slate-500">{skillsList.length} skills</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, idx) => (
                <span key={idx} className="saas-badge text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button 
                onClick={() => onOpenVerification && onOpenVerification("React.js")}
                className="saas-btn-primary w-full py-2 text-xs font-medium gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Skill & Get Badge</span>
              </button>
              
              <button 
                onClick={() => onNavigate('interview')}
                className="saas-btn-secondary w-full py-2 text-xs font-medium gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-slate-500" />
                <span>Start Mock Interview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
