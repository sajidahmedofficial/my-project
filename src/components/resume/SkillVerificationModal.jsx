// agent-notes: { ctx: "Interactive 7-stage skill verification modal with live GitHub repository evidence extraction, sandbox VM coding evaluation, and authoritative certification", deps: ["react", "lucide-react", "../../utils/skillChallenges", "../../services/skillGapApi"], state: "active", last: "anti@2026-08-25" }
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
import { SKILL_CHALLENGES } from '../../utils/skillChallenges';

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
      const normalizedKey = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const offlineFallback = SKILL_CHALLENGES[normalizedKey] || SKILL_CHALLENGES.react;

      try {
        // 1. Fetch sanitized questions from backend as primary path
        const qData = await skillGapApi.getAssessmentQuestions(skillName, userId);
        if (isMounted && qData && Array.isArray(qData.questions) && qData.questions.length > 0) {
          setAssessmentId(qData.assessmentId);
          setMcqQuestions(qData.questions);
        } else if (isMounted && offlineFallback?.mcqs) {
          setMcqQuestions(offlineFallback.mcqs.map((q, idx) => ({
            questionId: `mcq_${normalizedKey}_${idx}`,
            question: q.question,
            options: q.options
          })));
        }

        // 2. Fetch coding challenge from backend as primary path
        const cData = await skillGapApi.getCodingChallenge(skillName);
        if (isMounted && cData && cData.challenge) {
          setChallengeData(cData.challenge);
          setCodeContent(cData.challenge.starterCode || "");
        } else if (isMounted && offlineFallback) {
          setChallengeData(offlineFallback);
          setCodeContent(offlineFallback.starterCode || "");
        }
      } catch (err) {
        console.warn("Backend verification assets notice (using offline challenge fallback):", err.message);
        if (isMounted && offlineFallback) {
          if (offlineFallback.mcqs) {
            setMcqQuestions(offlineFallback.mcqs.map((q, idx) => ({
              questionId: `mcq_${normalizedKey}_${idx}`,
              question: q.question,
              options: q.options
            })));
          }
          setChallengeData(offlineFallback);
          setCodeContent(offlineFallback.starterCode || "");
        }
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
          : `⚠ Verification Incomplete: Final Score ${evalData.finalScore}% did not reach the ${evalData.passingThreshold || 75}% requirement.`),
        feedback: [
          `✓ Quiz Knowledge Check (25% weight): ${evalData.mcqScore ?? 0}% (${evalData.detailedBreakdown?.mcqCorrect || 0}/${evalData.detailedBreakdown?.mcqTotal || mcqQuestions.length} correct)`,
          `✓ Coding Sandbox Challenge (35% weight): ${evalData.codingScore ?? 0}% (${evalData.detailedBreakdown?.codeTestsPassed || 0}/${evalData.detailedBreakdown?.codeTestsTotal || challengeData?.testCases?.length || 1} test cases passed)`,
          `✓ GitHub Project Repository (40% weight): ${evalData.projectScore ?? 0}% (${evalData.repositoryInfo?.repoName || cleanedRepo})`
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
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto text-slate-900">
      <div 
        ref={modalContainerRef}
        className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-slate-200 space-y-6 shadow-modal relative"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="saas-badge saas-badge-indigo text-[10px]">
                Skill Pipeline
              </span>
              <span className="text-xs text-slate-500">Target Skill:</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> {skillName} Verification & Assessment
            </h2>
          </div>

          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
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
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold shadow-sm' 
                  : st.num < currentStep 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-bold">{st.num < currentStep ? '✓' : st.num}</div>
              <div className="text-[9px] font-medium truncate hidden sm:block mt-0.5">{st.label}</div>
            </div>
          ))}
        </div>

        {/* ================= STEP 1: NOTES & VIDEO ================= */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Module 1: {skillName} Concepts & Architecture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review the core architectural principles of {skillName} before completing the assessment.
              </p>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 space-y-1.5">
                <div className="text-indigo-600 font-bold">// Key {skillName} Principles:</div>
                <p>1. Asynchronous non-blocking event-driven execution architecture.</p>
                <p>2. Modular package dependency isolation & clean REST interface design.</p>
                <p>3. Robust error propagation, logging, and environment configuration management.</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="saas-btn-primary w-full py-2.5 text-xs font-medium gap-1.5"
            >
              Continue to Practice <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= STEP 2: PRACTICE ================= */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-600" /> Module 2: Interactive Practice Exercise
              </h3>
              <p className="text-xs text-slate-600">
                Identify the optimal architectural pattern for production {skillName} deployments:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs space-y-1 cursor-pointer">
                  <span className="font-semibold text-emerald-800">Pattern A: Scalable Async Handlers</span>
                  <p className="text-slate-600 text-[11px]">Decoupled controller routes with centralized error handling middleware.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1 opacity-70">
                  <span className="font-medium text-slate-700">Pattern B: Synchronous Blocking Calls</span>
                  <p className="text-slate-500 text-[11px]">Monolithic blocking calls on main event execution loop.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setCurrentStep(1)} className="saas-btn-secondary px-4 py-2 text-xs">Back</button>
              <button onClick={() => setCurrentStep(3)} className="saas-btn-primary flex-1 py-2 text-xs font-medium gap-1">
                Start MCQ Assessment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SECURE BACKEND MCQ ASSESSMENT ================= */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" /> Module 3: {skillName} Knowledge Check
                </h3>
                <span className="saas-badge text-[10px]">
                  Backend Evaluated
                </span>
              </div>

              {loadingQuestions ? (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Loading verified assessment questions...</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {mcqQuestions.map((q, qIdx) => (
                    <div key={q.questionId || qIdx} className="space-y-2 text-xs border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                      <p className="font-medium text-slate-900">Q{qIdx + 1}. {q.question}</p>
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
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                                isSelected 
                                  ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-medium' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
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

            <div className="flex gap-2.5">
              <button onClick={() => setCurrentStep(2)} className="saas-btn-secondary px-4 py-2 text-xs">Back</button>
              <button 
                disabled={!allQuestionsAnswered}
                onClick={() => setCurrentStep(4)} 
                className="saas-btn-primary flex-1 py-2 text-xs font-medium gap-1 disabled:opacity-50"
              >
                Proceed to Coding Sandbox <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REAL TEST-BASED CODING SANDBOX ================= */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-600" /> Module 4: {challengeData?.question ? `${skillName} Practical Challenge` : "Coding Challenge"}
                </h3>
                {codePassed && (
                  <span className="saas-badge saas-badge-success text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> All Tests Passed ({codeExecutionResult?.passedTests}/{codeExecutionResult?.totalTests})
                  </span>
                )}
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-white border border-slate-200 text-xs">
                <p className="text-slate-800 font-medium leading-relaxed">
                  {challengeData?.question || "Implement the function logic to satisfy all unit test assertions."}
                </p>
                {challengeData?.expectedBehavior && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    Expected: {challengeData.expectedBehavior}
                  </p>
                )}
              </div>

              {codeValidationError && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
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
                  className="w-full p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 focus:outline-none leading-relaxed resize-none"
                />
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white font-mono flex items-center gap-1"
                  title="Reset to starter template"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Run Code Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleRunCode}
                  disabled={codeRunning}
                  className="saas-btn-primary py-1.5 px-3.5 text-xs font-medium gap-1.5 disabled:opacity-50"
                >
                  {codeRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {codeRunning ? "Executing in Sandbox..." : "Run Tests"}
                </button>

                <span className="text-[11px] text-slate-500">
                  {codePassed ? "✓ Code verified against test suite" : "Executes against test cases"}
                </span>
              </div>

              {/* Real Test Suite Output from Sandbox */}
              {codeExecutionResult && (
                <div className={`p-3 rounded-lg border space-y-2 ${
                  codeExecutionResult.status === 'passed' 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-900">
                        Sandbox Execution Report:
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${codeExecutionResult.status === 'passed' ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {codeExecutionResult.passedTests} / {codeExecutionResult.totalTests} Tests Passed ({codeExecutionResult.score}%)
                    </span>
                  </div>

                  {codeExecutionResult.error && (
                    <div className="p-2 rounded bg-rose-100 text-rose-800 font-mono text-[11px]">
                      {codeExecutionResult.error}
                    </div>
                  )}

                  {codeExecutionResult.testResults && codeExecutionResult.testResults.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {codeExecutionResult.testResults.map((tr, idx) => (
                        <div key={tr.id || idx} className="p-2 rounded bg-white border border-slate-200 text-[11px] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {tr.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            <span className={`font-mono truncate ${tr.passed ? 'text-slate-700' : 'text-rose-700 font-medium'}`}>
                              Test {idx + 1}: {tr.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {tr.executionTimeMs !== undefined && (
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {tr.executionTimeMs}ms
                              </span>
                            )}
                            <span className={`saas-badge text-[9px] ${tr.passed ? 'saas-badge-success' : 'saas-badge-danger'}`}>
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

            <div className="flex gap-2.5">
              <button onClick={() => setCurrentStep(3)} className="saas-btn-secondary px-4 py-2 text-xs">Back</button>
              <button 
                disabled={!codePassed}
                onClick={() => setCurrentStep(5)} 
                className="saas-btn-primary flex-1 py-2 text-xs font-medium gap-1 disabled:opacity-50"
              >
                Submit Project Proof <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: LIVE GITHUB PROJECT VERIFICATION ================= */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-indigo-600" /> Module 5: GitHub Repository Verification
                </h3>
                <span className="saas-badge text-[10px]">
                  <Github className="w-3 h-3" /> Live Inspection
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Submit a public GitHub repository link demonstrating real practical implementation of {skillName}:
              </p>

              {projectRepoError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  {projectRepoError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Public GitHub Repository URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={projectRepo}
                    onChange={(e) => {
                      setProjectRepo(e.target.value);
                      if (projectRepoError) setProjectRepoError(null);
                    }}
                    placeholder={`https://github.com/username/${skillName.toLowerCase().replace(/[^a-z0-9]/g, '')}-project`}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleInspectRepo}
                    disabled={inspectingRepo}
                    className="saas-btn-secondary py-1.5 px-3 text-xs gap-1 shrink-0"
                  >
                    {inspectingRepo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                    Inspect
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Inspects package.json dependencies and README documentation for {skillName} evidence.
                </p>
              </div>

              {/* Repo Inspection Output */}
              {repoInspectionResult && (
                <div className={`p-3 rounded-lg border space-y-2 ${
                  repoInspectionResult.isAccessible && repoInspectionResult.evidence?.length > 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-700" /> {repoInspectionResult.repoName || "GitHub Repository"}
                    </span>
                    <span className={`text-xs font-bold ${repoInspectionResult.isAccessible && repoInspectionResult.evidence?.length > 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {repoInspectionResult.isAccessible && repoInspectionResult.evidence?.length > 0 ? `Score: ${repoInspectionResult.projectScore}%` : 'Unable to Verify'}
                    </span>
                  </div>

                  {repoInspectionResult.evidence && repoInspectionResult.evidence.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                        Detected Technical Evidence:
                      </span>
                      {repoInspectionResult.evidence.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-[11px] text-emerald-800">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-800">
                      {repoInspectionResult.feedback || "No concrete technology markers were found in the repository."}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setCurrentStep(4)} className="saas-btn-secondary px-4 py-2 text-xs">Back</button>
              <button 
                onClick={handleTriggerAiEvaluation} 
                className="saas-btn-primary flex-1 py-2 text-xs font-medium gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Trigger AI Verification
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: AI EVALUATION ================= */}
        {currentStep === 6 && (
          <div className="space-y-4 text-center py-6">
            {evaluating ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">AI Evaluator is Reviewing Submission...</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Evaluating sandbox test cases and repository evidence</p>
                </div>
              </div>
            ) : evalResult ? (
              <div className={`space-y-3 text-left p-5 rounded-xl border ${
                evalResult.passed 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-bold ${evalResult.passed ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {evalResult.score}% Overall Score
                  </span>
                  <span className={`saas-badge ${
                    evalResult.passed ? 'saas-badge-success' : 'saas-badge-danger'
                  }`}>
                    {evalResult.passed ? 'PASSED ✓' : 'NEEDS IMPROVEMENT'}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{evalResult.summary}</p>
                <div className="space-y-1 pt-1">
                  {evalResult.feedback.map((f, i) => (
                    <div key={i} className={`text-xs ${f.includes('⚠') ? 'text-rose-800 font-medium' : 'text-emerald-800'}`}>
                      {f}
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-2.5">
                  {!evalResult.passed ? (
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="saas-btn-secondary w-full py-2 text-xs gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retake & Fix Code / Repo
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(7)}
                      className="saas-btn-primary w-full py-2 text-xs font-medium gap-1.5"
                    >
                      Proceed to Certification <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ================= STEP 7: CERTIFICATION ================= */}
        {currentStep === 7 && (
          <div className="space-y-5 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="saas-badge saas-badge-success text-xs font-semibold">
                SKILL STATUS = GAINED ✓
              </span>
              <h3 className="text-lg font-bold text-slate-900">{skillName} Certified</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Verified through backend MCQ assessment, sandbox test cases, and repository evidence.
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 font-medium block">Quiz</span>
                <span className="text-xs font-bold text-slate-900">{evalResult?.quizScore ?? 0}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 font-medium block">Coding</span>
                <span className="text-xs font-bold text-slate-900">{evalResult?.codingScore ?? 0}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 font-medium block">Project</span>
                <span className="text-xs font-bold text-slate-900">{evalResult?.projectScore ?? 0}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 max-w-md mx-auto flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">Verified Score:</span>
              <span className="text-emerald-800 font-bold">{evalResult?.score || 89}% → GAINED ✓</span>
            </div>

            <div className="flex items-center gap-2.5 pt-1 max-w-md mx-auto">
              <a
                href={evalResult?.certificate?.pdfUrl || `/api/certificates/${evalResult?.certificate?.certificateId || 'cert'}/download`}
                target="_blank"
                rel="noreferrer"
                className="saas-btn-secondary flex-1 py-2 text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" /> Download PDF
              </a>
              <button
                onClick={handleFinish}
                className="saas-btn-primary flex-1 py-2 text-xs font-medium gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalUI, document.body);
}
