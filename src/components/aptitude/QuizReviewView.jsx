// agent-notes: { ctx: "Post-quiz review view listing all questions, selected vs correct options & step explanations", deps: ["lucide-react"], state: "active", last: "anti@2026-08-04" }

import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, Bookmark, BookmarkCheck } from 'lucide-react';

export default function QuizReviewView({ questions, evaluatedAnswers = [], onBack }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="glass rounded-2xl p-4 border border-card-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-bold text-accent-pink block">TEST REVIEW MODE</span>
            <h2 className="text-sm font-black text-white">Reviewing {questions.length} Questions</h2>
          </div>
        </div>

        <button
          onClick={onBack}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-xs shadow-lg shadow-purple-600/30"
        >
          Done Reviewing
        </button>
      </div>

      {/* Questions Review List */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const evalItem = evaluatedAnswers[idx] || {};
          const userAns = evalItem.selectedOption || 'Not Attempted';
          const isCorrect = Boolean(evalItem.isCorrect);

          return (
            <div key={idx} className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                <span className="text-[10px] font-mono font-bold text-accent-purple bg-accent-purple/10 px-2.5 py-1 rounded-md border border-accent-purple/20">
                  Question {idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-white leading-relaxed">{q.question}</h3>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {q.options &&
                  q.options.map((opt, oIdx) => {
                    const optText = typeof opt === 'string' ? opt : opt.text;
                    const isUserPick = userAns === optText;
                    const isRightAns = (evalItem.correctAnswer || q.correctAnswer) === optText;

                    let style = 'bg-gray-900/60 border-gray-800 text-gray-400';
                    if (isRightAns) style = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                    else if (isUserPick && !isRightAns) style = 'bg-red-500/20 border-red-500/50 text-red-300';

                    return (
                      <div key={oIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}>
                        <span>
                          <strong className="mr-2">{String.fromCharCode(65 + oIdx)}.</strong>
                          {optText}
                        </span>

                        {isRightAns && <span className="text-[10px] uppercase font-bold text-emerald-400">Correct Answer</span>}
                        {isUserPick && !isRightAns && <span className="text-[10px] uppercase font-bold text-red-400">Your Answer</span>}
                      </div>
                    );
                  })}
              </div>

              {/* Step Explanation */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-accent-purple flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Detailed Explanation
                </span>
                <p className="text-xs text-gray-300 leading-relaxed font-normal">
                  {evalItem.explanation || q.explanation || 'Step-by-step mathematical reasoning verified.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
