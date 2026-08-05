// agent-notes: { ctx: "Main Aptitude Practice Dashboard with dynamic database count, accuracy badge, progress tracking & direct Start Practice action", deps: ["lucide-react", "../../services/aptitudeApi"], state: "active", last: "anti@2026-08-04" }

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Brain, 
  Target, 
  BarChart2, 
  Bookmark, 
  Database, 
  Play, 
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { aptitudeApi } from '../../services/aptitudeApi';
import TopicConfigModal from './TopicConfigModal';
import MCQQuizInterface from './MCQQuizInterface';
import QuizResultView from './QuizResultView';
import QuizReviewView from './QuizReviewView';
import AptitudeBookmarks from './AptitudeBookmarks';
import AptitudeAnalytics from './AptitudeAnalytics';
import AptitudeAdmin from './AptitudeAdmin';

export default function AptitudeDashboard() {
  const [activeTab, setActiveTab] = useState('hub'); // 'hub', 'quiz', 'result', 'review', 'bookmarks', 'analytics', 'admin'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);

  // Active Quiz State
  const [activeSession, setActiveSession] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [bookmarksList, setBookmarksList] = useState([]);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await aptitudeApi.getTopics();
      if (Array.isArray(data)) {
        setTopics(data);
      }
    } catch (err) {
      console.error('Error loading topics:', err);
    }
  };

  const categories = [
    'All',
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Data Interpretation',
    'General Placement Aptitude'
  ];

  const filteredTopics = topics.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenTopicConfig = (topic) => {
    setSelectedTopic(topic);
    setIsConfigOpen(true);
  };

  /**
   * Directly triggers practice session via GET /api/quiz/:topicId/start
   */
  const handleStartPracticeDirect = async (topic) => {
    setIsLoadingQuiz(true);
    setQuizError(null);
    setSelectedTopic(topic);

    try {
      const res = await aptitudeApi.startQuiz(topic.id || topic.slug, { limit: 20, mode: 'practice' });
      
      if (res && res.questions && res.questions.length > 0) {
        setActiveSession({
          id: res.sessionId || res.session?.id || `sess_${Date.now()}`,
          topicId: topic.id,
          topicName: topic.title,
          category: topic.category,
          mode: 'practice',
          limit: 20
        });
        setActiveQuestions(res.questions);
        setActiveTab('quiz');
      } else {
        setQuizError(`Questions are being prepared for ${topic.title}. Please try again shortly or use Admin Console to generate.`);
      }
    } catch (err) {
      console.error('Error starting practice session:', err);
      setQuizError('Unable to load question. Please try again.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleStartQuizFromConfig = async (config) => {
    setIsConfigOpen(false);
    setIsLoadingQuiz(true);
    setQuizError(null);

    try {
      const res = await aptitudeApi.startQuiz(config.topicId, {
        limit: config.limit,
        difficulty: config.difficulty,
        mode: config.mode
      });

      if (res && res.questions && res.questions.length > 0) {
        setActiveSession({
          id: res.sessionId || res.session?.id || `sess_${Date.now()}`,
          topicId: config.topicId,
          topicName: config.topicName || selectedTopic?.title || config.topicId,
          category: config.category || selectedTopic?.category || 'Quantitative Aptitude',
          mode: config.mode || 'practice',
          limit: config.limit || 20
        });
        setActiveQuestions(res.questions);
        setActiveTab('quiz');
      } else {
        setQuizError('Questions are being prepared for this topic.');
      }
    } catch (err) {
      console.error('Error starting session from config:', err);
      setQuizError('Unable to load question. Please try again.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleQuizCompleted = async (sessionData) => {
    try {
      const res = await aptitudeApi.submitSession(sessionData.sessionId, sessionData);
      setQuizResult(res);
      setActiveTab('result');
      // Refresh topic counts and stats after practice
      loadTopics();
    } catch (err) {
      console.error('Error submitting test:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Navigation Tabs */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-card-border relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-purple/20 text-accent-pink border border-accent-pink/30 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> AI Placement Aptitude Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Brain className="w-8 h-8 text-accent-purple" /> Placement Practice Hub
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Master 87,000+ Verified Aptitude MCQs across Quantitative, Reasoning, Verbal & Data Interpretation
            </p>
          </div>

          {/* Platform View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'hub', label: 'Practice Hub', icon: Target },
              { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
              { id: 'analytics', label: 'Analytics', icon: BarChart2 },
              { id: 'admin', label: 'Admin Console', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white border-accent-purple shadow-lg shadow-purple-600/30'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Loading / Error Notifications */}
      {isLoadingQuiz && (
        <div className="p-4 rounded-2xl bg-accent-purple/20 border border-accent-purple text-white flex items-center justify-center gap-3 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-accent-pink" />
          <span className="text-xs font-bold">Loading Question...</span>
        </div>
      )}

      {quizError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{quizError}</span>
          </div>
          <button
            onClick={() => setQuizError(null)}
            className="px-3 py-1 bg-red-900/60 hover:bg-red-900 text-white rounded-lg text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'hub' && (
        <div className="space-y-6">
          {/* Search & Category Filter Toolbar */}
          <div className="glass rounded-2xl p-4 border border-gray-800 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search across 87 aptitude topics (e.g. Percentage, Number System, Syllogism)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white text-xs pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-accent-purple"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-accent-pink/20 border-accent-pink text-white shadow-md shadow-pink-500/20'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((topic, idx) => {
              const qCount = topic.questionCount !== undefined ? topic.questionCount : 1000;
              const displayCountStr = qCount >= 1000 ? '1,000 Questions' : `${qCount} / 1000 Questions`;
              const userAccuracyStr = topic.accuracy !== undefined ? `${topic.accuracy}% Accuracy` : 'No attempts yet';
              const progressCount = topic.answeredCount || 0;
              const progressPct = Math.min(100, Math.round((progressCount / 1000) * 100));

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenTopicConfig(topic)}
                  className="glass rounded-2xl p-5 border border-gray-800 hover:border-accent-purple/60 cursor-pointer transition-all flex flex-col justify-between space-y-4 group hover:scale-[1.01]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-extrabold text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded border border-accent-purple/20">
                        {topic.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {userAccuracyStr}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white group-hover:text-accent-pink transition-colors">
                      {topic.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-300">{displayCountStr}</span>
                      <span>Easy • Medium • Hard</span>
                    </div>

                    {/* Dynamic Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                        <span>Progress</span>
                        <span className="text-white font-bold">{progressCount} / 1000</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-850">
                        <div
                          className="bg-gradient-to-r from-accent-purple to-accent-pink h-full transition-all duration-500"
                          style={{ width: `${Math.max(5, progressPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartPracticeDirect(topic);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-accent-purple hover:bg-accent-purple/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-accent-pink" /> Start Practice
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUIZ INTERFACE VIEW */}
      {activeTab === 'quiz' && activeSession && (
        <MCQQuizInterface
          session={activeSession}
          questions={activeQuestions}
          onComplete={handleQuizCompleted}
          onExit={() => setActiveTab('hub')}
        />
      )}

      {/* RESULT VIEW */}
      {activeTab === 'result' && quizResult && (
        <QuizResultView
          result={quizResult}
          onReview={() => setActiveTab('review')}
          onRetry={() => handleStartPracticeDirect(selectedTopic || { id: activeSession.topicId, title: activeSession.topicName })}
          onBackDashboard={() => setActiveTab('hub')}
        />
      )}

      {/* REVIEW VIEW */}
      {activeTab === 'review' && quizResult && (
        <QuizReviewView
          questions={activeQuestions}
          evaluatedAnswers={quizResult.evaluatedAnswers}
          onBack={() => setActiveTab('result')}
        />
      )}

      {/* BOOKMARKS VIEW */}
      {activeTab === 'bookmarks' && (
        <AptitudeBookmarks
          bookmarks={bookmarksList}
          onPracticeBookmarks={() => alert('Practicing bookmarks...')}
          onRemoveBookmark={(id) => setBookmarksList(prev => prev.filter(b => b.id !== id))}
        />
      )}

      {/* ANALYTICS VIEW */}
      {activeTab === 'analytics' && <AptitudeAnalytics />}

      {/* ADMIN CONSOLE VIEW */}
      {activeTab === 'admin' && <AptitudeAdmin />}

      {/* TOPIC CONFIG MODAL */}
      <TopicConfigModal
        topic={selectedTopic}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onStartQuiz={handleStartQuizFromConfig}
      />
    </div>
  );
}
