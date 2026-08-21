// agent-notes: { ctx: "Playful cartoon Quiz Result Summary view with Sparky celebration, 3D buttons, bouncy metrics & placement readiness bar", deps: ["lucide-react", "../common/AIAssistantAvatar"], state: "active", last: "anti@2026-08-21" }

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
  Sparkles,
  Trophy
} from 'lucide-react';
import AIAssistantAvatar from '../common/AIAssistantAvatar';

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
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto select-none">
      {/* Header Card with Sparky Celebration */}
      <div className="cartoon-card p-6 md:p-8 border-2 border-purple-500/30 text-center space-y-4 relative overflow-hidden bg-gradient-to-r from-[#171d33] via-[#1c243f] to-[#1a2138]">
        <div className="flex justify-center">
          <AIAssistantAvatar 
            size="lg" 
            state={accuracy >= 70 ? 'success' : 'speaking'} 
            showSpeechBubble={true}
            speechText={accuracy >= 70 ? "Amazing quest run! You're leveling up fast!" : "Good effort! Keep practicing to hit 75%!"}
          />
        </div>

        <div>
          <div className="cartoon-badge cartoon-badge-pink mb-1">
            <Sparkles className="w-3.5 h-3.5" /> QUEST COMPLETE
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Performance Scorecard</h1>
          <p className="text-xs text-gray-300 font-medium mt-1">
            Rating: <strong className="text-emerald-400 font-black">{performance}</strong> • {accuracy}% Accuracy Achieved
          </p>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-[#0d1220] border-2 border-purple-500/20 space-y-1">
            <span className="text-[10px] uppercase font-black text-purple-400 block">Total Score</span>
            <div className="text-2xl font-black text-white">
              {score} / {totalQuestions}
            </div>
            <span className="text-[10px] text-purple-300 font-bold">Points Earned</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1220] border-2 border-emerald-500/20 space-y-1">
            <span className="text-[10px] uppercase font-black text-emerald-400 block">Accuracy</span>
            <div className="text-2xl font-black text-emerald-300">{accuracy}%</div>
            <span className="text-[10px] text-gray-400 font-bold">Correct Ratio</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1220] border-2 border-cyan-500/20 space-y-1">
            <span className="text-[10px] uppercase font-black text-cyan-400 block">Total Time</span>
            <div className="text-2xl font-black text-white">
              {Math.floor(totalTimeSeconds / 60)}m {totalTimeSeconds % 60}s
            </div>
            <span className="text-[10px] text-cyan-300 font-bold">Avg {avgTimePerQ}s / q</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1220] border-2 border-pink-500/20 space-y-1">
            <span className="text-[10px] uppercase font-black text-pink-400 block">Correct / Wrong</span>
            <div className="text-xl font-black text-white flex items-center justify-center gap-2">
              <span className="text-emerald-400">{correctCount}</span> / <span className="text-rose-400">{incorrectCount}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold">Skipped: {skippedCount}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="cartoon-card p-6 border-2 border-purple-500/25 space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" /> Placement Readiness Analysis
        </h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-black text-gray-200">
              <span>Placement Benchmark Threshold (75% Target)</span>
              <span className={accuracy >= 75 ? 'text-emerald-400 font-black' : 'text-amber-400 font-black'}>
                {accuracy >= 75 ? 'PASSED 🎯' : 'PRACTICE REQUIRED ⚡'}
              </span>
            </div>
            <div className="w-full bg-[#0d1220] rounded-full h-3 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  accuracy >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-yellow-500 to-amber-400'
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
          className="cartoon-btn cartoon-btn-purple flex-1 py-3 px-5 text-xs font-black gap-2"
        >
          <Eye className="w-4 h-4" /> Review All Questions & Answers
        </button>

        <button
          onClick={onRetry}
          className="cartoon-btn cartoon-btn-pink py-3 px-5 text-xs font-black gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Retry Test
        </button>

        {handleBack && (
          <button
            onClick={handleBack}
            className="cartoon-btn cartoon-btn-dark py-3 px-5 text-xs font-bold gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Aptitude Hub
          </button>
        )}
      </div>
    </div>
  );
}
