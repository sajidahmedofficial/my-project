// agent-notes: { ctx: "Admin Question Management console with 50-Batch AI Generation Pipeline, tracking topic, batchNumber, generatedCount, failedCount & status", deps: ["lucide-react", "../../services/aptitudeApi", "../../data/aptitudeTopics"], state: "active", last: "anti@2026-08-04" }

import React, { useState, useEffect } from 'react';
import { Database, Plus, Upload, Cpu, CheckCircle2, AlertTriangle, Play, Pause, RefreshCw, Layers } from 'lucide-react';
import { aptitudeApi } from '../../services/aptitudeApi';
import { ALL_87_TOPICS } from '../../data/aptitudeTopics';

export default function AptitudeAdmin() {
  const [activeTab, setActiveTab] = useState('batch'); // 'batch', 'generator', 'import', 'create'
  const [selectedTopic, setSelectedTopic] = useState('percentage');
  const [batchTracker, setBatchTracker] = useState(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Single AI Generator Tab State
  const [singleTopic, setSingleTopic] = useState('percentage');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [generateCount, setGenerateCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  // Form State for Single Manual Creation
  const [manualForm, setManualForm] = useState({
    topicId: 'percentage',
    category: 'Quantitative Aptitude',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '0',
    explanation: '',
    difficulty: 'medium'
  });

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
    <div className="space-y-6 animate-fade-in">
      <div className="glass rounded-3xl p-6 border border-card-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-accent-pink" /> Admin Question Bank & Batch Generator Engine
          </h2>
          <p className="text-xs text-gray-400 mt-1">Manage 87 topics, 50-batch execution @ 20 Qs/request, validation & AI pipeline</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('batch')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'batch' ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white shadow-lg' : 'bg-gray-900 text-gray-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1.5" /> 50-Batch AI Generator
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'generator' ? 'bg-accent-purple text-white' : 'bg-gray-900 text-gray-400'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 inline mr-1.5" /> Single Request Generator
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'import' ? 'bg-accent-purple text-white' : 'bg-gray-900 text-gray-400'
          }`}
        >
          <Upload className="w-3.5 h-3.5 inline mr-1.5" /> Bulk JSON Import
        </button>
      </div>

      {/* 50-BATCH GENERATOR TAB */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          {/* Topic Selector Toolbar */}
          <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="w-full md:w-1/2">
                <label className="text-xs font-bold text-gray-300 block uppercase tracking-wider mb-2">Select Target Aptitude Topic (87 Available)</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white text-xs p-3 rounded-xl focus:border-accent-purple focus:outline-none"
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
                    className="py-3 px-5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" /> Start 50-Batch Process (1,000 Qs)
                  </button>
                ) : (
                  <button
                    onClick={handlePauseBatch}
                    className="py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all"
                  >
                    <Pause className="w-4 h-4 fill-current" /> Pause Batch Execution
                  </button>
                )}

                <button
                  onClick={handleRunSingleBatch}
                  className="py-3 px-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Run 1 Batch (20 Qs)
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Tracking Dashboard */}
          {batchTracker && (
            <div className="glass rounded-2xl p-6 border border-gray-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-accent-pink uppercase tracking-wider block">
                    {batchTracker.category}
                  </span>
                  <h3 className="text-lg font-black text-white">{batchTracker.topic} - Batch Tracker Metrics</h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                  batchTracker.status === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : batchTracker.status === 'in_progress'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                    : 'bg-gray-800 text-gray-400 border-gray-700'
                }`}>
                  {batchTracker.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-300">
                  <span>Batch Completion Progress</span>
                  <span className="text-accent-pink font-mono">{batchTracker.batchNumber} / {batchTracker.totalBatches} Batches ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-gray-950 rounded-full h-3 overflow-hidden border border-gray-800 p-0.5">
                  <div
                    className="bg-gradient-to-r from-accent-purple via-pink-500 to-accent-pink h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Current Batch</span>
                  <span className="text-xl font-black text-white font-mono">{batchTracker.batchNumber} <span className="text-xs text-gray-500">/ 50</span></span>
                </div>

                <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Generated Qs Count</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{batchTracker.generatedCount} <span className="text-xs text-gray-500">/ 1000</span></span>
                </div>

                <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Failed / Skipped</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{batchTracker.failedCount}</span>
                </div>

                <div className="bg-gray-950/80 p-4 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Questions Per Request</span>
                  <span className="text-xl font-black text-accent-purple font-mono">20 Qs</span>
                </div>
              </div>

              {/* Recent Batch Execution History Log Table */}
              {batchTracker.history && batchTracker.history.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Batch History Log ({batchTracker.history.length} Batches Completed)</h4>
                  <div className="max-h-56 overflow-y-auto border border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-gray-900 text-gray-400 uppercase text-[10px]">
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
                      <tbody className="divide-y divide-gray-850 text-gray-300">
                        {batchTracker.history.slice().reverse().map((h, i) => (
                          <tr key={i} className="hover:bg-gray-900/50">
                            <td className="p-2.5 font-bold text-white">Batch {h.batchNumber}</td>
                            <td className="p-2.5">{h.questionsRequested}</td>
                            <td className="p-2.5 text-emerald-400 font-bold">+{h.generatedCount}</td>
                            <td className="p-2.5 text-amber-400">{h.failedCount}</td>
                            <td className="p-2.5 capitalize">{h.difficulty}</td>
                            <td className="p-2.5 text-gray-400 text-[10px]">{h.source}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

      {/* SINGLE GENERATOR TAB */}
      {activeTab === 'generator' && (
        <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Single Request Question Generator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Topic</label>
              <select
                value={singleTopic}
                onChange={(e) => setSingleTopic(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-white text-xs p-2.5 rounded-xl"
              >
                {ALL_87_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-white text-xs p-2.5 rounded-xl"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Quantity</label>
              <input
                type="number"
                value={generateCount}
                onChange={(e) => setGenerateCount(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 text-white text-xs p-2.5 rounded-xl"
              />
            </div>
          </div>

          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            {isGenerating ? <Cpu className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
            Run AI Generation & Validation Pipeline
          </button>

          {generatedResult && (
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Generated {generatedResult.generatedCount} Verified Questions
              </span>
              <pre className="text-[10px] font-mono text-gray-300 max-h-48 overflow-y-auto">
                {JSON.stringify(generatedResult.questions, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* JSON IMPORT TAB */}
      {activeTab === 'import' && (
        <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Bulk JSON Question Import</h3>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Paste JSON array of questions here: [{"id": "q1", "category": "Quantitative Aptitude", ...}]'
            rows={10}
            className="w-full bg-gray-950 border border-gray-800 text-emerald-400 font-mono text-xs p-4 rounded-xl"
          />
          <button
            onClick={handleBulkImport}
            className="py-3 px-6 rounded-xl bg-accent-purple hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import JSON to Question Bank
          </button>
          {importStatus && <div className="text-xs font-bold text-accent-pink">{importStatus}</div>}
        </div>
      )}
    </div>
  );
}
