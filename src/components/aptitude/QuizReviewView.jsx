// agent-notes: { ctx: "Clean minimal SaaS Post-quiz review view with option badges & step-by-step explanations", deps: ["lucide-react"], state: "active", last: "anti@2026-08-27" }

import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function QuizReviewView({ questions = [], evaluatedAnswers = [], onBack }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto text-slate-900">
      {/* Header Bar */}
      <div className="saas-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="saas-btn-secondary py-1.5 px-2.5 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-semibold text-indigo-600 block">Assessment Review</span>
            <h2 className="text-sm font-bold text-slate-900">Reviewing {questions.length} Questions</h2>
          </div>
        </div>

        <button
          onClick={onBack}
          className="saas-btn-primary py-1.5 px-4 text-xs font-medium"
        >
          Done Reviewing
        </button>
      </div>

      {/* Questions Review List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const evalItem = evaluatedAnswers[idx] || {};
          const userAns = evalItem.selectedOption || 'Not Attempted';
          const isCorrect = Boolean(evalItem.isCorrect);

          return (
            <div key={idx} className="saas-card p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="saas-badge text-xs">
                  Question {idx + 1}
                </span>

                <div>
                  {isCorrect ? (
                    <span className="saas-badge saas-badge-success text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1)
                    </span>
                  ) : (
                    <span className="saas-badge saas-badge-danger text-xs flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xs font-semibold text-slate-900 leading-relaxed">{q.question}</h3>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
                {q.options &&
                  q.options.map((opt, oIdx) => {
                    const optText = typeof opt === 'string' ? opt : opt.text;
                    const isUserPick = userAns === optText;
                    const isRightAns = (evalItem.correctAnswer || q.correctAnswer) === optText;

                    let style = 'bg-white border-slate-200 text-slate-700';
                    if (isRightAns) style = 'bg-emerald-50 border-emerald-300 text-emerald-850 font-medium';
                    else if (isUserPick && !isRightAns) style = 'bg-rose-50 border-rose-300 text-rose-800';

                    return (
                      <div key={oIdx} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${style}`}>
                        <span>
                          <strong className="mr-1.5 text-slate-400">{String.fromCharCode(65 + oIdx)}.</strong>
                          {optText}
                        </span>

                        {isRightAns && <span className="text-[10px] font-semibold text-emerald-800">Correct Answer</span>}
                        {isUserPick && !isRightAns && <span className="text-[10px] font-semibold text-rose-800">Your Answer</span>}
                      </div>
                    );
                  })}
              </div>

              {/* Step Explanation */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-indigo-600 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Detailed Explanation
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
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
