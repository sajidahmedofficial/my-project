// agent-notes: { ctx: "Playful cartoon AI Mock Interview simulator with backend AI evaluation as primary and offline mock fallback", deps: ["lucide-react", "./common/AIAssistantAvatar", "../utils/mockData", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-25" }
import React, { useState } from 'react';
import { 
  Briefcase, 
  ChevronRight, 
  RefreshCw, 
  Sparkles,
  Trophy
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
      // Primary: Request dynamic questions from backend AI
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
      console.warn("Backend question generation notice (using curated track questions):", err.message);
      // Fallback: Use curated mock interview questions
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
      // Finished all questions, start evaluation pipeline
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
      setEvaluatingText(`Sparky is grading response ${idx + 1} of ${allAnswers.length}...`);

      const q = questionsList[idx];
      const studentAns = allAnswers[idx].answer;
      const modelAns = q.sampleAnswer || q.explanation || "Clean, modular technical architecture with robust error handling.";

      let evalItem = null;

      try {
        // Primary: Evaluate via backend AI service
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
        console.warn(`Backend evaluation error for Q${idx + 1}, using local simulator:`, err.message);
      }

      if (!evalItem) {
        // Fallback: Local offline simulator
        const fallbackResult = evaluateInterviewResponse(track, idx, studentAns);
        evalItem = {
          question: q.question,
          studentAnswer: studentAns,
          modelAnswer: modelAns,
          ...fallbackResult
        };
      }

      evaluations.push(evalItem);
      await new Promise(r => setTimeout(r, 400));
    }

    // Compile overall report
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
    <div className="space-y-6 animate-fade-in text-white pb-12 select-none">
      {/* STEP 1: Select Track */}
      {step === 'select' && (
        <div className="space-y-6">
          <div className="cartoon-card p-6 md:p-8 border-2 border-purple-500/30 bg-gradient-to-r from-[#171d33] via-[#1c243f] to-[#1a2138] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="cartoon-badge cartoon-badge-purple">
                <Sparkles className="w-3.5 h-3.5" /> AI Placement Mock Room
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Live AI Technical Interview Simulator</h2>
              <p className="text-xs text-gray-300 max-w-xl font-medium">
                Practice real technical interview questions with live automated scoring for correctness, confidence, and clarity.
              </p>
            </div>
            <AIAssistantAvatar size="lg" state="idle" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Frontend Track */}
            <div className="cartoon-card p-6 border-2 border-purple-500/30 hover:border-purple-400 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-2xl">
                    <Briefcase className="w-6 h-6 text-purple-300" />
                  </div>
                  <span className="cartoon-badge cartoon-badge-pink text-[10px]">5 Questions</span>
                </div>
                <h3 className="text-lg font-black text-white">Frontend Specialist</h3>
                <p className="text-xs text-gray-300 font-medium">
                  React lifecycle, virtual DOM reconciliation, state patterns, CSS architecture & browser rendering performance.
                </p>
              </div>
              <button
                onClick={() => handleStartTrack('frontend')}
                disabled={loadingQuestions}
                className="cartoon-btn cartoon-btn-purple w-full py-3 text-xs font-black gap-2 disabled:opacity-50"
              >
                {loadingQuestions ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Start Frontend Round ›</span>}
              </button>
            </div>

            {/* Backend Track */}
            <div className="cartoon-card p-6 border-2 border-purple-500/30 hover:border-cyan-400 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl">
                    <Briefcase className="w-6 h-6 text-cyan-300" />
                  </div>
                  <span className="cartoon-badge cartoon-badge-cyan text-[10px]">5 Questions</span>
                </div>
                <h3 className="text-lg font-black text-white">Backend & Distributed Systems</h3>
                <p className="text-xs text-gray-300 font-medium">
                  Node.js event loop, database indexing, REST vs gRPC, caching strategies, JWT security & microservices.
                </p>
              </div>
              <button
                onClick={() => handleStartTrack('backend')}
                disabled={loadingQuestions}
                className="cartoon-btn cartoon-btn-mint w-full py-3 text-xs font-black gap-2 disabled:opacity-50"
              >
                {loadingQuestions ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Start Backend Round ›</span>}
              </button>
            </div>

            {/* Full Stack Track */}
            <div className="cartoon-card p-6 border-2 border-purple-500/30 hover:border-yellow-400 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl">
                    <Briefcase className="w-6 h-6 text-yellow-300" />
                  </div>
                  <span className="cartoon-badge cartoon-badge-yellow text-[10px]">5 Questions</span>
                </div>
                <h3 className="text-lg font-black text-white">Full Stack Engineering</h3>
                <p className="text-xs text-gray-300 font-medium">
                  End-to-end web architecture, API integration, auth flows, Docker deployments & system scaling trade-offs.
                </p>
              </div>
              <button
                onClick={() => handleStartTrack('fullstack')}
                disabled={loadingQuestions}
                className="cartoon-btn cartoon-btn-yellow w-full py-3 text-xs font-black gap-2 disabled:opacity-50"
              >
                {loadingQuestions ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Start Full Stack Round ›</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Live Interview Loop */}
      {step === 'interview' && currentQ && (
        <div className="cartoon-card p-6 md:p-8 space-y-6 max-w-3xl mx-auto border-2 border-purple-500/30">
          {/* Header Progress */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-white/10">
            <div className="flex items-center gap-3">
              <AIAssistantAvatar size="sm" state={avatarState} />
              <div>
                <span className="text-[10px] uppercase font-black text-purple-400 block tracking-wider">
                  Technical Track: {track?.toUpperCase()}
                </span>
                <h3 className="text-sm font-black text-white">
                  Question {currentQuestionIndex + 1} of {questionsList.length}
                </h3>
              </div>
            </div>

            <span className="cartoon-badge cartoon-badge-purple text-xs">
              {Math.round(((currentQuestionIndex + 1) / questionsList.length) * 100)}% Complete
            </span>
          </div>

          {/* Question Text */}
          <div className="p-5 rounded-2xl bg-[#0d1220] border-2 border-purple-500/25 space-y-2">
            <span className="text-[10px] uppercase font-black text-pink-400 tracking-wider block">
              Interviewer Prompt
            </span>
            <p className="text-sm md:text-base font-bold text-white leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Student Answer Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-300">
                Your Answer (Explain concepts, trade-offs, and examples clearly):
              </label>
              {currentQ.keyConcepts && currentQ.keyConcepts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-[10px] font-bold text-purple-400 hover:underline"
                >
                  {showHint ? "Hide Key Concepts" : "💡 View Target Key Concepts"}
                </button>
              )}
            </div>

            {showHint && currentQ.keyConcepts && (
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-center gap-2 flex-wrap animate-fade-in">
                <span className="font-bold">Key Topics to Mention:</span>
                {currentQ.keyConcepts.map((k, i) => (
                  <span key={i} className="cartoon-badge cartoon-badge-purple text-[10px]">
                    {k}
                  </span>
                ))}
              </div>
            )}

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              rows={5}
              placeholder="Type your structured explanation here (e.g. 'In React, the virtual DOM is an in-memory representation...')"
              className="w-full px-4 py-3 bg-[#0d1220] border-2 border-purple-500/30 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-medium resize-none"
            />
            {currentAnswer.trim().length > 0 && (
              <p className="text-[10px] text-gray-400 text-right">
                {currentAnswer.trim().split(/\s+/).length} words entered
              </p>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4 border-t-2 border-white/10">
            <button
              onClick={handleNext}
              disabled={!currentAnswer.trim()}
              className="cartoon-btn cartoon-btn-purple py-3 px-6 text-xs font-black gap-2 disabled:opacity-40"
            >
              <span>{currentQuestionIndex === questionsList.length - 1 ? "Finish & Grade Round" : "Submit Answer"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Evaluating Loop */}
      {step === 'evaluating' && (
        <div className="cartoon-card p-12 text-center flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto border-2 border-purple-500/40">
          <AIAssistantAvatar size="lg" state="thinking" />
          <div className="space-y-2">
            <h4 className="text-base font-black text-white">{evaluatingText}</h4>
            <p className="text-xs text-gray-300 font-medium">Grading vocabulary density, structure, and technical correctness...</p>
          </div>
          <div className="w-64 h-3 bg-[#0d1220] rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${((evaluatingIndex + 1) / Math.max(1, questionsList.length)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 4: Results Report */}
      {step === 'report' && report && (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
          {/* Main Score Metrics Card */}
          <div className="cartoon-card p-6 md:p-8 space-y-6 border-2 border-purple-500/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b-2 border-white/10 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 border-2 border-white/20 flex flex-col items-center justify-center shadow-lg text-white font-black">
                  <span className="text-xl leading-none">{report.overallScore}%</span>
                  <span className="text-[8px] font-bold uppercase tracking-wider mt-1">Score</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>Round Assessment Completed!</span>
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </h3>
                  <p className="text-xs text-gray-300 font-medium mt-0.5">
                    Your placement readiness stats have been evaluated by Sparky.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep('select')}
                className="cartoon-btn cartoon-btn-dark py-2.5 px-4 text-xs font-bold gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restart Round
              </button>
            </div>

            {/* Radial Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border-2 border-purple-500/30 bg-[#0d1220] space-y-1 text-center">
                <span className="text-[10px] uppercase font-black text-purple-400 block">Technical Correctness</span>
                <div className="text-2xl font-black text-white">{report.correctness}%</div>
                <p className="text-[10px] text-gray-400 font-medium">Vocabulary accuracy score</p>
              </div>

              <div className="p-4 rounded-2xl border-2 border-pink-500/30 bg-[#0d1220] space-y-1 text-center">
                <span className="text-[10px] uppercase font-black text-pink-400 block">Mock Confidence</span>
                <div className="text-2xl font-black text-white">{report.confidence}%</div>
                <p className="text-[10px] text-gray-400 font-medium">Assertiveness analysis</p>
              </div>

              <div className="p-4 rounded-2xl border-2 border-cyan-500/30 bg-[#0d1220] space-y-1 text-center">
                <span className="text-[10px] uppercase font-black text-cyan-400 block">Communication Clarity</span>
                <div className="text-2xl font-black text-white">{report.communication}%</div>
                <p className="text-[10px] text-gray-400 font-medium">Length & structure density</p>
              </div>
            </div>
          </div>

          {/* Question-by-Question breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Detail Response Diagnostics</span>
            </h3>
            <div className="space-y-4">
              {report.evaluations.map((item, idx) => (
                <div key={idx} className="cartoon-card p-5 border-2 border-purple-500/25 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-white/10">
                    <span className="text-xs font-black text-white">Question {idx + 1}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                      item.overallScore >= 75 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : item.overallScore >= 55 
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      Score: {item.overallScore}%
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-black text-purple-300 block mb-0.5">Question Text</span>
                      <p className="text-white leading-relaxed font-bold">{item.question}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-black text-cyan-300 block mb-0.5">Your Response</span>
                      <p className="text-gray-200 bg-[#0d1220] p-3 rounded-2xl border border-purple-500/20 leading-relaxed italic font-medium">
                        "{item.studentAnswer}"
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-black text-pink-300 block">Sparky Evaluation Feedback</span>
                      <div className="bg-purple-950/40 p-4 rounded-2xl border-2 border-purple-500/30 space-y-2">
                        <p className="text-pink-300 leading-relaxed font-bold">{item.feedback}</p>
                        {item.notes && item.notes.length > 0 && (
                          <ul className="space-y-1">
                            {item.notes.map((note, nIdx) => (
                              <li key={nIdx} className="flex items-start gap-1.5 text-xs text-gray-300 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-emerald-300 block">Sample Model Response</span>
                      <p className="text-gray-300 bg-[#0d1220] p-3 rounded-2xl border border-white/10 leading-relaxed font-mono text-[11px]">
                        {item.modelAnswer}
                      </p>
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
