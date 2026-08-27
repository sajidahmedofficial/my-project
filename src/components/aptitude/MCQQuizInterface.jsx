// agent-notes: { ctx: "Clean minimal SaaS MCQ quiz interface with question options, timer & palette navigation", deps: ["lucide-react", "../../services/aptitudeApi"], state: "active", last: "anti@2026-08-27" }

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  CheckSquare, 
  Flag
} from 'lucide-react';
import { aptitudeApi } from '../../services/aptitudeApi';

export default function MCQQuizInterface({ session, questions, onComplete, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [syntaxInputs, setSyntaxInputs] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [submittedFeedback, setSubmittedFeedback] = useState({});
  const [timerSeconds, setTimerSeconds] = useState((session?.limit || 20) * 60);

  const safeQuestions = Array.isArray(questions) && questions.length > 0 ? questions : [];
  const currentQ = safeQuestions[currentIndex] || {};
  const isPracticeMode = session?.mode === 'practice' || !session?.mode;

  const isSyntaxQuestion = currentQ.type === 'syntax' || 
    currentQ.questionType === 'syntax' || 
    Boolean(currentQ.isSyntax) || 
    (currentQ.category && currentQ.category.toLowerCase().includes('syntax')) ||
    (currentQ.question && /syntax|keyword|fill in the missing|write the exact/i.test(currentQ.question));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (oIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: oIdx
    }));
  };

  const handleSyntaxInputChange = (val) => {
    setSyntaxInputs(prev => ({
      ...prev,
      [currentIndex]: val
    }));
  };

  const handleSubmitAnswer = async () => {
    if (isSyntaxQuestion) {
      const typedVal = syntaxInputs[currentIndex] || '';
      if (!typedVal.trim()) return;

      const expected = currentQ.correctSyntax || currentQ.answer || (currentQ.options && currentQ.options[currentQ.correctAnswer]);
      const expectedText = typeof expected === 'string' ? expected : (expected?.text || '');
      const isCorrect = typedVal.trim().toLowerCase() === expectedText.trim().toLowerCase();

      setSubmittedFeedback(prev => ({
        ...prev,
        [currentIndex]: {
          selectedAnswer: typedVal,
          isCorrect,
          correctAnswer: expectedText,
          correctOptionText: expectedText,
          explanation: currentQ.explanation || `Correct syntax: ${expectedText}`,
          solution: currentQ.solution || expectedText
        }
      }));
      return;
    }

    const selectedIdx = answers[currentIndex];
    if (selectedIdx === undefined || selectedIdx === null) return;

    try {
      const res = await aptitudeApi.submitAnswer(session.id || session.sessionId, {
        questionId: currentQ.id,
        selectedAnswer: selectedIdx,
        topicId: session.topicId
      });

      setSubmittedFeedback(prev => ({
        ...prev,
        [currentIndex]: {
          selectedAnswer: selectedIdx,
          isCorrect: res.isCorrect,
          correctAnswer: res.correctAnswer,
          correctOptionText: res.correctOptionText || currentQ.options?.[res.correctAnswer],
          explanation: res.explanation || currentQ.explanation,
          solution: res.solution || currentQ.solution || res.explanation
        }
      }));
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const toggleReviewMark = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  const toggleBookmarkQuestion = async () => {
    const isBookmarked = !bookmarks[currentIndex];
    setBookmarks(prev => ({
      ...prev,
      [currentIndex]: isBookmarked
    }));

    if (currentQ.id) {
      try {
        await aptitudeApi.toggleBookmark(currentQ.id, isBookmarked);
      } catch (err) {
        console.error('Failed to toggle bookmark:', err);
      }
    }
  };

  const handleFinalSubmit = () => {
    const answersPayload = safeQuestions.map((q, idx) => ({
      questionId: q.id,
      selectedAnswer: isSyntaxQuestion ? (syntaxInputs[idx] || '') : answers[idx],
      markedForReview: Boolean(markedForReview[idx])
    }));

    if (onComplete) {
      onComplete(answersPayload);
    }
  };

  const answeredCount = Object.keys(answers).length + Object.keys(syntaxInputs).length;
  const feedback = submittedFeedback[currentIndex];
  const selectedOptIdx = answers[currentIndex];

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      {/* Top Header */}
      <div className="saas-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="saas-btn-secondary py-1.5 px-2.5 text-xs gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit
          </button>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              {session?.topicName || 'Aptitude Assessment'}
            </span>
            <h2 className="text-xs font-semibold text-slate-900">
              Question {currentIndex + 1} of {safeQuestions.length}
            </h2>
          </div>
        </div>

        {/* Progress Bar & Timer */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / safeQuestions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">
              {Math.round(((currentIndex + 1) / safeQuestions.length) * 100)}%
            </span>
          </div>

          <div className="saas-badge text-xs font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> {formatTime(timerSeconds)}
          </div>
        </div>
      </div>

      {/* Main Grid: Question Card & Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Question Card */}
        <div className="lg:col-span-8 space-y-4">
          <div className="saas-card p-6 space-y-5">
            {/* Metadata Badges */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <span className="saas-badge text-[10px]">
                {currentQ.id || `Q-${currentIndex + 1}`}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleBookmarkQuestion}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    bookmarks[currentIndex]
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  title="Bookmark question"
                >
                  {bookmarks[currentIndex] ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={toggleReviewMark}
                  className={`py-1 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                    markedForReview[currentIndex]
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  <span className="hidden sm:inline">Review</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                {isSyntaxQuestion ? 'Syntax Challenge' : 'Multiple Choice'}
              </span>
              <h3 className="text-sm font-semibold text-slate-900 leading-relaxed">{currentQ.question}</h3>
            </div>

            {/* Multiple Choice Options */}
            {isSyntaxQuestion ? (
              <div className="space-y-2 pt-1">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 block">
                    Type syntax answer:
                  </label>
                  <input
                    type="text"
                    value={syntaxInputs[currentIndex] || ''}
                    onChange={(e) => handleSyntaxInputChange(e.target.value)}
                    disabled={isPracticeMode && Boolean(feedback)}
                    placeholder="Enter syntax..."
                    className="w-full bg-white border border-slate-200 text-slate-900 font-mono text-xs rounded-md p-2 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {currentQ.options &&
                  currentQ.options.map((opt, oIdx) => {
                    const optText = typeof opt === 'string' ? opt : opt.text;
                    const isSelected = selectedOptIdx === oIdx;
                    let cardClass = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';

                    if (isSelected) {
                      cardClass = 'bg-indigo-50/60 border-indigo-600 text-indigo-900 font-medium';
                    }

                    if (isPracticeMode && feedback) {
                      if (oIdx === feedback.correctAnswer) {
                        cardClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium';
                      } else if (isSelected && !feedback.isCorrect) {
                        cardClass = 'bg-rose-50 border-rose-500 text-rose-900';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        disabled={isPracticeMode && Boolean(feedback)}
                        className={`w-full p-3 rounded-lg border text-left text-xs flex items-center justify-between transition-colors ${cardClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="text-xs">{optText}</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Instant Feedback */}
            {isPracticeMode && feedback && (
              <div
                className={`p-3 rounded-lg border space-y-1.5 ${
                  feedback.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  {feedback.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct Answer
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" /> Incorrect (Correct: Option {String.fromCharCode(65 + feedback.correctAnswer)})
                    </>
                  )}
                </div>

                {feedback.explanation && (
                  <div className="pt-1.5 border-t border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold block mb-0.5">Solution:</span>
                    <p className="leading-relaxed">{feedback.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="saas-btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {isPracticeMode && !feedback && selectedOptIdx !== undefined && (
                  <button
                    onClick={handleSubmitAnswer}
                    className="saas-btn-primary py-1.5 px-3 text-xs"
                  >
                    Check Answer
                  </button>
                )}

                {currentIndex < safeQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="saas-btn-primary py-1.5 px-3.5 text-xs font-medium gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    className="saas-btn-primary py-1.5 px-3.5 text-xs font-medium gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Finish Quiz</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Palette Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="saas-card p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Question Matrix</h4>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {safeQuestions.map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isAns = answers[idx] !== undefined;
                const isRev = Boolean(markedForReview[idx]);

                let paletteStyle = 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50';

                if (isAns) paletteStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                if (isRev) paletteStyle = 'bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold';
                if (isCurrent) paletteStyle = 'bg-slate-900 border-slate-900 text-white font-bold';

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 rounded-md border text-xs font-mono transition-colors flex items-center justify-center ${paletteStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleFinalSubmit}
              className="saas-btn-primary w-full py-2 text-xs font-medium"
            >
              Submit & View Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
