// agent-notes: { ctx: "Performance Analytics dashboard with category accuracy breakdowns & weekly progress charts", deps: ["recharts", "lucide-react"], state: "active", last: "anti@2026-08-04" }

import React from 'react';
import { TrendingUp, Award, Clock, CheckCircle2, Zap, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AptitudeAnalytics({ stats }) {
  const defaultStats = stats || {
    totalAttempted: 140,
    totalCorrect: 112,
    overallAccuracy: 80,
    averageTimeSeconds: 38,
    streakDays: 5,
    categoryStats: [
      { category: 'Quantitative Aptitude', attempted: 60, correct: 48, accuracy: 80 },
      { category: 'Logical Reasoning', attempted: 45, correct: 38, accuracy: 84 },
      { category: 'Verbal Ability', attempted: 35, correct: 26, accuracy: 74 }
    ]
  };

  const chartData = [
    { day: 'Mon', accuracy: 65, solved: 15 },
    { day: 'Tue', accuracy: 72, solved: 25 },
    { day: 'Wed', accuracy: 78, solved: 30 },
    { day: 'Thu', accuracy: 84, solved: 40 },
    { day: 'Fri', accuracy: defaultStats.overallAccuracy, solved: 30 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass rounded-3xl p-6 border border-card-border">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-accent-purple" /> Aptitude Performance Analytics
        </h2>
        <p className="text-xs text-gray-400 mt-1">Deep analytics across 87 topics for campus placement readiness</p>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 space-y-1 border border-gray-800">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Questions Solved</span>
          <div className="text-2xl font-black text-white">{defaultStats.totalAttempted}</div>
          <span className="text-[10px] text-emerald-400 font-bold">+25 this week</span>
        </div>

        <div className="glass rounded-2xl p-4 space-y-1 border border-gray-800">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Overall Accuracy</span>
          <div className="text-2xl font-black text-emerald-400">{defaultStats.overallAccuracy}%</div>
          <span className="text-[10px] text-gray-400 font-bold">Placement Grade: High</span>
        </div>

        <div className="glass rounded-2xl p-4 space-y-1 border border-gray-800">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Average Speed</span>
          <div className="text-2xl font-black text-white">{defaultStats.averageTimeSeconds}s</div>
          <span className="text-[10px] text-blue-400 font-bold">Optimal Speed Range</span>
        </div>

        <div className="glass rounded-2xl p-4 space-y-1 border border-gray-800">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Practice Streak</span>
          <div className="text-2xl font-black text-accent-pink">{defaultStats.streakDays} Days</div>
          <span className="text-[10px] text-accent-pink font-bold">Active Daily Streak</span>
        </div>
      </div>

      {/* Accuracy Chart */}
      <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-pink" /> Accuracy Trajectory
        </h3>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="accuracy" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#accuracyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Category Performance Breakdown</h3>
        <div className="space-y-4">
          {defaultStats.categoryStats.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-300">{cat.category}</span>
                <span className="text-accent-pink font-bold">{cat.accuracy}% Accuracy ({cat.correct}/{cat.attempted})</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-850">
                <div className="bg-gradient-to-r from-accent-purple to-accent-pink h-full" style={{ width: `${cat.accuracy}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
