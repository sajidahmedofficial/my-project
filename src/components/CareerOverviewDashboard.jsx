// agent-notes: { ctx: "Career Overview with Setup Modal", deps: ["recharts", "lucide-react"], state: "active", last: "antigravity@2026-10-02" }
import React, { useState } from 'react';
import { 
  Target, 
  Edit3, 
  Navigation, 
  List, 
  BarChart2, 
  GraduationCap,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CareerOverviewDashboard({ profile }) {
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    targetRole: 'Database Administrator',
    resumeText: 'Experienced Backend Developer with 3 years working on Node.js and MySQL...',
    apiKey: ''
  });

  const [dashboardData, setDashboardData] = useState({
    aspiration: 'Loading...',
    targetRole: 'Loading...',
    interviewChance: 0,
    readiness: '-',
    marketDemand: '-',
    targetSalary: '-',
    stats: { matching: 0, unique: 0, missing: 0 },
    skills: [],
    courses: []
  });

  const handleAnalyze = async () => {
    if (!formData.targetRole || !formData.resumeText) {
      alert('Please provide both Resume and Target Role.');
      return;
    }
    setLoading(true);

    // Simulate API Call
    await new Promise(r => setTimeout(r, 1500));

    setDashboardData({
      aspiration: 'Backend Developer',
      targetRole: formData.targetRole,
      interviewChance: 8,
      readiness: '1-2 years',
      marketDemand: 'Medium',
      targetSalary: '$70,000',
      stats: { matching: 0, unique: 16, missing: 7 },
      skills: [
        { name: 'SQL', status: 'Missing', relevancy: 100 },
        { name: 'PostgreSQL', status: 'Missing', relevancy: 100 },
        { name: 'MySQL', status: 'Missing', relevancy: 75 },
        { name: 'NoSQL Databases', status: 'Missing', relevancy: 50 }
      ],
      courses: [
        { title: 'Database Management Essentials', provider: 'Coursera' },
        { title: 'SQL for Data Science', provider: 'Coursera' },
        { title: 'Introduction to NoSQL Databases', provider: 'Coursera' }
      ]
    });

    setLoading(false);
    setShowSetupModal(false);
  };

  const chartData = [
    { name: 'Your Profile', skills: dashboardData.stats.unique, fill: '#38bdf8' },
    { name: 'Target Role', skills: dashboardData.stats.missing, fill: '#f87171' }
  ];

  return (
    <div className="flex-1 text-gray-800 relative h-full">
      {/* SETUP MODAL */}
      {showSetupModal && (
        <div className="absolute inset-0 z-50 bg-gray-900/50 flex items-center justify-center backdrop-blur-sm -m-4 md:-m-8 rounded-xl overflow-hidden">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Skill Bridge Setup</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your details to generate a personalized dashboard.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                <input 
                  type="text" 
                  value={formData.targetRole}
                  onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                  placeholder="e.g. Database Administrator" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-[#41d888] focus:border-[#41d888] outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Resume (Text)</label>
                <textarea 
                  rows="4" 
                  value={formData.resumeText}
                  onChange={(e) => setFormData({...formData, resumeText: e.target.value})}
                  placeholder="Paste your resume text here..." 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-[#41d888] focus:border-[#41d888] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input 
                  type="password" 
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  placeholder="Enter your LLM API Key" 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-[#41d888] focus:border-[#41d888] outline-none" 
                />
              </div>
              <button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full bg-[#41d888] text-white font-semibold py-2.5 rounded-md hover:bg-green-500 transition shadow-sm mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Analyze Resume & Generate Dashboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className={`transition-all duration-300 ${showSetupModal ? 'blur-sm pointer-events-none' : ''}`}>
        <h1 className="text-2xl font-semibold mb-6">Welcome, {profile?.name || 'User'}</h1>

        {/* Top Section: Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-4 text-[#41d888] font-semibold text-sm">
              <span className="flex items-center gap-2"><Target className="w-4 h-4" /> Your Aspirations</span>
              <button className="text-gray-400 hover:text-[#41d888]"><Edit3 className="w-4 h-4" /></button>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-sm text-gray-600 mb-auto mt-2 w-3/4">
              "{dashboardData.aspiration}"
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 relative">
            <div className="flex justify-between items-start mb-4 text-[#41d888] font-semibold text-sm">
              <span className="flex items-center gap-2"><Navigation className="w-4 h-4" /> Your Career Next Step</span>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mb-1">
                    {dashboardData.interviewChance}%
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight">Interview<br/>Chance</div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-gray-500 text-xs uppercase tracking-wider mb-1">{dashboardData.targetRole}</h2>
              <button className="bg-[#41d888] text-white text-xs px-4 py-1.5 rounded-md hover:bg-green-500 transition shadow-sm flex items-center gap-1 w-fit" onClick={() => setShowSetupModal(true)}>
                <Edit3 className="w-3 h-3" /> Change Goal
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-[#e8fbf0] border border-green-100 rounded p-3">
                <div className="text-[#41d888] font-semibold text-lg">{dashboardData.readiness}</div>
                <div className="text-gray-400 text-xs">Interview Readiness</div>
              </div>
              <div className="bg-[#e8fbf0] border border-green-100 rounded p-3">
                <div className="text-[#41d888] font-semibold text-lg">{dashboardData.marketDemand}</div>
                <div className="text-gray-400 text-xs">Market Demand</div>
              </div>
              <div className="bg-[#e8fbf0] border border-green-100 rounded p-3">
                <div className="text-[#41d888] font-semibold text-lg">{dashboardData.targetSalary}</div>
                <div className="text-gray-400 text-xs">Target Salary</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Skills & Learning */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-[#41d888] font-semibold mb-4 text-sm flex items-center gap-2">
              <List className="w-4 h-4" /> Skills Required
            </h3>
            <div className="space-y-4">
              {dashboardData.skills.length === 0 && <p className="text-xs text-gray-400">Loading skills...</p>}
              {dashboardData.skills.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-[#41d888] rounded border-gray-300 focus:ring-[#41d888]" />
                    {skill.name}
                  </label>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{skill.status}</span>
                    <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1">
                      Skill relevancy 
                      <div className="w-16 h-1 bg-gray-200 inline-block rounded overflow-hidden">
                        <div className="h-full bg-[#41d888] rounded" style={{ width: `${skill.relevancy}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-[#41d888] font-semibold mb-4 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Skills Analysis
            </h3>
            <div className="h-48 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="skills" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex flex-col gap-2 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#41d888]"></div> Matching Skills</span> <span>{dashboardData.stats.matching}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> Unique Skills</span> <span>{dashboardData.stats.unique}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Missing Skills</span> <span>{dashboardData.stats.missing}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col max-h-[500px]">
            <h3 className="text-[#41d888] font-semibold mb-4 text-sm flex items-center gap-2 shrink-0">
              <GraduationCap className="w-4 h-4" /> Learning Plan
            </h3>
            <div className="overflow-y-auto pr-2 space-y-4">
              {dashboardData.courses.length === 0 && <p className="text-xs text-gray-400">Loading plan...</p>}
              {dashboardData.courses.map((course, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center font-bold shrink-0 mt-0.5">
                      C
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 leading-tight">{course.title}</h4>
                      <p className="text-xs text-gray-400">{course.provider}</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">0%</span>
                  </div>
                  <button className="bg-[#41d888] text-white text-xs px-5 py-1.5 rounded-md hover:bg-green-500 transition shadow-sm font-medium">Start</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
