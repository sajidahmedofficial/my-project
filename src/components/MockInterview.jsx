// agent-notes: { ctx: "Playful cartoon AI Mock Interview simulator with Sparky reactions, 3D buttons, bouncy score metrics & detailed diagnostic cards", deps: ["lucide-react", "./common/AIAssistantAvatar", "../utils/mockData", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-21" }
import React, { useState } from 'react';
import { 
  Award, 
  ChevronRight, 
  HelpCircle, 
  RefreshCw, 
  HelpCircle as QuestionIcon,
  MessageSquare,
  Sparkles,
  Play,
  Zap,
  CheckCircle2,
  Trophy,
  Volume2
} from 'lucide-react';
import AIAssistantAvatar from './common/AIAssistantAvatar';
import { MOCK_INTERVIEWS } from '../utils/mockData';
import { evaluateInterviewResponse } from '../utils/aiSimulator';

export default function MockInterview({ _profile, setProfile, onNavigate }) {
  const [track, setTrack] = useState(null); // 'frontend', 'backend', 'hr'
  const [step, setStep] = useState('select'); // 'select', 'interview', 'evaluating', 'report'
  const [avatarState, setAvatarState] = useState('idle');
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  
  // Results
  const [evaluatingIndex, setEvaluatingIndex] = useState(0);
  const [evaluatingText, setEvaluatingText] = useState("");
  const [report, setReport] = useState(null);

  const startInterview = (selectedTrack) => {
    setTrack(selectedTrack);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setShowHint(false);
    setAvatarState('listening');
    setStep('interview');
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) return;

    // Save answer
    const newAnswers = [...answers, {
      questionIndex: currentQuestionIndex,
      answer: currentAnswer
    }];
    setAnswers(newAnswers);
    setCurrentAnswer("");
    setShowHint(false);

    const questions = MOCK_INTERVIEWS[track];
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished all questions, start evaluation pipeline
      runEvaluation(newAnswers);
    }
  };

  const runEvaluation = (allAnswers) => {
    setStep('evaluating');
    setAvatarState('thinking');
    setEvaluatingIndex(0);
    setEvaluatingText("Evaluating Question 1...");
    
    const evaluations = [];
    const questions = MOCK_INTERVIEWS[track];

    const evaluateNext = (idx) => {
      if (idx < allAnswers.length) {
        setEvaluatingText(`Sparky is grading response ${idx + 1} of ${allAnswers.length}...`);
        
        setTimeout(() => {
          const evalResult = evaluateInterviewResponse(track, idx, allAnswers[idx].answer);
          evaluations.push({
            question: questions[idx].question,
            studentAnswer: allAnswers[idx].answer,
            modelAnswer: questions[idx].sampleAnswer,
            ...evalResult
          });
          
          setEvaluatingIndex(idx + 1);
          evaluateNext(idx + 1);
        }, 800);
      } else {
        // Compile overall report
        const totalScore = evaluations.reduce((acc, e) => acc + e.overallScore, 0);
        const avgScore = Math.round(totalScore / evaluations.length);
        
        const totalCorrect = evaluations.reduce((acc, e) => acc + e.correctness, 0);
        const avgCorrect = Math.round(totalCorrect / evaluations.length);

        const totalConfidence = evaluations.reduce((acc, e) => acc + e.confidence, 0);
        const avgConfidence = Math.round(totalConfidence / evaluations.length);

        const totalComm = evaluations.reduce((acc, e) => acc + e.communication, 0);
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
        
        // Update user readiness score on profile
        if (setProfile) {
          setProfile(prev => ({
            ...prev,
            scores: {
              ...prev?.scores,
              placementReadiness: Math.min(100, Math.round((prev?.scores?.placementReadiness || 70) * 0.4 + avgScore * 0.6))
            }
          }));
        }

        setStep('report');
      }
    };

    setTimeout(() => {
      evaluateNext(0);
    }, 400);
  };

  const questions = track ? MOCK_INTERVIEWS[track] : [];
  const currentQuestionObj = questions[currentQuestionIndex];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Header Card */}
      <div className="cartoon-card p-6 md:p-8 border-2 border-purple-500/30 relative overflow-hidden bg-gradient-to-r from-[#171d33] via-[#1c243f] to-[#1a2138]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <AIAssistantAvatar size="md" state={avatarState} onClick={() => setAvatarState('success')} />
            <div>
              <div className="cartoon-badge cartoon-badge-pink mb-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Placement Interview Room
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <Award className="w-7 h-7 text-yellow-400" />
                <span>Simulated Hiring Rounds</span>
              </h1>
              <p className="text-gray-300 text-xs mt-1 font-medium">
                Practice live technical and HR placement questions with Sparky grading correctness, confidence, and structure!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: Select Track */}
      {step === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-2">
          {/* Frontend Card */}
          <div className="cartoon-card p-6 border-2 border-purple-500/30 hover:border-purple-400/60 flex flex-col justify-between space-y-6 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 border-2 border-white/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="cartoon-badge cartoon-badge-purple text-[10px]">React & Web</div>
              <h3 className="text-base font-black text-white">Frontend Track</h3>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                Questions covering React hooks, state management, Virtual DOM reconciliation, performance optimizations, and CSS grid layouts.
              </p>
            </div>
            <button 
              onClick={() => startInterview('frontend')}
              className="cartoon-btn cartoon-btn-purple w-full py-3 text-xs font-black gap-2"
            >
              <span>Start Frontend Round</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Backend Card */}
          <div className="cartoon-card p-6 border-2 border-cyan-500/30 hover:border-cyan-400/60 flex flex-col justify-between space-y-6 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 border-2 border-white/20 group-hover:scale-110 transition-transform">
                <QuestionIcon className="w-6 h-6 text-white" />
              </div>
              <div className="cartoon-badge cartoon-badge-cyan text-[10px]">Node.js & APIs</div>
              <h3 className="text-base font-black text-white">Backend Track</h3>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                Questions covering Express middlewares, REST API contracts, indexing in SQL/NoSQL databases, authentication, and microservice patterns.
              </p>
            </div>
            <button 
              onClick={() => startInterview('backend')}
              className="cartoon-btn cartoon-btn-cyan w-full py-3 text-xs font-black gap-2"
            >
              <span>Start Backend Round</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* HR & Aptitude Card */}
          <div className="cartoon-card p-6 border-2 border-pink-500/30 hover:border-pink-400/60 flex flex-col justify-between space-y-6 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 border-2 border-white/20 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="cartoon-badge cartoon-badge-pink text-[10px]">HR & Behavioral</div>
              <h3 className="text-base font-black text-white">HR & Aptitude Track</h3>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                Behavioral questions using the STAR framework, situational leadership scenarios, and full Placement Aptitude practice arena.
              </p>
            </div>
            <div className="space-y-2">
              {onNavigate && (
                <button 
                  onClick={() => onNavigate('aptitude')}
                  className="cartoon-btn cartoon-btn-yellow w-full py-2.5 text-xs font-black gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" /> Open Aptitude Arena
                </button>
              )}
              <button 
                onClick={() => startInterview('hr')}
                className="cartoon-btn cartoon-btn-pink w-full py-2.5 text-xs font-black gap-1.5"
              >
                <span>Start HR Round</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Interviewing Questions */}
      {step === 'interview' && currentQuestionObj && (
        <div className="max-w-3xl mx-auto cartoon-card border-2 border-purple-500/30 p-6 md:p-8 space-y-6 animate-fade-in">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-white/10">
            <div className="flex items-center gap-2">
              <span className="cartoon-badge cartoon-badge-purple text-xs">
                {track.toUpperCase()} TRACK
              </span>
              <span className="text-xs font-extrabold text-white">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="w-36 bg-[#0d1220] rounded-full h-3 overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text with Sparky Avatar */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-purple-950/40 border-2 border-purple-500/30">
            <AIAssistantAvatar size="sm" state="speaking" />
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-purple-300 block">Sparky Interviewer:</span>
              <h3 className="text-sm md:text-base font-black text-white leading-relaxed">
                "{currentQuestionObj.question}"
              </h3>
            </div>
          </div>

          {/* Input response */}
          <div className="space-y-2">
            <label className="text-xs font-black text-purple-300 uppercase tracking-wider block">Your Verbal / Written Response:</label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your thorough answer in detail (minimum 2-3 sentences)..."
              rows={6}
              className="w-full px-4 py-3 bg-[#0d1220] border-2 border-purple-500/30 focus:border-purple-400 rounded-2xl text-xs text-white placeholder-gray-400 focus:outline-none resize-none leading-relaxed font-medium"
            />
          </div>

          {/* Hint expander */}
          <div className="space-y-2">
            <button 
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-black text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" /> {showHint ? "Hide Hint" : "Need a Hint? View Key Terminology"}
            </button>
            {showHint && (
              <p className="p-3.5 rounded-2xl bg-[#0d1220] border-2 border-cyan-500/30 text-xs text-cyan-200 leading-relaxed font-medium animate-fade-in">
                📌 **Recommended terminology**: {currentQuestionObj.hints}
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
              <span>{currentQuestionIndex === questions.length - 1 ? "Finish & Grade Round" : "Submit Answer"}</span>
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
              style={{ width: `${(evaluatingIndex / 5) * 100}%` }}
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
                    Your placement readiness stats have been updated on the Dashboard.
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
                        <ul className="space-y-1">
                          {item.notes.map((note, nIdx) => (
                            <li key={nIdx} className="flex items-start gap-1.5 text-xs text-gray-300 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
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
