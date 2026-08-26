// agent-notes: { ctx: "Cartoon style MCQ quiz interface with bouncy question option cards, animated timer pill & celebratory feedback", deps: ["lucide-react", "../../services/aptitudeApi"], state: "active", last: "anti@2026-08-21" }

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
  Flag,
  Sparkles,
  Zap,
  Trophy
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

  // Timer Countdown
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
        console.error('Error toggling bookmark:', err);
      }
    }
  };

  const handleFinalSubmit = () => {
    const formattedAnswers = safeQuestions.map((q, idx) => {
      const selected = answers[idx];
      return {
        questionId: q.id,
        selectedAnswer: selected !== undefined ? selected : null,
        selectedOption: selected !== undefined ? selected : null,
        timeTaken: 30
      };
    });

    onComplete({
      sessionId: session.id || session.sessionId || `sess_${Date.now()}`,
      answers: formattedAnswers,
      totalTimeSeconds: ((session?.limit || 20) * 60) - timerSeconds,
      topicId: session.topicId
    });
  };

  if (safeQuestions.length === 0) {
    return (
      <div className="cartoon-card p-8 border-2 border-purple-500/30 text-center space-y-4">
        <h3 className="text-lg font-black text-white">Questions are being prepared for this quest.</h3>
        <p className="text-xs text-gray-300 font-medium">Please select another topic from the Practice Hub.</p>
        <button
          onClick={onExit}
          className="cartoon-btn cartoon-btn-purple py-2 px-5 text-xs font-bold"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const feedback = submittedFeedback[currentIndex];
  const selectedOptIdx = answers[currentIndex];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Header Toolbar */}
      <div className="cartoon-card p-4 border-2 border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="cartoon-btn cartoon-btn-dark py-2 px-3 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[11px] font-black uppercase text-pink-400 block">
              {session.topicName || session.topic} ({session.mode || 'practice'} mode)
            </span>
            <h2 className="text-sm font-black text-white">
              Question {currentIndex + 1} of {safeQuestions.length}
            </h2>
          </div>
        </div>

        {/* Progress Bar & Timer */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 bg-[#0d1220] rounded-full h-3 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / safeQuestions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-black text-purple-300">
              {Math.round(((currentIndex + 1) / safeQuestions.length) * 100)}%
            </span>
          </div>

          <div className="cartoon-badge cartoon-badge-pink py-1.5 px-3 font-mono text-xs font-black">
            <Clock className="w-4 h-4 text-pink-400" /> {formatTime(timerSeconds)}
          </div>
        </div>
      </div>

      {/* Main Grid: Question Card & Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Question Card */}
        <div className="lg:col-span-8 space-y-4">
          <div className="cartoon-card p-6 border-2 border-purple-500/30 space-y-6">
            {/* Metadata Badges */}
            <div className="flex items-center justify-between gap-2 border-b-2 border-white/10 pb-3">
              <span className="cartoon-badge cartoon-badge-purple text-xs">
                {currentQ.id || `Q-${currentIndex + 1}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBookmarkQuestion}
                  className={`p-2 rounded-2xl border-2 transition-all ${
                    bookmarks[currentIndex]
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-[#151b2e] border-purple-500/20 text-gray-400 hover:text-white'
                  }`}
                  title="Bookmark question"
                >
                  {bookmarks[currentIndex] ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleReviewMark}
                  className={`p-2 rounded-2xl border-2 text-xs font-black flex items-center gap-1 transition-all ${
                    markedForReview[currentIndex]
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : 'bg-[#151b2e] border-purple-500/20 text-gray-400 hover:text-white'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Review</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <span className="cartoon-badge cartoon-badge-cyan text-[10px]">
                {isSyntaxQuestion ? 'Syntax Challenge' : 'Multiple Choice Challenge'}
              </span>
              <h3 className="text-base font-black text-white leading-relaxed">{currentQ.question}</h3>
            </div>

            {/* Multiple Choice Options */}
            {isSyntaxQuestion ? (
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#0d1220] border-2 border-amber-500/40 space-y-2">
                  <label className="text-xs font-black text-amber-300 block">
                    Type Your Exact Syntax Answer:
                  </label>
                  <input
                    type="text"
                    value={syntaxInputs[currentIndex] || ''}
                    onChange={(e) => handleSyntaxInputChange(e.target.value)}
                    disabled={isPracticeMode && Boolean(feedback)}
                    placeholder="Enter syntax code answer here..."
                    className="w-full bg-[#151b2e] border-2 border-purple-500/30 text-emerald-300 font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {currentQ.options &&
                  currentQ.options.map((opt, oIdx) => {
                    const optText = typeof opt === 'string' ? opt : opt.text;
                    const isSelected = selectedOptIdx === oIdx;
                    let cardClass = 'bg-[#151b2e] border-purple-500/20 text-gray-200 hover:border-purple-500/50 hover:bg-[#1a223a]';

                    if (isSelected) {
                      cardClass = 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-400 text-white shadow-xl scale-[1.01]';
                    }

                    if (isPracticeMode && feedback) {
                      if (oIdx === feedback.correctAnswer) {
                        cardClass = 'bg-emerald-950/60 border-emerald-400 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20';
                      } else if (isSelected && !feedback.isCorrect) {
                        cardClass = 'bg-rose-950/60 border-rose-400 text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        disabled={isPracticeMode && Boolean(feedback)}
                        className={`w-full p-4 rounded-2xl border-2 text-left text-xs font-bold flex items-center justify-between transition-all transform active:scale-98 ${cardClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-200 text-xs font-black flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="font-medium text-xs">{optText}</span>
                        </div>

                        {isSelected && !feedback && (
                          <div className="w-3 h-3 rounded-full bg-pink-500 shadow-md shadow-pink-500 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Instant Feedback & Step Explanation */}
            {isPracticeMode && feedback && (
              <div
                className={`p-4 rounded-2xl border-2 space-y-2 animate-fade-in ${
                  feedback.isCorrect
                    ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-400 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                  {feedback.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" /> Correct Answer! (+1 Point)
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" /> Incorrect (Correct: Option {String.fromCharCode(65 + feedback.correctAnswer)})
                    </>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1">
                  <span className="text-[11px] font-black uppercase text-purple-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> Step-by-Step Solution
                  </span>
                  <p className="text-xs text-gray-200 leading-relaxed font-medium">{feedback.explanation}</p>
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="pt-4 border-t-2 border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="cartoon-btn cartoon-btn-dark py-2 px-4 text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {isPracticeMode && !feedback && selectedOptIdx !== undefined && (
                  <button
                    onClick={handleSubmitAnswer}
                    className="cartoon-btn cartoon-btn-purple py-2 px-5 text-xs font-black"
                  >
                    Check Answer
                  </button>
                )}

                {currentIndex < safeQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="cartoon-btn cartoon-btn-cyan py-2 px-5 text-xs font-black gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    className="cartoon-btn cartoon-btn-mint py-2 px-5 text-xs font-black gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Finish Quest</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Palette Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="cartoon-card p-5 border-2 border-purple-500/30 space-y-4">
            <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">Quest Navigator</h4>

            {/* Color Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500" /> Review ({Object.values(markedForReview).filter(Boolean).length})
              </div>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {safeQuestions.map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isAns = answers[idx] !== undefined;
                const isRev = Boolean(markedForReview[idx]);

                let paletteStyle = 'bg-[#151b2e] border-purple-500/20 text-gray-400 hover:border-purple-500/50';

                if (isAns) paletteStyle = 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold';
                if (isRev) paletteStyle = 'bg-purple-950/60 border-purple-400 text-purple-300 font-bold';
                if (isCurrent) paletteStyle = 'bg-pink-600 text-white font-black shadow-lg shadow-pink-500/40 border-pink-300 scale-105';

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-2xl border-2 text-xs font-mono transition-all flex items-center justify-center ${paletteStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleFinalSubmit}
              className="cartoon-btn cartoon-btn-purple w-full py-3 text-xs font-black gap-2"
            >
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>Complete & View Score</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
