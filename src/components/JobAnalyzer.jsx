// agent-notes: { ctx: "Job Description and Skill Gap Analyzer with two separate inputs for user profile skills and target job description", deps: ["lucide-react", "../utils/mockData", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-05" }
import React from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Zap,
  RefreshCw,
  AlertCircle,
  UserCheck,
  ArrowDown
} from 'lucide-react';
import { JOB_PRESETS } from '../utils/mockData';
import { analyzeJobDescription, detectSkillGap, extractSkillsFromText } from '../utils/aiSimulator';

export default function JobAnalyzer({ profile, onGenerateRoadmap }) {
  // Input 1: User's Current Skills / Profile
  const [userSkillsText, setUserSkillsText] = React.useState(
    "I know HTML, CSS, JavaScript and React.\nI have basic knowledge of Node.js and SQL."
  );

  // Input 2: Target Job Description
  const [jdText, setJdText] = React.useState(
    `We are looking for a Full Stack Developer.

Requirements:
- Strong knowledge of HTML, CSS and JavaScript
- React.js
- Node.js
- Express.js
- MongoDB
- REST APIs
- Git and GitHub
- SQL`
  );

  const [analyzing, setAnalyzing] = React.useState(false);
  
  // Extracted and comparison results states
  const [extractedUserSkills, setExtractedUserSkills] = React.useState([]);
  const [extractedJobSkills, setExtractedJobSkills] = React.useState([]);
  const [jobProfile, setJobProfile] = React.useState(null);
  const [gapReport, setGapReport] = React.useState(null);

  // Auto-run analysis on initial mount so user sees immediate solution
  React.useEffect(() => {
    runComparison(userSkillsText, jdText);
  }, []);

  const runComparison = (userText, jobText) => {
    if (!userText.trim() || !jobText.trim()) return;

    setAnalyzing(true);

    setTimeout(() => {
      const uSkills = extractSkillsFromText(userText);
      const jProfile = analyzeJobDescription(jobText);
      const jSkills = extractSkillsFromText(jobText);
      const finalJobSkills = jSkills.length > 0 ? jSkills : jProfile.requiredSkills;

      const gapResults = detectSkillGap(uSkills, finalJobSkills);
      
      setExtractedUserSkills(uSkills);
      setExtractedJobSkills(finalJobSkills);
      setJobProfile(jProfile);
      setGapReport(gapResults);
      setAnalyzing(false);
    }, 600);
  };

  const handleAnalyze = () => {
    runComparison(userSkillsText, jdText);
  };

  const handleSelectPreset = (preset) => {
    setJdText(preset.description);
    runComparison(userSkillsText, preset.description);
  };

  const handleLoadProfileSkills = () => {
    if (profile && profile.skills && profile.skills.length > 0) {
      const profileText = `My current skills: ${profile.skills.join(', ')}.`;
      setUserSkillsText(profileText);
      runComparison(profileText, jdText);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-accent-purple" /> Job Description & Skill Gap Analyzer
        </h2>
        <p className="text-xs text-gray-400">
          Compare your current skills profile against target job requirements for automated skill gap diffing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2 Separate Inputs & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Input 1: Your Current Skills / Profile */}
          <div className="glass rounded-xl p-5 space-y-3 border border-gray-800 focus-within:border-accent-purple/50 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-purple/20 text-accent-purple text-xs flex items-center justify-center font-bold">1</span>
                Your Current Skills / Profile
              </h3>
              {profile && profile.skills && profile.skills.length > 0 && (
                <button
                  onClick={handleLoadProfileSkills}
                  className="text-[11px] text-accent-purple hover:underline flex items-center gap-1 font-medium"
                >
                  <UserCheck className="w-3 h-3" /> Load Saved Skills
                </button>
              )}
            </div>
            <textarea
              value={userSkillsText}
              onChange={(e) => setUserSkillsText(e.target.value)}
              placeholder="e.g. I know HTML, CSS, JavaScript and React. I have basic knowledge of Node.js and SQL."
              rows={4}
              className="w-full px-3 py-2 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple resize-none leading-relaxed"
            />
          </div>

          {/* Input 2: Target Job Description */}
          <div className="glass rounded-xl p-5 space-y-3 border border-gray-800 focus-within:border-accent-purple/50 transition-colors">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent-purple/20 text-accent-purple text-xs flex items-center justify-center font-bold">2</span>
              Target Job Description
            </h3>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste full job description, role requirements, or qualifications here..."
              rows={6}
              className="w-full px-3 py-2 bg-gray-900/80 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple resize-none leading-relaxed"
            />
          </div>

          {/* Compare Button */}
          <button
            onClick={handleAnalyze}
            disabled={!userSkillsText.trim() || !jdText.trim() || analyzing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-purple/20 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Skill Gap...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" /> Compare Skills
              </>
            )}
          </button>

          {/* Target Company Presets */}
          <div className="glass rounded-xl p-5 space-y-3 border border-gray-800">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Select Target Company Preset</h3>
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

        {/* Right Column: Skill Comparison Pipeline & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {analyzing && (
            <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="w-12 h-12 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Extracting & Diffing Skills...</h4>
                <p className="text-xs text-gray-500">Matching profile competencies against job description requirements</p>
              </div>
            </div>
          )}

          {!analyzing && gapReport && (
            <div className="glass rounded-xl p-6 space-y-6 border border-gray-800">
              {/* Header Match Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 ${
                    gapReport.matchScore >= 75 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-emerald-500/10' 
                      : gapReport.matchScore >= 50 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-amber-500/10' 
                      : 'bg-red-500/10 border-red-500 text-red-400 shadow-red-500/10'
                  }`}>
                    <span className="text-2xl font-black leading-none">{gapReport.matchScore}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-gray-300">Match</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Skill Sync Results</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Matched <span className="text-emerald-400 font-bold">{gapReport.matchedSkills.length}</span> out of{' '}
                      <span className="text-white font-bold">{extractedJobSkills.length}</span> job requirements
                    </p>
                    {jobProfile && (
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-[10px] font-semibold">
                        Role: {jobProfile.experience}
                      </span>
                    )}
                  </div>
                </div>

                {gapReport.missingSkills.length > 0 && (
                  <button
                    onClick={() => onGenerateRoadmap(gapReport.missingSkills)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-accent-purple/20 self-start sm:self-center"
                  >
                    Generate Roadmap <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Visual Flow Diagram Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Skill Comparison Flow</h4>
                
                {/* Flow Step 1: Extracted User Skills */}
                <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                    <span className="flex items-center gap-1.5 text-accent-purple font-bold">
                      YOUR SKILLS ({extractedUserSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedUserSkills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                        {skill}
                      </span>
                    ))}
                    {extractedUserSkills.length === 0 && (
                      <span className="text-xs text-gray-500 italic">No skills extracted from Input 1</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center text-gray-600">
                  <ArrowDown className="w-5 h-5 animate-pulse text-accent-purple" />
                </div>

                {/* Flow Step 2: Extracted Job Requirements */}
                <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                      JOB REQUIREMENTS ({extractedJobSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedJobSkills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {skill}
                      </span>
                    ))}
                    {extractedJobSkills.length === 0 && (
                      <span className="text-xs text-gray-500 italic">No skills extracted from Input 2</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center text-gray-600">
                  <ArrowDown className="w-5 h-5 animate-pulse text-accent-purple" />
                </div>

                {/* Flow Step 3: Skill Comparison (Matched vs Missing) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched Skills */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                    <h5 className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-1.5 tracking-wider">
                      <CheckCircle className="w-4 h-4 text-emerald-400" /> Matched Skills ({gapReport.matchedSkills.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {gapReport.matchedSkills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {skill}
                        </span>
                      ))}
                      {gapReport.matchedSkills.length === 0 && (
                        <span className="text-xs text-gray-500 italic">No matching skills found</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                    <h5 className="text-xs uppercase font-bold text-red-400 flex items-center gap-1.5 tracking-wider">
                      <XCircle className="w-4 h-4 text-red-400" /> Missing Skills ({gapReport.missingSkills.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {gapReport.missingSkills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/20 text-red-300 border border-red-500/30">
                          {skill}
                        </span>
                      ))}
                      {gapReport.missingSkills.length === 0 && (
                        <span className="text-xs text-emerald-400 italic font-medium">Perfect fit! No skill gaps detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Tools & Responsibilities */}
              {jobProfile && (
                <div className="pt-4 border-t border-gray-800 space-y-4">
                  {jobProfile.tools && jobProfile.tools.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Extracted Required Tools</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {jobProfile.tools.map((tool, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs rounded-lg bg-gray-800 text-gray-300 border border-gray-700">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {jobProfile.responsibilities && jobProfile.responsibilities.length > 0 && (
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
                  )}
                </div>
              )}
            </div>
          )}

          {!analyzing && !gapReport && (
            <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px] border-dashed border-gray-800">
              <AlertCircle className="w-12 h-12 text-gray-600" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Ready for Skill Gap Comparison</h4>
                <p className="text-xs text-gray-500">Provide your current skills and target job description on the left to calculate match percentage</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
