// agent-notes: { ctx: "Clean minimal SaaS AI Mock Interview simulator with dynamic backend AI evaluation and offline mock fallback", deps: ["lucide-react", "./common/AIAssistantAvatar", "../utils/mockData", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-27" }
import React, { useState } from 'react';
import { 
  Briefcase, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import AIAssistantAvatar from './common/AIAssistantAvatar';
import { MOCK_INTERVIEWS } from '../utils/mockData';
import { evaluateInterviewResponse } from '../utils/aiSimulator';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function MockInterview({ onNavigate, onCompleteRound }) {
  // Step: 'select' | 'interview' | 'evaluating' | 'report'
  const [step, setStep] = useState('select');
  const [track, setTrack] = useState(null);
  const [questionsList, setQuestionsList] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  
  // Avatar state
  const [avatarState, setAvatarState] = useState('idle');
  const [evaluatingText, setEvaluatingText] = useState("");
  const [evaluatingIndex, setEvaluatingIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleStartTrack = async (selectedTrack) => {
    setTrack(selectedTrack);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setReport(null);
    setLoadingQuestions(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTrack,
          difficulty: 'medium',
          questionType: 'interview',
          numberOfQuestions: 5
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestionsList(data.questions);
          setStep('interview');
          setAvatarState('speaking');
          return;
        }
      }
      throw new Error("Backend questions empty");
    } catch (err) {
      console.warn("Using curated track questions fallback:", err.message);
      setQuestionsList(MOCK_INTERVIEWS[selectedTrack] || []);
      setStep('interview');
      setAvatarState('speaking');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) return;

    const newAnswers = [
      ...answers,
      {
        questionIndex: currentQuestionIndex,
        answer: currentAnswer.trim()
      }
    ];

    setAnswers(newAnswers);
    setCurrentAnswer("");
    setShowHint(false);

    if (currentQuestionIndex < questionsList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      runEvaluation(newAnswers);
    }
  };

  const runEvaluation = async (allAnswers) => {
    setStep('evaluating');
    setAvatarState('thinking');
    setEvaluatingIndex(0);
    setEvaluatingText("Evaluating Question 1...");
    
    const evaluations = [];

    for (let idx = 0; idx < allAnswers.length; idx++) {
      setEvaluatingIndex(idx);
      setEvaluatingText(`Evaluating response ${idx + 1} of ${allAnswers.length}...`);

      const q = questionsList[idx];
      const studentAns = allAnswers[idx].answer;
      const modelAns = q.sampleAnswer || q.explanation || "Clean technical explanation.";

      let evalItem = null;

      try {
        const res = await fetch(`${API_BASE_URL}/ai/evaluate-interview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q.question,
            studentAnswer: studentAns,
            modelAnswer: modelAns
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.overallScore === 'number') {
            evalItem = {
              question: q.question,
              studentAnswer: studentAns,
              modelAnswer: modelAns,
              ...data
            };
          }
        }
      } catch (err) {
        console.warn(`Backend evaluation fallback for Q${idx + 1}:`, err.message);
      }

      if (!evalItem) {
        const fallbackResult = evaluateInterviewResponse(track, idx, studentAns);
        evalItem = {
          question: q.question,
          studentAnswer: studentAns,
          modelAnswer: modelAns,
          ...fallbackResult
        };
      }

      evaluations.push(evalItem);
      await new Promise(r => setTimeout(r, 300));
    }

    const totalScore = evaluations.reduce((acc, e) => acc + (e.overallScore || 75), 0);
    const avgScore = Math.round(totalScore / evaluations.length);
    
    const totalCorrect = evaluations.reduce((acc, e) => acc + (e.correctness || 75), 0);
    const avgCorrect = Math.round(totalCorrect / evaluations.length);

    const totalConfidence = evaluations.reduce((acc, e) => acc + (e.confidence || 80), 0);
    const avgConfidence = Math.round(totalConfidence / evaluations.length);

    const totalComm = evaluations.reduce((acc, e) => acc + (e.communication || 80), 0);
    const avgComm = Math.round(totalComm / evaluations.length);

    const compiledReport = {
      overallScore: avgScore,
      correctness: avgCorrect,
      confidence: avgConfidence,
      communication: avgComm,
      evaluations
    };

    setReport(compiledReport);
    setAvatarState('success');
    setStep('report');

    if (onCompleteRound) {
      onCompleteRound({
        track,
        score: avgScore,
        completedAt: new Date().toISOString()
      });
    }
  };

  const currentQ = questionsList[currentQuestionIndex];

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      {/* STEP 1: Select Track */}
      {step === 'select' && (
        <div className="space-y-6">
          <div className="saas-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="saas-badge text-[11px]">Mock Simulation</span>
              <h2 className="text-xl font-bold text-slate-900">Technical Interview Practice</h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Simulate real technical interview rounds with automated evaluation for conceptual correctness and clarity.
              </p>
            </div>
            <AIAssistantAvatar size="lg" state="idle" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Frontend Track */}
            <div className="saas-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="saas-badge text-[10px]">5 Questions</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Frontend Specialist</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  React lifecycle, virtual DOM reconciliation, state architecture, and rendering performance.
                </p>
              </div>
              <button
                onClick={() => handleStartTrack('frontend')}
                disabled={loadingQuestions}
                className="saas-btn-primary w-full py-2 text-xs font-medium gap-1.5 disabled:opacity-50"
              >
                {loadingQuestions ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Start Frontend Round</span>}
              </button>
            </div>

            {/* Backend Track */}
            <div className="saas-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="saas-badge text-[10px]">5 Questions</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Backend & Distributed Systems</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Node.js event loop, database indexing, caching strategies, JWT security & microservices.
                </p>
              </div>
              <button
                onClick={() => handleStartTrack('backend')}
                disabled={loadingQuestions}
                className="saas-btn-primary w-full py-2 text-xs font-medium gap-1.5 disabled:opacity-50"
              >
                {loadingQuestions ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Start Backend Round</span>}
              </button>
            </div>

            {/* Full Stack Track */}
            <div className="saas-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="saas-badge text-[10px]">5 Questions</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Full Stack Engineering</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  End-to-end web architecture, API integration, auth flows, Docker deployments & scaling trade-offs.
                </p>
              </div>
              <button
                onClick={() => handleStartTrack('fullstack')}
                disabled={loadingQuestions}
                className="saas-btn-primary w-full py-2 text-xs font-medium gap-1.5 disabled:opacity-50"
              >
                {loadingQuestions ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Start Full Stack Round</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Live Interview Loop */}
      {step === 'interview' && currentQ && (
        <div className="saas-card p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
          {/* Header Progress */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Track: {track}
              </span>
              <h3 className="text-sm font-semibold text-slate-900">
                Question {currentQuestionIndex + 1} of {questionsList.length}
              </h3>
            </div>

            <span className="saas-badge text-xs font-medium">
              {Math.round(((currentQuestionIndex + 1) / questionsList.length) * 100)}% Complete
            </span>
          </div>

          {/* Question Text */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
              Interview Prompt
            </span>
            <p className="text-sm font-medium text-slate-900 leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Student Answer Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                Your Answer:
              </label>
              {currentQ.keyConcepts && currentQ.keyConcepts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-[11px] text-indigo-600 hover:underline font-medium"
                >
                  {showHint ? "Hide Key Topics" : "💡 Show Key Topics"}
                </button>
              )}
            </div>

            {showHint && currentQ.keyConcepts && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs text-indigo-900 flex items-center gap-1.5 flex-wrap">
                <span className="font-medium">Topics to include:</span>
                {currentQ.keyConcepts.map((k, i) => (
                  <span key={i} className="saas-badge saas-badge-indigo text-[10px]">
                    {k}
                  </span>
                ))}
              </div>
            )}

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              rows={5}
              placeholder="Type your explanation clearly..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
            {currentAnswer.trim().length > 0 && (
              <p className="text-[11px] text-slate-400 text-right">
                {currentAnswer.trim().split(/\s+/).length} words
              </p>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={handleNext}
              disabled={!currentAnswer.trim()}
              className="saas-btn-primary py-2 px-4 text-xs font-medium gap-1.5 disabled:opacity-40"
            >
              <span>{currentQuestionIndex === questionsList.length - 1 ? "Complete & Grade Round" : "Next Question"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Evaluating Loop */}
      {step === 'evaluating' && (
        <div className="saas-card p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900">{evaluatingText}</h4>
            <p className="text-xs text-slate-500">Grading response accuracy and technical depth...</p>
          </div>
        </div>
      )}

      {/* STEP 4: Results Report */}
      {step === 'report' && report && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Main Score Metrics Card */}
          <div className="saas-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-bold">
                  <span className="text-lg leading-none">{report.overallScore}%</span>
                  <span className="text-[8px] font-medium uppercase text-slate-400 mt-0.5">Score</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Assessment Report</h3>
                  <p className="text-xs text-slate-500">
                    Evaluation completed for {track} round
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep('select')}
                className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Start New Round
              </button>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Correctness</span>
                <div className="text-xl font-bold text-slate-900">{report.correctness}%</div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Confidence</span>
                <div className="text-xl font-bold text-slate-900">{report.confidence}%</div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Clarity</span>
                <div className="text-xl font-bold text-slate-900">{report.communication}%</div>
              </div>
            </div>
          </div>

          {/* Question-by-Question breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Question Diagnostics</h3>
            <div className="space-y-3">
              {report.evaluations.map((item, idx) => (
                <div key={idx} className="saas-card p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-900">Question {idx + 1}</span>
                    <span className={`saas-badge text-[10px] ${
                      item.overallScore >= 75 
                        ? 'saas-badge-success' 
                        : item.overallScore >= 55 
                        ? 'saas-badge-warning' 
                        : 'saas-badge-danger'
                    }`}>
                      Score: {item.overallScore}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">Question</span>
                      <p className="text-slate-900 font-medium leading-relaxed">{item.question}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">Your Response</span>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-relaxed italic">
                        "{item.studentAnswer}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Feedback</span>
                      <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1.5">
                        <p className="text-slate-800 font-medium">{item.feedback}</p>
                        {item.notes && item.notes.length > 0 && (
                          <ul className="space-y-0.5 pt-1">
                            {item.notes.map((note, nIdx) => (
                              <li key={nIdx} className="flex items-start gap-1 text-slate-600 text-[11px]">
                                <span>•</span>
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
