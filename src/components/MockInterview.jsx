import React from 'react';
import { 
  Award, 
  ChevronRight, 
  HelpCircle, 
  RefreshCw, 
  HelpCircle as QuestionIcon,
  MessageSquare,
  Sparkles,
  Play
} from 'lucide-react';
import { MOCK_INTERVIEWS } from '../utils/mockData';
import { evaluateInterviewResponse } from '../utils/aiSimulator';

export default function MockInterview({ _profile, setProfile, onNavigate }) {
  const [track, setTrack] = React.useState(null); // 'frontend', 'backend', 'hr'
  const [step, setStep] = React.useState('select'); // 'select', 'interview', 'evaluating', 'report'
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState([]);
  const [currentAnswer, setCurrentAnswer] = React.useState("");
  const [showHint, setShowHint] = React.useState(false);
  
  // Results
  const [evaluatingIndex, setEvaluatingIndex] = React.useState(0);
  const [evaluatingText, setEvaluatingText] = React.useState("");
  const [report, setReport] = React.useState(null);

  const startInterview = (selectedTrack) => {
    setTrack(selectedTrack);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setShowHint(false);
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
    setEvaluatingIndex(0);
    setEvaluatingText("Evaluating Question 1...");
    
    // Simulate AI grading each response sequentially for UI immersion
    const evaluations = [];
    const questions = MOCK_INTERVIEWS[track];

    const evaluateNext = (idx) => {
      if (idx < allAnswers.length) {
        setEvaluatingText(`AI Grading response for Question ${idx + 1}...`);
        
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
        
        // Update user readiness score on profile
        setProfile(prev => ({
          ...prev,
          scores: {
            ...prev.scores,
            placementReadiness: Math.min(100, Math.round(prev.scores.placementReadiness * 0.4 + avgScore * 0.6))
          }
        }));

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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-purple" /> AI Placement Mock Interview
        </h2>
        <p className="text-xs text-gray-400">Simulate mock coding and behavioral placement questions. AI evaluates correctness, confidence, and vocabulary</p>
      </div>

      {/* STEP 1: Select Track */}
      {step === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6">
          {/* Frontend Card */}
          <div className="glass rounded-2xl p-6 border border-gray-800 hover:border-accent-purple/30 flex flex-col justify-between space-y-6 transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Frontend Track</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Questions covering React state/props, Virtual DOM diffing, lifecycle Hooks, performance, and CSS layout grids.</p>
            </div>
            <button 
              onClick={() => startInterview('frontend')}
              className="w-full py-2.5 rounded-xl bg-gray-800 group-hover:bg-accent-purple text-gray-300 group-hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1"
            >
              Start Session <Play className="w-3 h-3 ml-0.5 fill-current" />
            </button>
          </div>

          {/* Backend Card */}
          <div className="glass rounded-2xl p-6 border border-gray-800 hover:border-accent-blue/30 flex flex-col justify-between space-y-6 transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
                <QuestionIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Backend Track</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Questions covering Express middlewares, API structures, REST principles, SQL vs NoSQL indexes, and security safeguards.</p>
            </div>
            <button 
              onClick={() => startInterview('backend')}
              className="w-full py-2.5 rounded-xl bg-gray-800 group-hover:bg-accent-blue text-gray-300 group-hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1"
            >
              Start Session <Play className="w-3 h-3 ml-0.5 fill-current" />
            </button>
          </div>

          {/* HR & Aptitude Card */}
          <div className="glass rounded-2xl p-6 border border-gray-800 hover:border-accent-pink/30 flex flex-col justify-between space-y-6 transition-all group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center text-accent-pink">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">HR & Aptitude Track</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Behavioral questions (STAR method) & full Placement Aptitude MCQ Platform with 87 topics (Quant, Logical, Verbal, DI).</p>
            </div>
            <div className="space-y-2">
              {onNavigate && (
                <button 
                  onClick={() => onNavigate('aptitude')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" /> Open Aptitude Platform (87 Topics)
                </button>
              )}
              <button 
                onClick={() => startInterview('hr')}
                className="w-full py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-accent-pink text-gray-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1"
              >
                HR Interview Session <Play className="w-3 h-3 ml-0.5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Interviewing Questions */}
      {step === 'interview' && currentQuestionObj && (
        <div className="max-w-2xl mx-auto glass rounded-2xl border border-gray-850 p-6 space-y-5">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-850">
            <span className="text-[10px] uppercase font-bold text-accent-purple tracking-wider">
              {track.toUpperCase()} TRACK
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Question</span>
            <h3 className="text-sm font-semibold text-white leading-relaxed">
              {currentQuestionObj.question}
            </h3>
          </div>

          {/* Input response */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Your Answer</span>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your explanation in detail (minimum 2-3 sentences)..."
              rows={6}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 focus:border-accent-purple rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Hint expander */}
          <div className="space-y-1">
            <button 
              onClick={() => setShowHint(!showHint)}
              className="text-[10px] font-bold text-accent-purple hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> {showHint ? "Hide Hint" : "Show Hint & Terminology"}
            </button>
            {showHint && (
              <p className="p-3 rounded-lg bg-white/5 border border-gray-800 text-[11px] text-gray-400 leading-relaxed animate-fade-in mt-1">
                📌 **Recommended topics/words**: {currentQuestionObj.hints}
              </p>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-3">
            <button
              onClick={handleNext}
              disabled={!currentAnswer.trim()}
              className="px-5 py-2.5 rounded-xl bg-accent-purple text-white font-semibold text-xs hover:bg-opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 shadow-lg shadow-accent-purple/10"
            >
              {currentQuestionIndex === questions.length - 1 ? "Finish & Submit" : "Submit Answer"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Evaluating Loop */}
      {step === 'evaluating' && (
        <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px] max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-white">{evaluatingText}</h4>
            <p className="text-xs text-gray-500">Grading semantics, counting hesitation triggers, and analyzing vocabulary</p>
          </div>
          <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-accent-purple transition-all duration-300"
              style={{ width: `${(evaluatingIndex / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 4: Results Report */}
      {step === 'report' && report && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Main Score Metrics Card */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-850 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent-purple/10 border-2 border-accent-purple flex flex-col items-center justify-center shadow-lg shadow-accent-purple/10 text-accent-purple">
                  <span className="text-xl font-bold leading-none">{report.overallScore}%</span>
                  <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Score</span>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-white">Interview Assessment Completed</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your placement readiness stats have been updated on the Dashboard.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep('select')}
                className="px-4 py-2 rounded-lg bg-gray-850 hover:bg-gray-800 border border-gray-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 self-start md:self-center"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restart Interview
              </button>
            </div>

            {/* Radial Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Score block 1 */}
              <div className="p-4 rounded-xl border border-gray-850 bg-white/5 space-y-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Technical Correctness</span>
                <div className="text-xl font-extrabold text-white">{report.correctness}%</div>
                <p className="text-[10px] text-gray-500">Vocabulary accuracy score</p>
              </div>

              {/* Score block 2 */}
              <div className="p-4 rounded-xl border border-gray-850 bg-white/5 space-y-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Mock Confidence</span>
                <div className="text-xl font-extrabold text-white">{report.confidence}%</div>
                <p className="text-[10px] text-gray-500">Assertiveness keyword analysis</p>
              </div>

              {/* Score block 3 */}
              <div className="p-4 rounded-xl border border-gray-850 bg-white/5 space-y-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Communication Clarity</span>
                <div className="text-xl font-extrabold text-white">{report.communication}%</div>
                <p className="text-[10px] text-gray-500">Length & structure density</p>
              </div>
            </div>
          </div>

          {/* Question-by-Question breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Detail Response Diagnostics</h3>
            <div className="space-y-4">
              {report.evaluations.map((item, idx) => (
                <div key={idx} className="glass rounded-2xl p-5 border border-gray-850 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-850">
                    <span className="text-xs font-semibold text-white">Question {idx + 1}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.overallScore >= 75 ? 'bg-emerald-500/10 text-emerald-400' : item.overallScore >= 55 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                      Score: {item.overallScore}%
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Q text */}
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Question Text</span>
                      <p className="text-white leading-relaxed font-semibold">{item.question}</p>
                    </div>

                    {/* Student response */}
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">Your Response</span>
                      <p className="text-gray-300 bg-gray-900/60 p-3 rounded-lg border border-gray-800 leading-relaxed italic">
                        "{item.studentAnswer}"
                      </p>
                    </div>

                    {/* AI Feedback */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">AI Evaluation Feedback</span>
                      <div className="bg-accent-purple/5 p-3.5 rounded-lg border border-accent-purple/20 space-y-2">
                        <p className="text-accent-pink leading-relaxed font-semibold">{item.feedback}</p>
                        <ul className="space-y-1">
                          {item.notes.map((note, nIdx) => (
                            <li key={nIdx} className="flex items-start gap-1.5 text-[11px] text-gray-300">
                              <span className="w-1 h-1 rounded-full bg-accent-purple mt-2 shrink-0" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Model Answer comparison */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">Sample Model Response</span>
                      <p className="text-gray-300 bg-gray-900/40 p-3.5 rounded-lg border border-gray-850 leading-relaxed font-mono leading-relaxed">
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
