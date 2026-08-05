// agent-notes: { ctx: "Full MCQ practice & exam engine with question navigator palette, timer & step-by-step explanations", deps: ["lucide-react", "../../services/aptitudeApi"], state: "active", last: "anti@2026-08-04" }

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
  const [markedForReview, setMarkedForReview] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [submittedFeedback, setSubmittedFeedback] = useState({});
  const [timerSeconds, setTimerSeconds] = useState((session?.limit || 20) * 60);

  const safeQuestions = Array.isArray(questions) && questions.length > 0 ? questions : [];
  const currentQ = safeQuestions[currentIndex] || {};
  const isPracticeMode = session?.mode === 'practice' || !session?.mode;

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

  const handleSubmitAnswer = async () => {
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
      <div className="glass rounded-2xl p-8 border border-gray-800 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Questions are being prepared for this topic.</h3>
        <p className="text-xs text-gray-400">Please select another topic or generate questions in Admin Console.</p>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-gray-900 border border-gray-800 text-white rounded-xl text-xs font-bold"
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
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Toolbar */}
      <div className="glass rounded-2xl p-4 border border-card-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-bold text-accent-pink block">
              {session.topicName || session.topic} ({session.mode || 'practice'} mode)
            </span>
            <h2 className="text-sm font-black text-white">
              Question {currentIndex + 1} of {safeQuestions.length}
            </h2>
          </div>
        </div>

        {/* Progress Bar & Timer */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
              <div
                className="bg-gradient-to-r from-accent-purple to-accent-pink h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / safeQuestions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-gray-300">
              {Math.round(((currentIndex + 1) / safeQuestions.length) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-800 text-accent-pink font-mono font-bold text-xs">
            <Clock className="w-4 h-4" /> {formatTime(timerSeconds)}
          </div>
        </div>
      </div>

      {/* Main Grid: Question Card & Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Question Card */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass rounded-2xl p-6 border border-gray-800 space-y-6">
            {/* Metadata Badges */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-850 pb-3">
              <span className="text-[10px] font-mono font-bold text-accent-purple bg-accent-purple/10 px-2.5 py-1 rounded-md border border-accent-purple/20">
                {currentQ.id || `Q-${currentIndex + 1}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBookmarkQuestion}
                  className={`p-1.5 rounded-lg border transition-all ${
                    bookmarks[currentIndex]
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                  title="Bookmark question"
                >
                  {bookmarks[currentIndex] ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleReviewMark}
                  className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                    markedForReview[currentIndex]
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Review</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-base font-bold text-white leading-relaxed">{currentQ.question}</h3>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options &&
                currentQ.options.map((opt, oIdx) => {
                  const optText = typeof opt === 'string' ? opt : opt.text;
                  const isSelected = selectedOptIdx === oIdx;
                  let borderStyle = 'border-gray-800 hover:border-gray-700 bg-gray-900/60';

                  if (isSelected) {
                    borderStyle = 'border-accent-purple bg-accent-purple/15 text-white shadow-lg shadow-purple-600/20';
                  }

                  if (isPracticeMode && feedback) {
                    if (oIdx === feedback.correctAnswer) {
                      borderStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
                    } else if (isSelected && !feedback.isCorrect) {
                      borderStyle = 'border-red-500 bg-red-500/20 text-red-300';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isPracticeMode && Boolean(feedback)}
                      className={`w-full p-4 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${borderStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-gray-800 text-gray-300 text-[10px] font-bold flex items-center justify-center border border-gray-700 shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{optText}</span>
                      </div>

                      {isSelected && !feedback && (
                        <div className="w-2.5 h-2.5 rounded-full bg-accent-pink shadow-md shadow-pink-500" />
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Instant Feedback & Step Explanation for Practice Mode */}
            {isPracticeMode && feedback && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-fade-in ${
                  feedback.isCorrect
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/60 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider">
                  {feedback.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Correct Answer (+1 Point)
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" /> Incorrect (Correct Option: {String.fromCharCode(65 + feedback.correctAnswer)})
                    </>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-accent-purple" /> Step-by-Step Explanation & Solution
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">{feedback.explanation}</p>
                  {feedback.solution && (
                    <div className="mt-2 p-2.5 rounded-lg bg-black/40 text-[11px] font-mono text-purple-300 border border-purple-500/20">
                      {feedback.solution}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="pt-4 border-t border-gray-850 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {isPracticeMode && !feedback && selectedOptIdx !== undefined && (
                  <button
                    onClick={handleSubmitAnswer}
                    className="px-5 py-2 rounded-xl bg-accent-purple hover:bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
                  >
                    Submit Answer
                  </button>
                )}

                {currentIndex < safeQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Submit Complete Test
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Palette Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass rounded-2xl p-5 border border-gray-800 space-y-4">
            <h4 className="text-xs font-extrabold uppercase text-gray-300 tracking-wider">Question Palette</h4>

            {/* Color Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" /> Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500/80" /> Marked Review ({Object.values(markedForReview).filter(Boolean).length})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700" /> Unanswered ({safeQuestions.length - answeredCount})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-accent-pink" /> Current (# {currentIndex + 1})
              </div>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
              {safeQuestions.map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isAns = answers[idx] !== undefined;
                const isRev = Boolean(markedForReview[idx]);

                let paletteStyle = 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700';

                if (isAns) paletteStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                if (isRev) paletteStyle = 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold';
                if (isCurrent) paletteStyle = 'bg-accent-pink text-white font-extrabold shadow-md shadow-pink-500/40 border-accent-pink';

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl border text-xs font-mono transition-all flex items-center justify-center ${paletteStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleFinalSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
            >
              Finish & View Result
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
