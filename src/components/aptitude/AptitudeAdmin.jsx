// agent-notes: { ctx: "Clean minimal SaaS Admin Question Management console with 50-Batch AI Generation Pipeline, tracking topic, batchNumber & metrics", deps: ["lucide-react", "../../services/aptitudeApi", "../../data/aptitudeTopics"], state: "active", last: "anti@2026-08-27" }

import React, { useState, useEffect } from 'react';
import { Database, Upload, Cpu, Play, Pause, RefreshCw, Layers } from 'lucide-react';
import { aptitudeApi } from '../../services/aptitudeApi';
import { ALL_87_TOPICS } from '../../data/aptitudeTopics';

export default function AptitudeAdmin() {
  const [activeTab, setActiveTab] = useState('batch'); // 'batch', 'generator', 'import'
  const [selectedTopic, setSelectedTopic] = useState('percentage');
  const [batchTracker, setBatchTracker] = useState(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Single AI Generator Tab State
  const [singleTopic, setSingleTopic] = useState('percentage');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [generateCount, setGenerateCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  useEffect(() => {
    fetchBatchStatus(selectedTopic);
  }, [selectedTopic]);

  // Poll batch tracker status every 2 seconds when a batch is running
  useEffect(() => {
    let interval = null;
    if (isBatchRunning) {
      interval = setInterval(() => {
        fetchBatchStatus(selectedTopic);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBatchRunning, selectedTopic]);

  const fetchBatchStatus = async (topicId) => {
    try {
      const tracker = await aptitudeApi.adminGetBatchStatus(topicId);
      setBatchTracker(tracker);
      if (tracker && tracker.status === 'in_progress') {
        setIsBatchRunning(true);
      } else {
        setIsBatchRunning(false);
      }
    } catch (err) {
      console.error('Error fetching batch status:', err);
    }
  };

  const handleStart50Batches = async () => {
    setIsBatchRunning(true);
    try {
      const res = await aptitudeApi.adminStartBatch({ topicId: selectedTopic, maxBatches: 50 });
      setBatchTracker(res.tracker);
    } catch (err) {
      console.error('Error starting batch:', err);
      setIsBatchRunning(false);
    }
  };

  const handlePauseBatch = async () => {
    try {
      const res = await aptitudeApi.adminPauseBatch({ topicId: selectedTopic });
      setBatchTracker(res.tracker);
      setIsBatchRunning(false);
    } catch (err) {
      console.error('Error pausing batch:', err);
    }
  };

  const handleRunSingleBatch = async () => {
    try {
      const res = await aptitudeApi.adminExecuteSingleBatch({ topicId: selectedTopic });
      setBatchTracker(res.tracker);
    } catch (err) {
      console.error('Error executing single batch:', err);
    }
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);
    try {
      const res = await aptitudeApi.adminGenerateAI({
        topicId: singleTopic,
        difficulty: selectedDifficulty,
        count: generateCount
      });
      setGeneratedResult(res);
    } catch (err) {
      console.error('AI Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      const res = await aptitudeApi.adminImport({ questions: Array.isArray(parsed) ? parsed : [parsed] });
      setImportStatus(`Imported: ${res.inserted || 0} | Rejected: ${res.rejected || 0}`);
    } catch (err) {
      setImportStatus(`JSON Parse Error: ${err.message}`);
    }
  };

  const progressPercent = batchTracker && batchTracker.totalBatches > 0 
    ? Math.round((batchTracker.batchNumber / batchTracker.totalBatches) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* Header */}
      <div className="saas-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="saas-badge saas-badge-indigo text-[10px]">
              <Database className="w-3 h-3" /> Question Pipeline
            </span>
            <span className="text-xs text-slate-500">87 Topics Loaded</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Admin Question Bank & Batch Generator Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage 87 topics, 50-batch execution @ 20 Qs/request, validation & AI pipeline</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('batch')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'batch' 
              ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1.5" /> 50-Batch AI Generator
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'generator' 
              ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 inline mr-1.5" /> Single Request Generator
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'import' 
              ? 'bg-indigo-600 text-white shadow-sm font-semibold' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-3.5 h-3.5 inline mr-1.5" /> Bulk JSON Import
        </button>
      </div>

      {/* 50-BATCH GENERATOR TAB */}
      {activeTab === 'batch' && (
        <div className="space-y-5">
          {/* Topic Selector Toolbar */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="w-full md:w-1/2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wider">
                  Select Target Aptitude Topic (87 Available)
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs p-2.5 rounded-lg focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {ALL_87_TOPICS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 md:pt-0">
                {!isBatchRunning ? (
                  <button
                    onClick={handleStart50Batches}
                    className="saas-btn-primary py-2 px-4 text-xs font-medium gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Start 50-Batch Process (1,000 Qs)
                  </button>
                ) : (
                  <button
                    onClick={handlePauseBatch}
                    className="py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" /> Pause Batch Execution
                  </button>
                )}

                <button
                  onClick={handleRunSingleBatch}
                  className="saas-btn-secondary py-2 px-3.5 text-xs font-medium gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Run 1 Batch (20 Qs)
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Tracking Dashboard */}
          {batchTracker && (
            <div className="saas-card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block">
                    {batchTracker.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{batchTracker.topic} - Batch Tracker Metrics</h3>
                </div>

                <span className={`saas-badge ${
                  batchTracker.status === 'completed' 
                    ? 'saas-badge-success' 
                    : batchTracker.status === 'in_progress'
                    ? 'saas-badge-indigo animate-pulse'
                    : ''
                }`}>
                  {batchTracker.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Batch Completion Progress</span>
                  <span className="text-indigo-600 font-mono font-semibold">{batchTracker.batchNumber} / {batchTracker.totalBatches} Batches ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Current Batch</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">{batchTracker.batchNumber} <span className="text-xs text-slate-400">/ 50</span></span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Generated Qs Count</span>
                  <span className="text-lg font-bold text-emerald-600 font-mono">{batchTracker.generatedCount} <span className="text-xs text-slate-400">/ 1000</span></span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Failed / Skipped</span>
                  <span className="text-lg font-bold text-amber-600 font-mono">{batchTracker.failedCount}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Questions Per Request</span>
                  <span className="text-lg font-bold text-indigo-600 font-mono">20 Qs</span>
                </div>
              </div>

              {/* Recent Batch Execution History Log Table */}
              {batchTracker.history && batchTracker.history.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Batch History Log ({batchTracker.history.length} Batches Completed)
                  </h4>
                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Batch</th>
                          <th className="p-2.5">Requested</th>
                          <th className="p-2.5">Generated</th>
                          <th className="p-2.5">Failed</th>
                          <th className="p-2.5">Difficulty</th>
                          <th className="p-2.5">Source</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                        {batchTracker.history.slice().reverse().map((h, i) => (
                          <tr key={i} className="hover:bg-slate-50/80">
                            <td className="p-2.5 font-semibold text-slate-900">Batch {h.batchNumber}</td>
                            <td className="p-2.5">{h.questionsRequested}</td>
                            <td className="p-2.5 text-emerald-600 font-semibold">+{h.generatedCount}</td>
                            <td className="p-2.5 text-amber-600">{h.failedCount}</td>
                            <td className="p-2.5 capitalize">{h.difficulty}</td>
                            <td className="p-2.5 text-[11px] text-slate-500">{h.source || 'ai'}</td>
                            <td className="p-2.5">
                              <span className="saas-badge saas-badge-success text-[9px]">
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SINGLE AI GENERATOR TAB */}
      {activeTab === 'generator' && (
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Single AI Batch Generator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">Topic</label>
              <select
                value={singleTopic}
                onChange={(e) => setSingleTopic(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                {ALL_87_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">Question Count</label>
              <input
                type="number"
                min="1"
                max="50"
                value={generateCount}
                onChange={(e) => setGenerateCount(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="saas-btn-primary py-2 px-4 text-xs font-medium gap-1.5 disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            {isGenerating ? 'Generating Questions with Gemini AI...' : 'Generate Questions'}
          </button>

          {generatedResult && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-semibold text-slate-900 block">Generation Result:</span>
              <p className="text-slate-600">Saved {generatedResult.count || 0} questions to topic database.</p>
            </div>
          )}
        </div>
      )}

      {/* BULK JSON IMPORT TAB */}
      {activeTab === 'import' && (
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Bulk JSON Question Import</h3>
          <p className="text-xs text-slate-500">Paste JSON array of aptitude question objects to seed database directly.</p>
          <textarea
            rows={10}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='[ { "topicId": "percentage", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..." } ]'
            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
          />
          <button
            onClick={handleBulkImport}
            className="saas-btn-primary py-2 px-4 text-xs font-medium gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Import Questions JSON
          </button>

          {importStatus && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
              {importStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
