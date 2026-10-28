// agent-notes: { ctx: "Learning progress overview banner with dimensional metrics and Resume Learning action button", deps: ["lucide-react"], state: "active", last: "sato@2026-10-28" }
import React from 'react';
import { 
  PlayCircle, 
  CheckCircle2, 
  Youtube, 
  GraduationCap, 
  BookOpen, 
  Flame,
  ArrowRight
} from 'lucide-react';

export default function LearningProgressSummary({
  overallPercentage = 0,
  completedModules = 0,
  totalModules = 0,
  completedTutorials = 0,
  totalTutorials = 0,
  completedCourses = 0,
  totalCourses = 0,
  readNotesTopics = 0,
  totalNotesTopics = 0,
  resumeItem = null,
  onResumeClick
}) {
  return (
    <div className="saas-card p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Progress & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Continuous Learning
            </span>
            <span className="text-xs text-indigo-200">
              {overallPercentage}% Completed Overall
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Personalized Learning & Skill Mastery Hub
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Complete hands-on practice, watch curated YouTube masterclasses, earn verified course credentials from Google & tech leaders, and absorb AI study notes.
          </p>
        </div>

        {/* Resume Learning Action */}
        {resumeItem && (
          <button
            onClick={() => onResumeClick && onResumeClick(resumeItem)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all shrink-0 self-start sm:self-center"
          >
            <PlayCircle className="w-4 h-4 text-white" />
            <div className="text-left">
              <span className="block text-[10px] text-indigo-200 leading-none">Resume Learning</span>
              <span className="block text-xs font-semibold truncate max-w-[150px]">{resumeItem.title}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-80" />
          </button>
        )}
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-indigo-900/60">
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <span className="block text-[10px] text-slate-400 leading-none">Modules</span>
            <span className="block text-xs font-bold text-white">{completedModules}/{totalModules}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
          <Youtube className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="space-y-0.5">
            <span className="block text-[10px] text-slate-400 leading-none">Tutorials</span>
            <span className="block text-xs font-bold text-white">{completedTutorials}/{totalTutorials}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
          <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="space-y-0.5">
            <span className="block text-[10px] text-slate-400 leading-none">Free Courses</span>
            <span className="block text-xs font-bold text-white">{completedCourses}/{totalCourses}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="space-y-0.5">
            <span className="block text-[10px] text-slate-400 leading-none">Study Topics</span>
            <span className="block text-xs font-bold text-white">{readNotesTopics}/{totalNotesTopics}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
