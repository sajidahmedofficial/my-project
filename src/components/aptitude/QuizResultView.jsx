// agent-notes: { ctx: "Quiz Result Summary view displaying score, accuracy, performance grade & action buttons", deps: ["lucide-react"], state: "active", last: "anti@2026-08-04" }

import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Eye, 
  Zap, 
  TrendingUp, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react';

export default function QuizResultView({ result, onReview, onRetry, onBackDashboard }) {
  const {
    score = 0,
    totalQuestions = 1,
    accuracy = 0,
    totalTimeSeconds = 0,
    performance = 'Good',
    evaluatedAnswers = []
  } = result;

  const correctCount = evaluatedAnswers.filter(a => a.isCorrect).length;
  const incorrectCount = evaluatedAnswers.filter(a => !a.isCorrect && a.selectedOption).length;
  const skippedCount = totalQuestions - evaluatedAnswers.filter(a => a.selectedOption).length;
  const avgTimePerQ = Math.round(totalTimeSeconds / (totalQuestions || 1));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-card-border text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-purple to-accent-pink flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-600/40">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-accent-pink tracking-widest block mb-1">
            TEST COMPLETED
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white">Performance Scorecard</h1>
          <p className="text-xs text-gray-400 mt-1">
            Rating: <strong className="text-emerald-400 font-extrabold">{performance}</strong> • {accuracy}% Accuracy Achieved
          </p>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Score</span>
            <div className="text-2xl font-black text-white">
              {score} / {totalQuestions}
            </div>
            <span className="text-[10px] text-accent-purple font-bold">Points Earned</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Accuracy</span>
            <div className="text-2xl font-black text-emerald-400">{accuracy}%</div>
            <span className="text-[10px] text-gray-400 font-bold">Correct Ratio</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Time</span>
            <div className="text-2xl font-black text-white">
              {Math.floor(totalTimeSeconds / 60)}m {totalTimeSeconds % 60}s
            </div>
            <span className="text-[10px] text-blue-400 font-bold">Avg {avgTimePerQ}s / question</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Correct / Wrong</span>
            <div className="text-xl font-black text-white flex items-center justify-center gap-2">
              <span className="text-emerald-400">{correctCount}</span> / <span className="text-red-400">{incorrectCount}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold">Skipped: {skippedCount}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-purple" /> Placement Readiness Analysis
        </h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-gray-300">
              <span>Placement Benchmark Threshold (75% Target)</span>
              <span className={accuracy >= 75 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {accuracy >= 75 ? 'PASSED' : 'PRACTICE REQUIRED'}
              </span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden border border-gray-800">
              <div
                className={`h-full transition-all duration-500 ${
                  accuracy >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={onReview}
          className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
        >
          <Eye className="w-4 h-4" /> Review All Questions & Answers
        </button>

        <button
          onClick={onRetry}
          className="py-3 px-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-accent-purple text-white font-extrabold text-xs flex items-center gap-2 transition-all hover:bg-gray-800"
        >
          <RotateCcw className="w-4 h-4 text-accent-purple" /> Retry Test
        </button>

        <button
          onClick={onBackDashboard}
          className="py-3 px-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 font-extrabold text-xs flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Aptitude Hub
        </button>
      </div>
    </div>
  );
}
