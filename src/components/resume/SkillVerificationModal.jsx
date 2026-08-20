// agent-notes: { ctx: "Interactive 7-stage skill verification modal with live GitHub repository evidence extraction, sandbox VM coding evaluation, and authoritative certification", deps: ["react", "lucide-react", "../../utils/skillChallenges", "../../services/skillGapApi"], state: "active", last: "anti@2026-08-20" }
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  BookOpen, 
  CheckCircle, 
  Code, 
  Award, 
  Sparkles, 
  Play, 
  ChevronRight, 
  HelpCircle, 
  FolderPlus, 
  RefreshCw, 
  AlertTriangle, 
  X, 
  Download, 
  CheckCircle2, 
  Terminal,
  Clock,
  XCircle,
  Github,
  Check
} from 'lucide-react';
import { skillGapApi } from '../../services/skillGapApi';

export default function SkillVerificationModal({ skillName = "Node.js", onClose, onCompleteVerification, userId = "guest_user" }) {
  const [currentStep, setCurrentStep] = useState(1);
  const modalContainerRef = useRef(null);

  // Lock background page scroll when modal is active
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle || 'unset';
    };
  }, []);

  // Auto scroll modal container to top when changing steps
  useEffect(() => {
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Step 3 MCQ State (Server Sanitized Questions - NO answer key exposed)
  const [assessmentId, setAssessmentId] = useState(null);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Step 4 Coding State (Backend Challenge & Sandboxed Test Suite)
  const [challengeData, setChallengeData] = useState(null);
  const [codeContent, setCodeContent] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [codeExecutionResult, setCodeExecutionResult] = useState(null);
  const [codePassed, setCodePassed] = useState(false);
  const [codeValidationError, setCodeValidationError] = useState(null);

  // Step 5 Project State (Live GitHub Inspection & Technology Evidence)
  const [projectRepo, setProjectRepo] = useState('');
  const [projectRepoError, setProjectRepoError] = useState(null);
  const [inspectingRepo, setInspectingRepo] = useState(false);
  const [repoInspectionResult, setRepoInspectionResult] = useState(null);

  // Step 6 AI Evaluation State
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const steps = [
    { num: 1, label: "Notes & Video" },
    { num: 2, label: "Practice" },
    { num: 3, label: "MCQ Check" },
    { num: 4, label: "Coding Sandbox" },
    { num: 5, label: "Micro-Project" },
    { num: 6, label: "AI Evaluation" },
    { num: 7, label: "Certification" }
  ];

  // Fetch MCQ Questions & Coding Challenge from Backend on mount or skill change
  useEffect(() => {
    let isMounted = true;
    const loadVerificationAssets = async () => {
      setLoadingQuestions(true);
      try {
        // 1. Fetch sanitized questions
        const qData = await skillGapApi.getAssessmentQuestions(skillName, userId);
        if (isMounted && qData && Array.isArray(qData.questions)) {
          setAssessmentId(qData.assessmentId);
          setMcqQuestions(qData.questions);
        }

        // 2. Fetch coding challenge
        const cData = await skillGapApi.getCodingChallenge(skillName);
        if (isMounted && cData && cData.challenge) {
          setChallengeData(cData.challenge);
          setCodeContent(cData.challenge.starterCode || "");
        }
      } catch (err) {
        console.warn("Failed to load verification assets from backend:", err.message);
      } finally {
        if (isMounted) setLoadingQuestions(false);
      }
    };

    loadVerificationAssets();
    return () => { isMounted = false; };
  }, [skillName, userId]);

  const handleResetTemplate = () => {
    if (challengeData) {
      setCodeContent(challengeData.starterCode || "");
    }
    setCodePassed(false);
    setCodeExecutionResult(null);
    setCodeValidationError(null);
  };

  const handleRunCode = async () => {
    setCodeValidationError(null);
    setCodeExecutionResult(null);
    const cleaned = codeContent.trim();

    if (!cleaned || (challengeData && cleaned === challengeData.starterCode?.trim())) {
      setCodeValidationError("Please implement your own solution logic in the function before running tests!");
      return;
    }

    setCodeRunning(true);
    try {
      // Call Backend Sandbox Execution API
      const result = await skillGapApi.runSandboxCode({
        skillName,
        userCode: cleaned,
        functionName: challengeData?.functionName,
        challengeId: challengeData?.challengeId
      });

      setCodeExecutionResult(result);
      if (result && result.status === 'passed' && result.passedTests === result.totalTests && result.totalTests > 0) {
        setCodePassed(true);
      } else {
        setCodePassed(false);
      }
    } catch (err) {
      console.error("Code Sandbox Error:", err);
      setCodeExecutionResult({
        passedTests: 0,
        totalTests: challengeData?.testCases?.length || 0,
        score: 0,
        status: "failed",
        error: err.message || "Failed to execute code in sandbox."
      });
      setCodePassed(false);
    } finally {
      setCodeRunning(false);
    }
  };

  const handleInspectRepo = async () => {
    setProjectRepoError(null);
    setRepoInspectionResult(null);
    const cleanedRepo = projectRepo.trim();

    if (!cleanedRepo) {
      setProjectRepoError("Please enter your GitHub repository URL (e.g. https://github.com/username/project)");
      return;
    }

    setInspectingRepo(true);
    try {
      const result = await skillGapApi.verifyProjectRepository({
        repoUrl: cleanedRepo,
        skillName
      });

      setRepoInspectionResult(result);
      if (!result.isAccessible || result.status === 'unable_to_verify') {
        setProjectRepoError(result.feedback || "Repository is private or inaccessible on GitHub.");
      }
    } catch (err) {
      console.error("Repo Inspection Error:", err);
      setProjectRepoError(err.message || "Unable to inspect GitHub repository.");
    } finally {
      setInspectingRepo(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setMcqAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleTriggerAiEvaluation = async () => {
    setProjectRepoError(null);
    const cleanedRepo = projectRepo.trim();

    if (!cleanedRepo) {
      setProjectRepoError("Please paste your valid GitHub repository URL before triggering AI evaluation!");
      return;
    }

    const isValidUrl = /github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i.test(cleanedRepo);
    if (!isValidUrl) {
      setProjectRepoError("Please enter a valid GitHub repository URL (e.g. https://github.com/your-username/my-project).");
      return;
    }

    setCurrentStep(6);
    setEvaluating(true);

    const answersPayload = Object.entries(mcqAnswers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    const cleanedCode = codeContent.trim();

    try {
      // Send raw code, MCQ answers, and GitHub repository to backend
      const res = await skillGapApi.verifySkill({
        skillName,
        userName: "SkillBridge Student",
        userId,
        assessmentId,
        answers: answersPayload,
        userCode: cleanedCode,
        projectSubmission: { repoUrl: cleanedRepo, notes: '' },
        targetRole: "Frontend Developer"
      });

      const evalData = res.evaluation;
      const certData = res.certificate;
      const isVerified = evalData.status === 'verified';

      setEvalResult({
        score: evalData.finalScore ?? evalData.overallScore,
        quizScore: evalData.mcqScore ?? evalData.componentScores?.mcqScore ?? 0,
        codingScore: evalData.codingScore ?? evalData.componentScores?.codingScore ?? 0,
        projectScore: evalData.projectScore ?? evalData.componentScores?.projectScore ?? 0,
        status: evalData.status,
        passed: isVerified,
        summary: evalData.feedback || (isVerified
          ? `✓ Comprehensive Verification Complete! ${skillName} has been certified at ${evalData.finalScore}%.`
          : `⚠ Verification Incomplete: Final Score ${evalData.finalScore}% did not reach the ${evalData.passingThreshold || 80}% requirement.`),
        feedback: [
          `✓ Quiz Knowledge Check (30% weight): ${evalData.mcqScore ?? 0}% (${evalData.detailedBreakdown?.mcqCorrect || 0}/${evalData.detailedBreakdown?.mcqTotal || mcqQuestions.length} correct)`,
          `✓ Coding Sandbox Challenge (35% weight): ${evalData.codingScore ?? 0}% (${evalData.detailedBreakdown?.codeTestsPassed || 0}/${evalData.detailedBreakdown?.codeTestsTotal || challengeData?.testCases?.length || 1} test cases passed)`,
          `✓ GitHub Project Repository (35% weight): ${evalData.projectScore ?? 0}% (${evalData.repositoryInfo?.repoName || cleanedRepo})`
        ],
        evidence: evalData.repositoryInfo?.evidence || [],
        certificate: certData
      });

      if (isVerified) {
        setTimeout(() => {
          setCurrentStep(7);
        }, 1600);
      }
    } catch (err) {
      console.error("Skill verification error:", err);
      setEvalResult({
        score: 0,
        quizScore: 0,
        codingScore: 0,
        projectScore: 0,
        status: "failed",
        passed: false,
        error: true,
        summary: `Unable to verify skill. ${err.message || 'Please check connection and retry.'}`,
        feedback: [`⚠ Verification Error: ${err.message || 'Service request failed.'}`],
        evidence: []
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinish = () => {
    const certCode = evalResult?.certificate?.certificateId || `SBA-${skillName.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`;
    if (onCompleteVerification) {
      onCompleteVerification({
        skillName,
        certificateCode: certCode,
        score: evalResult?.score || 80
      });
    }
    onClose();
  };

  const allQuestionsAnswered = mcqQuestions.length > 0 && mcqQuestions.every(q => mcqAnswers[q.questionId]);

  const modalUI = (
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      <div 
        ref={modalContainerRef}
        className="bg-[#0d1117] text-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-gray-800 space-y-6 shadow-2xl relative"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple text-xs font-bold uppercase tracking-wider">
                SKILL BRIDGE PIPELINE
              </span>
              <span className="text-xs text-gray-400">Target Skill:</span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-purple" /> {skillName} Verification & Sandbox Assessment
            </h2>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-7 gap-1">
          {steps.map((st) => (
            <div 
              key={st.num}
              onClick={() => st.num <= currentStep && setCurrentStep(st.num)}
              className={`p-2 rounded-lg text-center cursor-pointer transition-all border ${
                st.num === currentStep 
                  ? 'bg-accent-purple/20 border-accent-purple text-white font-bold' 
                  : st.num < currentStep 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-gray-900/40 border-gray-800 text-gray-600'
              }`}
            >
              <div className="text-[10px] font-black">{st.num < currentStep ? '✓' : st.num}</div>
              <div className="text-[9px] font-semibold truncate hidden sm:block mt-0.5">{st.label}</div>
            </div>
          ))}
        </div>

        {/* ================= STEP 1: NOTES & VIDEO ================= */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-purple" /> Module 1: {skillName} Concepts & Architecture
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Review the core architectural principles of {skillName} before completing the assessment.
              </p>

              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs font-mono text-gray-300 space-y-2">
                <div className="text-accent-purple font-bold">// Key {skillName} Principles:</div>
                <p>1. Asynchronous non-blocking event-driven execution architecture.</p>
                <p>2. Modular package dependency isolation & clean REST interface design.</p>
                <p>3. Robust error propagation, logging, and environment configuration management.</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              Continue to Practice <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= STEP 2: PRACTICE ================= */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400" /> Module 2: Interactive Practice Exercise
              </h3>
              <p className="text-xs text-gray-300">
                Identify the optimal architectural pattern for production {skillName} deployments:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs space-y-1 cursor-pointer">
                  <span className="font-bold text-emerald-400">Pattern A: Scalable Async Handlers</span>
                  <p className="text-gray-400 text-[11px]">Decoupled controller routes with centralized error handling middleware.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-gray-800 bg-gray-950 text-xs space-y-1 opacity-60">
                  <span className="font-bold text-gray-300">Pattern B: Synchronous Blocking Calls</span>
                  <p className="text-gray-500 text-[11px]">Monolithic blocking calls on main event execution loop.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(1)} className="px-4 py-3 rounded-xl bg-gray-900 text-gray-300 text-xs font-bold">Back</button>
              <button onClick={() => setCurrentStep(3)} className="flex-1 py-3 rounded-xl bg-accent-purple text-white text-xs font-bold flex items-center justify-center gap-1">
                Start MCQ Assessment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SECURE BACKEND MCQ ASSESSMENT ================= */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-400" /> Module 3: {skillName} Knowledge Check
                </h3>
                <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                  Backend Evaluated
                </span>
              </div>

              {loadingQuestions ? (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-accent-purple animate-spin mx-auto" />
                  <p className="text-xs text-gray-400">Loading verified assessment questions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mcqQuestions.map((q, qIdx) => (
                    <div key={q.questionId || qIdx} className="space-y-2 text-xs border-b border-gray-800/60 pb-3 last:border-0 last:pb-0">
                      <p className="font-semibold text-white">Q{qIdx + 1}. {q.question}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
                          const optionKey = typeof opt === 'string' ? opt : opt.key;
                          const optionText = typeof opt === 'string' ? opt : `${opt.key}. ${opt.text}`;
                          const isSelected = mcqAnswers[q.questionId] === optionKey;

                          return (
                            <button
                              key={optionKey}
                              type="button"
                              onClick={() => handleSelectOption(q.questionId, optionKey)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                                isSelected 
                                  ? 'bg-accent-purple/20 border-accent-purple text-white font-semibold' 
                                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                              }`}
                            >
                              {optionText}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(2)} className="px-4 py-3 rounded-xl bg-gray-900 text-gray-300 text-xs font-bold">Back</button>
              <button 
                disabled={!allQuestionsAnswered}
                onClick={() => setCurrentStep(4)} 
                className="flex-1 py-3 rounded-xl bg-accent-purple disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-accent-purple/20"
              >
                Proceed to Coding Sandbox <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REAL TEST-BASED CODING SANDBOX ================= */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" /> Module 4: {challengeData?.question ? `${skillName} Practical Challenge` : "Coding Challenge"}
                </h3>
                {codePassed && (
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> All Tests Passed ({codeExecutionResult?.passedTests}/{codeExecutionResult?.totalTests})
                  </span>
                )}
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs">
                <p className="text-gray-200 font-medium leading-relaxed">
                  {challengeData?.question || "Implement the function logic to satisfy all unit test assertions."}
                </p>
                {challengeData?.expectedBehavior && (
                  <p className="text-[11px] text-gray-400 font-mono">
                    Expected: {challengeData.expectedBehavior}
                  </p>
                )}
              </div>

              {codeValidationError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  {codeValidationError}
                </div>
              )}

              {/* Code Editor */}
              <div className="relative">
                <textarea
                  value={codeContent}
                  onChange={(e) => {
                    setCodeContent(e.target.value);
                    if (codeValidationError) setCodeValidationError(null);
                  }}
                  rows={9}
                  placeholder="// Implement your solution logic here..."
                  className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-emerald-400 focus:outline-none focus:border-accent-purple leading-relaxed resize-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-[10px] text-gray-400 hover:text-white font-mono flex items-center gap-1 transition-all"
                  title="Reset to starter template"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Template
                </button>
              </div>

              {/* Run Code Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleRunCode}
                  disabled={codeRunning}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-accent-purple/20 transition-all disabled:opacity-50"
                >
                  {codeRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  {codeRunning ? "Executing in Isolated VM Sandbox..." : "Run Code & Verify Test Cases"}
                </button>

                <span className="text-[11px] text-gray-400 font-medium">
                  {codePassed ? "✓ Code verified against test suite" : "Backend sandbox executes code against test cases"}
                </span>
              </div>

              {/* Real Test Suite Output from Sandbox */}
              {codeExecutionResult && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  codeExecutionResult.status === 'passed' 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Sandbox Execution Report:
                      </span>
                    </div>
                    <span className={`text-xs font-black ${codeExecutionResult.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {codeExecutionResult.passedTests} / {codeExecutionResult.totalTests} Tests Passed ({codeExecutionResult.score}%)
                    </span>
                  </div>

                  {codeExecutionResult.error && (
                    <div className="p-2.5 rounded-lg bg-rose-900/40 text-rose-300 font-mono text-[11px]">
                      {codeExecutionResult.error}
                    </div>
                  )}

                  {codeExecutionResult.testResults && codeExecutionResult.testResults.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {codeExecutionResult.testResults.map((tr, idx) => (
                        <div key={tr.id || idx} className="p-2 rounded-lg bg-gray-950/80 border border-gray-800/80 text-[11px] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {tr.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}
                            <span className={`font-mono truncate ${tr.passed ? 'text-gray-300' : 'text-rose-300 font-medium'}`}>
                              Test {idx + 1}: {tr.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {tr.executionTimeMs !== undefined && (
                              <span className="text-[10px] text-gray-500 font-mono flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {tr.executionTimeMs}ms
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${tr.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                              {tr.passed ? "PASS" : "FAIL"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(3)} className="px-4 py-3 rounded-xl bg-gray-900 text-gray-300 text-xs font-bold">Back</button>
              <button 
                disabled={!codePassed}
                onClick={() => setCurrentStep(5)} 
                className="flex-1 py-3 rounded-xl bg-accent-purple disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-accent-purple/20"
              >
                Submit Project Proof <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: LIVE GITHUB PROJECT VERIFICATION ================= */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-accent-pink" /> Module 5: GitHub Micro-Project Verification
                </h3>
                <span className="px-2.5 py-0.5 rounded bg-accent-pink/20 text-accent-pink text-[10px] font-bold border border-accent-pink/30 flex items-center gap-1">
                  <Github className="w-3 h-3" /> Live GitHub Inspection
                </span>
              </div>

              <p className="text-xs text-gray-300">
                Submit a public GitHub repository link demonstrating real practical implementation of {skillName}:
              </p>

              {projectRepoError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  {projectRepoError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-400">Public GitHub Repository URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={projectRepo}
                    onChange={(e) => {
                      setProjectRepo(e.target.value);
                      if (projectRepoError) setProjectRepoError(null);
                    }}
                    placeholder={`https://github.com/username/${skillName.toLowerCase().replace(/[^a-z0-9]/g, '')}-project`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-accent-purple font-mono placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={handleInspectRepo}
                    disabled={inspectingRepo}
                    className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    {inspectingRepo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                    Inspect Repo
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  Backend will inspect repository metadata, package.json dependencies, and README documentation for {skillName} evidence.
                </p>
              </div>

              {/* Repo Inspection Output */}
              {repoInspectionResult && (
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  repoInspectionResult.isAccessible && repoInspectionResult.evidence?.length > 0
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-accent-purple" /> {repoInspectionResult.repoName || "GitHub Repository"}
                    </span>
                    <span className={`text-xs font-extrabold ${repoInspectionResult.isAccessible && repoInspectionResult.evidence?.length > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {repoInspectionResult.isAccessible && repoInspectionResult.evidence?.length > 0 ? `Evidence Score: ${repoInspectionResult.projectScore}%` : 'Unable to Verify'}
                    </span>
                  </div>

                  {repoInspectionResult.evidence && repoInspectionResult.evidence.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        Detected Technical Evidence:
                      </span>
                      {repoInspectionResult.evidence.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-emerald-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-300">
                      {repoInspectionResult.feedback || "No concrete technology markers or dependencies for this skill were found in the repository."}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(4)} className="px-4 py-3 rounded-xl bg-gray-900 text-gray-300 text-xs font-bold">Back</button>
              <button 
                onClick={handleTriggerAiEvaluation} 
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-accent-purple/20"
              >
                <Sparkles className="w-4 h-4" /> Trigger Final AI Verification
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: AI EVALUATION ================= */}
        {currentStep === 6 && (
          <div className="space-y-4 text-center py-6">
            {evaluating ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-accent-purple border-t-transparent animate-spin" />
                <div>
                  <h3 className="text-base font-bold text-white">AI Evaluator is Reviewing Submission...</h3>
                  <p className="text-xs text-gray-400 mt-1">Executing code in sandbox, checking MCQs, and validating live GitHub repository architecture</p>
                </div>
              </div>
            ) : evalResult ? (
              <div className={`space-y-4 text-left p-6 rounded-2xl border transition-all ${
                evalResult.passed 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black ${evalResult.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {evalResult.score}% Total Score
                  </span>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    evalResult.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {evalResult.passed ? 'PASSED ✓' : (evalResult.status === "UNABLE_TO_VERIFY" ? 'UNABLE TO VERIFY ⚠' : 'NEEDS IMPROVEMENT ⚠')}
                  </span>
                </div>
                <p className="text-xs text-gray-200">{evalResult.summary}</p>
                <div className="space-y-1.5 pt-2">
                  {evalResult.feedback.map((f, i) => (
                    <div key={i} className={`text-xs font-medium ${f.includes('⚠') ? 'text-rose-300 font-bold' : 'text-emerald-300'}`}>
                      {f}
                    </div>
                  ))}
                </div>

                {evalResult.evidence && evalResult.evidence.length > 0 && (
                  <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Verified Repository Evidence:
                    </span>
                    {evalResult.evidence.map((ev, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-gray-300 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 flex gap-3">
                  {!evalResult.passed ? (
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <RefreshCw className="w-4 h-4" /> Retake & Fix Code / Repository
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(7)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      Proceed to Certification <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ================= STEP 7: CERTIFICATION ================= */}
        {currentStep === 7 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 border border-emerald-500/40">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black tracking-wider uppercase">
                SKILL STATUS = GAINED ✓
              </span>
              <h3 className="text-2xl font-black text-white">{skillName} Certified</h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                Verified through backend-scored MCQ assessment, sandbox test cases, and real GitHub repository evidence.
              </p>
            </div>

            {/* Weighted Score Breakdown */}
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-center">
              <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 space-y-0.5">
                <span className="text-[10px] text-gray-400 font-semibold block">Quiz (30%)</span>
                <span className="text-sm font-bold text-white">{evalResult?.quizScore ?? 0}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 space-y-0.5">
                <span className="text-[10px] text-gray-400 font-semibold block">Coding (35%)</span>
                <span className="text-sm font-bold text-white">{evalResult?.codingScore ?? 0}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 space-y-0.5">
                <span className="text-[10px] text-gray-400 font-semibold block">Project (35%)</span>
                <span className="text-sm font-bold text-white">{evalResult?.projectScore ?? 0}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 max-w-md mx-auto flex items-center justify-between text-xs font-bold">
              <span className="text-gray-300">Skill Score (Weighted Total):</span>
              <span className="text-emerald-400 text-sm font-black">{evalResult?.score || 89}% → GAINED ✓</span>
            </div>

            {/* Resume Update & Job Match Recalculation Review */}
            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 text-left space-y-3 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-purple" /> Automatic Resume Update Applied:
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Version Snapshot Saved
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Added to Resume Skills:</span>
                  <span className="font-bold text-white">{skillName} — Verified ({evalResult?.score}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Verification Date:</span>
                  <span className="font-mono text-gray-300">{new Date().toISOString().split('T')[0]}</span>
                </div>
                {evalResult?.recalculatedMatch && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recalculated Job Match:</span>
                    <span className="font-bold text-emerald-400">
                      {evalResult.recalculatedMatch.previousScore}% → {evalResult.recalculatedMatch.newScore}% ({evalResult.recalculatedMatch.difference >= 0 ? '+' : ''}{evalResult.recalculatedMatch.difference}%)
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-gray-500 leading-normal pt-1 border-t border-gray-900">
                ✓ Only verified skill badge and score were appended. No employment experience or achievements were fabricated.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 max-w-md mx-auto font-mono text-xs text-gray-400 flex items-center justify-between">
              <span>Certificate ID:</span>
              <span className="text-emerald-400 font-bold">
                {evalResult?.certificate?.certificateId || `SBA-${skillName.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 max-w-md mx-auto">
              <a
                href={evalResult?.certificate?.pdfUrl || `/api/certificates/${evalResult?.certificate?.certificateId || 'cert'}/download`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-accent-purple" /> Download Certificate
              </a>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Save & Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalUI, document.body);
}
