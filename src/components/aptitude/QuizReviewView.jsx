// agent-notes: { ctx: "Post-quiz review view with cartoon styling, option badges & step-by-step explanations", deps: ["lucide-react"], state: "active", last: "anti@2026-08-21" }

import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function QuizReviewView({ questions = [], evaluatedAnswers = [], onBack }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto select-none">
      {/* Header Bar */}
      <div className="cartoon-card p-4 border-2 border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="cartoon-btn cartoon-btn-dark py-2 px-3 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-black text-pink-400 block">QUEST REVIEW</span>
            <h2 className="text-sm font-black text-white">Reviewing {questions.length} Questions</h2>
          </div>
        </div>

        <button
          onClick={onBack}
          className="cartoon-btn cartoon-btn-purple py-2 px-4 text-xs font-black"
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
            <div key={idx} className="cartoon-card p-6 border-2 border-purple-500/25 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-white/10 pb-3">
                <span className="cartoon-badge cartoon-badge-purple text-xs">
                  Question {idx + 1}
                </span>

                <div>
                  {isCorrect ? (
                    <span className="cartoon-badge cartoon-badge-mint text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                    </span>
                  ) : (
                    <span className="cartoon-badge cartoon-badge-pink text-xs">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-black text-white leading-relaxed">{q.question}</h3>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {q.options &&
                  q.options.map((opt, oIdx) => {
                    const optText = typeof opt === 'string' ? opt : opt.text;
                    const isUserPick = userAns === optText;
                    const isRightAns = (evalItem.correctAnswer || q.correctAnswer) === optText;

                    let style = 'bg-[#0d1220] border-purple-500/20 text-gray-300';
                    if (isRightAns) style = 'bg-emerald-950/60 border-emerald-400 text-emerald-200 font-bold';
                    else if (isUserPick && !isRightAns) style = 'bg-rose-950/60 border-rose-400 text-rose-200';

                    return (
                      <div key={oIdx} className={`p-3 rounded-2xl border-2 text-xs flex items-center justify-between ${style}`}>
                        <span>
                          <strong className="mr-2 text-pink-400">{String.fromCharCode(65 + oIdx)}.</strong>
                          {optText}
                        </span>

                        {isRightAns && <span className="text-[10px] uppercase font-black text-emerald-400">Correct Answer</span>}
                        {isUserPick && !isRightAns && <span className="text-[10px] uppercase font-black text-rose-400">Your Answer</span>}
                      </div>
                    );
                  })}
              </div>

              {/* Step Explanation */}
              <div className="p-4 rounded-2xl bg-[#0d1220] border-2 border-purple-500/20 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-purple-300 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> Detailed Explanation
                </span>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  {evalItem.explanation || q.explanation || 'Step-by-step reasoning verified.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
