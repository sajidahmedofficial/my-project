// agent-notes: { ctx: "Clean minimal SaaS Quiz Result Summary view with metric cards, accuracy gauges & placement readiness bar", deps: ["lucide-react"], state: "active", last: "anti@2026-08-27" }

import React from 'react';
import { 
  Award, 
  RotateCcw, 
  Eye, 
  TrendingUp, 
  ArrowLeft, 
  Sparkles
} from 'lucide-react';

export default function QuizResultView({ result, onReview, onRetry, onBackDashboard, onBackToHub }) {
  const {
    score = 0,
    totalQuestions = 1,
    accuracy = 0,
    totalTimeSeconds = 0,
    performance = 'Good',
    evaluatedAnswers = []
  } = result;

  const handleBack = onBackToHub || onBackDashboard;
  const correctCount = evaluatedAnswers.filter(a => a.isCorrect).length;
  const incorrectCount = evaluatedAnswers.filter(a => !a.isCorrect && a.selectedOption).length;
  const skippedCount = totalQuestions - evaluatedAnswers.filter(a => a.selectedOption).length;
  const avgTimePerQ = Math.round(totalTimeSeconds / (totalQuestions || 1));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto text-slate-900">
      {/* Header Card */}
      <div className="saas-card p-6 md:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Award className="w-6 h-6" />
        </div>

        <div>
          <div className="saas-badge saas-badge-indigo mb-1.5 inline-block text-[10px]">
            <Sparkles className="w-3 h-3" /> Assessment Complete
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Performance Scorecard</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Rating: <strong className="text-emerald-700 font-semibold">{performance}</strong> • {accuracy}% Accuracy Achieved
          </p>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Score</span>
            <div className="text-xl font-bold text-slate-900">
              {score} / {totalQuestions}
            </div>
            <span className="text-[10px] text-slate-500">Points Earned</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Accuracy</span>
            <div className="text-xl font-bold text-emerald-600">{accuracy}%</div>
            <span className="text-[10px] text-slate-500">Correct Ratio</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Time</span>
            <div className="text-xl font-bold text-slate-900">
              {Math.floor(totalTimeSeconds / 60)}m {totalTimeSeconds % 60}s
            </div>
            <span className="text-[10px] text-slate-500">Avg {avgTimePerQ}s / q</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Correct / Wrong</span>
            <div className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <span className="text-emerald-600">{correctCount}</span> / <span className="text-rose-600">{incorrectCount}</span>
            </div>
            <span className="text-[10px] text-slate-500">Skipped: {skippedCount}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="saas-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" /> Placement Readiness Analysis
        </h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Aptitude Threshold Target (70% Pass Mark)</span>
              <span className={accuracy >= 70 ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                {accuracy >= 70 ? "Target Met ✓" : "Needs Improvement"}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${accuracy >= 70 ? "bg-emerald-600" : "bg-amber-500"}`}
                style={{ width: `${Math.min(100, accuracy)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {handleBack && (
          <button
            onClick={handleBack}
            className="saas-btn-secondary w-full sm:w-auto py-2 px-4 text-xs gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </button>
        )}

        <button
          onClick={onReview}
          className="saas-btn-secondary flex-1 w-full sm:w-auto py-2 px-4 text-xs gap-1.5 font-medium"
        >
          <Eye className="w-3.5 h-3.5" /> Review Answers & Explanations
        </button>

        <button
          onClick={onRetry}
          className="saas-btn-primary flex-1 w-full sm:w-auto py-2 px-4 text-xs gap-1.5 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Retake Test
        </button>
      </div>
    </div>
  );
}
