import React from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { JOB_PRESETS } from '../utils/mockData';
import { analyzeJobDescription, detectSkillGap } from '../utils/aiSimulator';

export default function JobAnalyzer({ profile, onGenerateRoadmap }) {
  const [jdText, setJdText] = React.useState("");
  const [analyzing, setAnalyzing] = React.useState(false);
  
  // Results states
  const [jobProfile, setJobProfile] = React.useState(null);
  const [gapReport, setGapReport] = React.useState(null);

  const handleSelectPreset = (preset) => {
    setJdText(preset.description);
    setJobProfile(null);
    setGapReport(null);
  };

  const handleAnalyze = () => {
    if (!jdText.trim()) return;

    setAnalyzing(true);
    setJobProfile(null);
    setGapReport(null);

    // Simulate AI parsing and diffing
    setTimeout(() => {
      const jobExtracted = analyzeJobDescription(jdText);
      const gapResults = detectSkillGap(profile.skills, jobExtracted.requiredSkills);
      
      setJobProfile(jobExtracted);
      setGapReport(gapResults);
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-accent-purple" /> Job Description & Skill Gap Analyzer
        </h2>
        <p className="text-xs text-gray-400">Paste a job description to extract core competencies and perform automated skill gap diffing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Inputs & Presets */}
        <div className="space-y-6">
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Paste Job Description</h3>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste a full job description here (responsibilities, requirements, qualifications)..."
              rows={8}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple resize-none leading-relaxed"
            />
            <button
              onClick={handleAnalyze}
              disabled={!jdText.trim() || analyzing}
              className="w-full py-2.5 rounded-lg bg-accent-purple text-white font-semibold text-xs hover:bg-opacity-95 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-accent-purple/10"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Gaps...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Compare Skills
                </>
              )}
            </button>
          </div>

          {/* Job presets */}
          <div className="glass rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Select Target Company Preset</h3>
            <div className="space-y-2">
              {JOB_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="w-full text-left p-3 rounded-lg border border-gray-800 hover:border-gray-700 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white block">{preset.company}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{preset.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Extracted Gaps & Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {analyzing && (
            <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
              <div className="w-12 h-12 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Comparing Skill Structures...</h4>
                <p className="text-xs text-gray-500">Extracting entity constraints and generating delta reports</p>
              </div>
            </div>
          )}

          {!analyzing && gapReport && jobProfile && (
            <div className="glass rounded-xl p-6 space-y-6">
              {/* Gap Header Score */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg ${gapReport.matchScore >= 75 ? 'bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 shadow-emerald-500/10' : gapReport.matchScore >= 50 ? 'bg-amber-500/10 border-2 border-amber-500 text-amber-400 shadow-amber-500/10' : 'bg-red-500/10 border-2 border-red-500 text-red-400 shadow-red-500/10'}`}>
                    <span className="text-xl font-bold leading-none">{gapReport.matchScore}%</span>
                    <span className="text-[9px] text-gray-400 font-medium mt-0.5">Match</span>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-white">Skill Sync Results</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Target role asks for <span className="text-white font-medium">{jobProfile.experience}</span>
                    </p>
                  </div>
                </div>

                {gapReport.missingSkills.length > 0 && (
                  <button
                    onClick={() => onGenerateRoadmap(gapReport.missingSkills)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-accent-purple/10 self-start md:self-center"
                  >
                    Generate Roadmap <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Skills Diff details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Skills (Green) */}
                <div className="p-4 rounded-xl border border-gray-800 bg-white/5 space-y-3">
                  <h4 className="text-xs uppercase font-bold text-gray-400 flex items-center gap-1.5 tracking-wider">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Matched Skills ({gapReport.matchedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {gapReport.matchedSkills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {skill}
                      </span>
                    ))}
                    {gapReport.matchedSkills.length === 0 && (
                      <span className="text-xs text-gray-500 italic">No matching skills found</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills (Red) */}
                <div className="p-4 rounded-xl border border-gray-800 bg-white/5 space-y-3">
                  <h4 className="text-xs uppercase font-bold text-gray-400 flex items-center gap-1.5 tracking-wider">
                    <XCircle className="w-4 h-4 text-red-500" /> Missing Skills ({gapReport.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {gapReport.missingSkills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        {skill}
                      </span>
                    ))}
                    {gapReport.missingSkills.length === 0 && (
                      <span className="text-xs text-emerald-400 italic">Excellent! Zero gaps found</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Other specs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Extracted Required Tools</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {jobProfile.tools.map((tool, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs rounded bg-gray-800 text-gray-300 border border-gray-700">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Core Responsibilities</h4>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {jobProfile.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-purple mt-1.5 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!analyzing && !gapReport && (
            <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px] border-dashed border-gray-800">
              <AlertCircle className="w-12 h-12 text-gray-600" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Waiting for comparison payload</h4>
                <p className="text-xs text-gray-500">Select a company preset or paste a job description on the left to analyze gaps</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
