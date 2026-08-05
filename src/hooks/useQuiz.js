// agent-notes: { ctx: "React hook for managing quiz session state, start, answer submission & finish flow", deps: ["react", "../services/aptitudeApi"], state: "active", last: "anti@2026-08-04" }

import { useState, useCallback } from 'react';
import { aptitudeApi } from '../services/aptitudeApi';

export function useQuiz() {
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const startQuiz = useCallback(async (topicId, options = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await aptitudeApi.startQuiz(topicId, options);
      if (res && (res.questions || res.question)) {
        const qList = res.questions || [res.question];
        setSession({
          id: res.sessionId || res.session?.id || `sess_${Date.now()}`,
          topicId: topicId,
          topicName: res.topic || res.session?.topicName || topicId,
          totalQuestions: qList.length,
          mode: options.mode || 'practice'
        });
        setQuestions(qList);
        return { session: res.session, questions: qList };
      } else {
        throw new Error('No questions returned for this topic.');
      }
    } catch (err) {
      setError(err.message || 'Failed to start quiz session.');
      console.error('useQuiz.startQuiz error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (sessionId, questionId, selectedAnswer) => {
    try {
      return await aptitudeApi.submitAnswer(sessionId, { questionId, selectedAnswer });
    } catch (err) {
      console.error('useQuiz.submitAnswer error:', err);
      return null;
    }
  }, []);

  const finishQuiz = useCallback(async (sessionId, submissionData) => {
    setLoading(true);
    try {
      const res = await aptitudeApi.submitSession(sessionId, submissionData);
      setResult(res);
      return res;
    } catch (err) {
      setError(err.message || 'Failed to submit quiz results.');
      console.error('useQuiz.finishQuiz error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetQuiz = useCallback(() => {
    setSession(null);
    setQuestions([]);
    setError(null);
    setResult(null);
  }, []);

  return {
    session,
    questions,
    loading,
    error,
    result,
    startQuiz,
    submitAnswer,
    finishQuiz,
    resetQuiz
  };
}
