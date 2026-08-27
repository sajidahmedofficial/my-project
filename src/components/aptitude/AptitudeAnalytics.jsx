// agent-notes: { ctx: "Clean minimal SaaS Performance Analytics dashboard with category accuracy breakdowns & progress charts", deps: ["recharts", "lucide-react"], state: "active", last: "anti@2026-08-27" }

import React from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in text-slate-900">
      <div className="saas-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="saas-badge saas-badge-indigo text-[10px]">
            <BarChart2 className="w-3 h-3" /> Performance Metrics
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Aptitude Performance Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Deep analytics across 87 topics for campus placement readiness</p>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="saas-card p-4 space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Questions Solved</span>
          <div className="text-2xl font-bold text-slate-900">{defaultStats.totalAttempted}</div>
          <span className="text-[10px] text-emerald-600 font-medium">+25 this week</span>
        </div>

        <div className="saas-card p-4 space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Overall Accuracy</span>
          <div className="text-2xl font-bold text-indigo-600">{defaultStats.overallAccuracy}%</div>
          <span className="text-[10px] text-slate-400 font-medium">Placement Grade: High</span>
        </div>

        <div className="saas-card p-4 space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Average Speed</span>
          <div className="text-2xl font-bold text-slate-900">{defaultStats.averageTimeSeconds}s</div>
          <span className="text-[10px] text-slate-500 font-medium">Optimal Speed Range</span>
        </div>

        <div className="saas-card p-4 space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Practice Streak</span>
          <div className="text-2xl font-bold text-indigo-600">{defaultStats.streakDays} Days</div>
          <span className="text-[10px] text-indigo-600 font-medium">Active Daily Streak</span>
        </div>
      </div>

      {/* Accuracy Chart */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Accuracy Trajectory
        </h3>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#accuracyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">Category Performance Breakdown</h3>
        <div className="space-y-3">
          {defaultStats.categoryStats.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">{cat.category}</span>
                <span className="text-slate-900 font-semibold">{cat.accuracy}% Accuracy ({cat.correct}/{cat.attempted})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${cat.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
