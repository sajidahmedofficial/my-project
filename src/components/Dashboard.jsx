import React from 'react';
import { 
  Award, 
  CheckSquare, 
  TrendingUp, 
  Layers, 
  Flame, 
  ArrowRight,
  Sparkles
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

  const [goals, setGoals] = React.useState(initialGoals);

  const toggleGoal = (id) => {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    
    // Update progress score on profile
    const doneCount = updated.filter(g => g.done).length;
    const progressPercent = Math.round((doneCount / updated.length) * 100);
    
    setProfile(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        weeklyGoalsProgress: progressPercent,
        placementReadiness: Math.min(100, Math.round(prev.scores.placementReadiness + (progressPercent - prev.scores.weeklyGoalsProgress) * 0.15))
      }
    }));
  };

  // Mock progress chart data
  const progressData = [
    { name: 'Week 1', score: 40, readiness: 30 },
    { name: 'Week 2', score: 48, readiness: 38 },
    { name: 'Week 3', score: 55, readiness: 45 },
    { name: 'Week 4', score: 65, readiness: 52 },
    { name: 'Week 5', score: profile.scores.skillScore || 70, readiness: profile.scores.placementReadiness || 60 }
  ];

  // Skill categories data for bar chart
  const skillBarData = [
    { category: 'Frontend', count: profile.skills.filter(s => ['HTML', 'CSS', 'JavaScript', 'React.js', 'Tailwind CSS'].includes(s)).length * 20 + 20 },
    { category: 'Backend', count: profile.skills.filter(s => ['Node.js', 'Express.js', 'Python', 'Java'].includes(s)).length * 25 + 15 },
    { category: 'Database', count: profile.skills.filter(s => ['SQL', 'MongoDB'].includes(s)).length * 40 + 10 },
    { category: 'Tools/Git', count: profile.skills.filter(s => ['Git', 'Docker', 'AWS'].includes(s)).length * 35 + 20 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative glass rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-accent-purple" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent-purple/20 text-accent-pink border border-accent-pink/30 inline-flex items-center gap-1.5">
            <Flame className="w-3 h-3" /> Capstone Edition
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple via-accent-pink to-accent-blue">{profile.name.split(' - ')[0]}</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-sm">
            SkillBridge AI has updated your metrics. You are currently preparing for placement tests with {profile.skills.length} extracted skills.
          </p>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass rounded-xl p-5 flex items-center justify-between relative group hover:border-accent-purple/40 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Skill Score</span>
            <div className="text-3xl font-extrabold text-white">{profile.scores.skillScore}%</div>
            <span className="text-xs text-accent-emerald flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +5% this week
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass rounded-xl p-5 flex items-center justify-between relative group hover:border-accent-pink/40 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Resume Score</span>
            <div className="text-3xl font-extrabold text-white">{profile.scores.resumeScore}/100</div>
            <span className="text-xs text-gray-400">Based on AI analysis</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent-pink/10 border border-accent-pink/30 flex items-center justify-center text-accent-pink group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass rounded-xl p-5 flex items-center justify-between relative group hover:border-accent-blue/40 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Placement Readiness</span>
            <div className="text-3xl font-extrabold text-white">{profile.scores.placementReadiness}%</div>
            <span className="text-xs text-accent-blue font-medium">Goal: 85% to apply</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass rounded-xl p-5 flex items-center justify-between relative group hover:border-accent-cyan/40 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-400">Weekly Goal Progress</span>
            <div className="text-3xl font-extrabold text-white">{profile.scores.weeklyGoalsProgress}%</div>
            <span className="text-xs text-gray-400">{goals.filter(g => g.done).length} of {goals.length} completed</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Charts & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recharts graph (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-md font-semibold text-white">Skill & Readiness Progress</h3>
                <p className="text-xs text-gray-400">Weekly advancement tracking</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-accent-purple">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-purple" /> Skill Score
                </span>
                <span className="flex items-center gap-1.5 text-accent-blue">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-blue" /> Placement Readiness
                </span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  <Area type="monotone" dataKey="readiness" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReadiness)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill distribution bar chart */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Competency Map</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="category" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profile info & Education */}
            <div className="glass rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Academic Base</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Education</span>
                    <span className="text-xs text-white leading-relaxed">{profile.education}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Experience</span>
                    <span className="text-xs text-gray-300">{profile.experience}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('resume')}
                className="mt-4 w-full text-center text-xs font-semibold py-2 rounded-lg bg-gray-800 text-accent-purple hover:bg-gray-700 hover:text-white border border-accent-purple/20 transition-all flex items-center justify-center gap-1"
              >
                Refine Resume <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Goals checklist & Quick Navigation (1/3 width) */}
        <div className="space-y-6">
          {/* Weekly Goals Widget */}
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-accent-purple" /> Weekly Milestones
            </h3>
            <p className="text-xs text-gray-400 mb-4">Complete these to boost placement readiness</p>
            <div className="space-y-3">
              {goals.map(goal => (
                <label key={goal.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={goal.done} 
                    onChange={() => toggleGoal(goal.id)}
                    className="mt-0.5 w-4 h-4 accent-accent-purple rounded bg-gray-900 border-gray-700 text-accent-purple focus:ring-0 focus:ring-offset-0"
                  />
                  <span className={`leading-relaxed text-gray-300 ${goal.done ? 'line-through text-gray-500' : ''}`}>
                    {goal.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Quick Actions / Tech Stack */}
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Your Technical Stack</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs font-semibold rounded bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                  {skill}
                </span>
              ))}
              {profile.skills.length === 0 && (
                <span className="text-xs text-gray-500 italic">No skills extracted. Go to Resume Analyzer to upload!</span>
              )}
            </div>
            <hr className="border-gray-800" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Ready to test?</span>
              <button 
                onClick={() => onNavigate('interview')}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity font-semibold text-xs text-white flex items-center justify-center gap-1.5 shadow-lg shadow-accent-purple/15"
              >
                <Award className="w-4 h-4" /> Start Mock Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
