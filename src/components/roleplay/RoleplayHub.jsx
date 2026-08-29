// agent-notes: { ctx: "Primary AI Roleplay and Simulation Hub managing scenario library, active dialogue sessions, history, and feedback", deps: ["lucide-react", "react", "../../services/roleplayApi"], state: "active", last: "anti@2026-08-29" }

import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, PlusCircle, History, Filter, Search, Award, Bot, RefreshCw, Layers } from 'lucide-react';
import { roleplayApi } from '../../services/roleplayApi.js';
import ScenarioCard from './ScenarioCard.jsx';
import ScenarioBuilderModal from './ScenarioBuilderModal.jsx';
import LiveRoleplayChat from './LiveRoleplayChat.jsx';
import RoleplayFeedbackView from './RoleplayFeedbackView.jsx';
import RoleplayHistory from './RoleplayHistory.jsx';

export default function RoleplayHub() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'active_session' | 'feedback' | 'history'
  const [scenarios, setScenarios] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isStartingId, setIsStartingId] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Active session state
  const [currentSession, setCurrentSession] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [scenariosRes, historyRes] = await Promise.allSettled([
        roleplayApi.getScenarios(),
        roleplayApi.getHistory()
      ]);

      if (scenariosRes.status === 'fulfilled' && scenariosRes.value?.scenarios) {
        setScenarios(scenariosRes.value.scenarios);
      }
      if (historyRes.status === 'fulfilled' && historyRes.value?.history) {
        setHistory(historyRes.value.history);
      }
    } catch (err) {
      console.error('[RoleplayHub] Initial load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (scenarioId) => {
    setIsStartingId(scenarioId);
    try {
      const res = await roleplayApi.startSession(scenarioId);
      if (res?.success) {
        setCurrentSession(res.session);
        setCurrentScenario(res.scenario);
        setCurrentMessages(res.messages || []);
        setCurrentFeedback(null);
        setActiveTab('active_session');
      }
    } catch (err) {
      console.error('[RoleplayHub] Start session failed:', err);
      alert(err.message || 'Failed to start roleplay session.');
    } finally {
      setIsStartingId(null);
    }
  };

  const handleSendMessage = async (content) => {
    if (!currentSession?.id) return;
    const res = await roleplayApi.sendMessage(currentSession.id, content);
    if (res?.success) {
      setCurrentMessages(prev => [...prev, res.userMessage, res.assistantMessage]);
      return res;
    }
  };

  const handleEndSession = async () => {
    if (!currentSession?.id) return;
    const res = await roleplayApi.endSession(currentSession.id);
    if (res?.success) {
      setCurrentSession(res.session);
      setCurrentFeedback(res.feedback);
      setActiveTab('feedback');
      // Refresh history in background
      roleplayApi.getHistory().then(h => {
        if (h?.history) setHistory(h.history);
      });
    }
  };

  const handleCreateScenario = async (scenarioData) => {
    const res = await roleplayApi.createScenario(scenarioData);
    if (res?.success && res.scenario) {
      setScenarios(prev => [res.scenario, ...prev]);
    }
  };

  const handleDeleteScenario = async (scenarioId) => {
    if (!confirm('Are you sure you want to delete this custom scenario?')) return;
    const res = await roleplayApi.deleteScenario(scenarioId);
    if (res?.success) {
      setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    }
  };

  const handleViewSessionHistory = async (sessionId) => {
    try {
      setLoading(true);
      const data = await roleplayApi.getSession(sessionId);
      if (data?.session) {
        setCurrentSession(data.session);
        setCurrentScenario(data.scenario);
        setCurrentMessages(data.messages || []);
        setCurrentFeedback(data.feedback);
        setActiveTab('feedback');
      }
    } catch (err) {
      console.error('[RoleplayHub] Error loading past session:', err);
      alert('Failed to load session details.');
    } finally {
      setLoading(false);
    }
  };

  // Filter scenarios
  const filteredScenarios = scenarios.filter(s => {
    const matchesCat = selectedCategory === 'all' || s.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery.trim() || 
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.persona_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.objective?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'interview', label: 'Tech & Hiring' },
    { id: 'career', label: 'Salary & Offers' },
    { id: 'workplace', label: 'Stakeholders' },
    { id: 'leadership', label: 'Crisis & Leadership' },
    { id: 'sales', label: 'Pitch & Consulting' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      {/* Top Banner (hidden during live session) */}
      {activeTab !== 'active_session' && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gradient-to-r from-indigo-900/90 via-indigo-800 to-slate-900 text-white rounded-3xl shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Communication & Roleplay Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Master High-Stakes Conversations
            </h1>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Rehearse tech screens, offer negotiations, and stakeholder pushbacks with dynamic in-character AI personas. Receive real-time coaching feedback and scored reports.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBuilderOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Create Custom Scene</span>
            </button>
          </div>

          {/* Background decorative glow */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Sub-view Navigation Tabs */}
      {activeTab !== 'active_session' && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Scenario Catalog ({scenarios.length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Session History ({history.length})</span>
            </button>
          </div>

          {activeTab === 'catalog' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search scenarios or personas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. SCENARIO CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading scenario library...</p>
            </div>
          ) : filteredScenarios.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Bot className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No scenarios found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No roleplay scenarios match your current search or category filter.
              </p>
              <button
                onClick={() => setIsBuilderOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                Write a Custom Scene
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((sc) => (
                <ScenarioCard
                  key={sc.id}
                  scenario={sc}
                  isStarting={isStartingId === sc.id}
                  onStart={handleStartSession}
                  onDelete={handleDeleteScenario}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ACTIVE LIVE ROLEPLAY VIEW */}
      {activeTab === 'active_session' && currentScenario && (
        <LiveRoleplayChat
          session={currentSession}
          scenario={currentScenario}
          initialMessages={currentMessages}
          onSendMessage={handleSendMessage}
          onEndSession={handleEndSession}
          onBack={() => {
            if (confirm('Leave roleplay session? Your current progress in this scene will be closed.')) {
              setActiveTab('catalog');
            }
          }}
        />
      )}

      {/* 3. FEEDBACK REPORT VIEW */}
      {activeTab === 'feedback' && currentScenario && (
        <RoleplayFeedbackView
          session={currentSession}
          scenario={currentScenario}
          feedback={currentFeedback}
          messages={currentMessages}
          onRetry={() => handleStartSession(currentScenario.id)}
          onNewScenario={() => setActiveTab('catalog')}
        />
      )}

      {/* 4. HISTORY VIEW */}
      {activeTab === 'history' && (
        <RoleplayHistory
          history={history}
          onViewSession={handleViewSessionHistory}
          onStartNew={() => setActiveTab('catalog')}
        />
      )}

      {/* Custom Scenario Builder Modal */}
      <ScenarioBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onCreate={handleCreateScenario}
      />
    </div>
  );
}
