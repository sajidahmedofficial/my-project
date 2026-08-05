// agent-notes: { ctx: "React hook for fetching and filtering questions by topic and difficulty", deps: ["react", "../services/aptitudeApi"], state: "active", last: "anti@2026-08-04" }

import { useState, useEffect, useCallback } from 'react';
import { aptitudeApi } from '../services/aptitudeApi';

export function useQuestions(initialTopicId = 'percentage', initialDifficulty = 'medium') {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aptitudeApi.getQuestions({
        topicId: params.topicId || initialTopicId,
        difficulty: params.difficulty || initialDifficulty,
        limit: params.limit || 20,
        mode: params.mode || 'practice'
      });
      const list = res.questions || (Array.isArray(res) ? res : []);
      setQuestions(list);
      return list;
    } catch (err) {
      setError(err.message || 'Error loading questions');
      console.error('useQuestions error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [initialTopicId, initialDifficulty]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions
  };
}
