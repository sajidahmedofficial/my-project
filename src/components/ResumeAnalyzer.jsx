import React from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Plus, 
  Check, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Edit2
} from 'lucide-react';
import { analyzeResume } from '../utils/aiSimulator';
import { RESUME_PRESETS } from '../utils/mockData';

export default function ResumeAnalyzer({ profile, setProfile }) {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [parsing, setParsing] = React.useState(false);
  const [parsedData, setParsedData] = React.useState(null);
  
  // Local edit states
  const [editMode, setEditMode] = React.useState(false);
  const [editSkills, setEditSkills] = React.useState([]);
  const [newSkill, setNewSkill] = React.useState("");
  const [editEducation, setEditEducation] = React.useState("");
  const [editExperience, setEditExperience] = React.useState("");

  React.useEffect(() => {
    if (profile) {
      setEditSkills(profile.skills);
      setEditEducation(profile.education);
      setEditExperience(profile.experience);
    }
  }, [profile]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    setParsing(true);
    setParsedData(null);
    
    // Simulate AI parsing after 1.5s
    setTimeout(() => {
      const result = analyzeResume(file.name);
      setParsedData(result);
      setEditSkills(result.skills);
      setEditEducation(result.education);
      setEditExperience(result.experience);
      setParsing(false);
    }, 1500);
  };

  const handleLoadPreset = (preset) => {
    setSelectedFile({ name: `${preset.name.replace(/\s+/g, '_')}_Resume.pdf`, size: 104000 });
    setParsing(true);
    setParsedData(null);
    
    setTimeout(() => {
      setProfile(preset);
      setParsedData(preset);
      setEditSkills(preset.skills);
      setEditEducation(preset.education);
      setEditExperience(preset.experience);
      setParsing(false);
    }, 1000);
  };

  const handleApplyChanges = () => {
    const activeData = parsedData || profile;
    const scoreVal = Math.round(editSkills.length * 10);

    const updatedProfile = {
      ...activeData,
      skills: editSkills,
      education: editEducation,
      experience: editExperience,
      scores: {
        ...activeData.scores,
        skillScore: scoreVal,
        placementReadiness: Math.min(100, Math.round(activeData.scores.resumeScore * 0.5 + scoreVal * 0.5))
      }
    };
    
    setProfile(updatedProfile);
    setParsedData(updatedProfile);
    setEditMode(false);
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !editSkills.includes(newSkill.trim())) {
      setEditSkills([...editSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditSkills(editSkills.filter(s => s !== skillToRemove));
  };

  const currentDisplayData = parsedData || profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-purple" /> AI Resume Analyzer
          </h2>
          <p className="text-xs text-gray-400">Upload your resume to extract skills, project credentials, and calculate optimization scores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Upload & Presets */}
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Upload Document</h3>
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors relative ${dragActive ? 'border-accent-purple bg-accent-purple/5' : 'border-gray-800 hover:border-gray-700'}`}
            >
              <input 
                type="file" 
                id="resume-file-input" 
                className="hidden" 
                accept=".pdf,.docx" 
                onChange={handleFileChange}
              />
              <label htmlFor="resume-file-input" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-white block">Drag and drop file here</span>
                  <span className="text-[10px] text-gray-500 block">PDF or DOCX up to 5MB</span>
                </div>
                <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20 hover:bg-accent-purple/20">
                  Select File
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className="p-3 rounded-lg bg-white/5 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="w-8 h-8 text-accent-purple shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-white block truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-gray-500 block">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                {parsing && (
                  <RefreshCw className="w-4 h-4 text-accent-purple animate-spin" />
                )}
                {!parsing && parsedData && (
                  <Check className="w-4 h-4 text-accent-emerald" />
                )}
              </div>
            )}
          </div>

          {/* Preset switchers */}
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Preset Resume Switcher</h3>
              <p className="text-[10px] text-gray-400">Quickly toggle mock student profiles to inspect how features adapt dynamically</p>
            </div>
            <div className="space-y-3">
              {RESUME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1 ${profile.id === preset.id ? 'border-accent-purple/40 bg-accent-purple/5' : 'border-gray-800 hover:border-gray-700 bg-transparent'}`}
                >
                  <span className="font-semibold text-white block">{preset.name.split(' - ')[0]}</span>
                  <span className="text-[10px] text-gray-400 leading-relaxed">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Results & Editor */}
        <div className="lg:col-span-2 space-y-6">
          {parsing && (
            <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
              <div className="w-12 h-12 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
              <div className="space-y-1 animate-pulse">
                <h4 className="text-sm font-semibold text-white">Running AI Document Parsing...</h4>
                <p className="text-xs text-gray-500">Extracting entity structures, skills arrays, and education objects</p>
              </div>
            </div>
          )}

          {!parsing && currentDisplayData && (
            <div className="glass rounded-xl p-6 space-y-6">
              {/* Score header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent-purple/10 border-2 border-accent-purple flex flex-col items-center justify-center shadow-lg shadow-accent-purple/10">
                    <span className="text-xl font-bold text-white leading-none">{currentDisplayData.scores.resumeScore}</span>
                    <span className="text-[9px] text-gray-400 font-medium">Score</span>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-white">{currentDisplayData.name || "Extracted Profile"}</h3>
                    <p className="text-xs text-accent-emerald flex items-center gap-1.5 mt-0.5">
                      <FileCheck className="w-3.5 h-3.5" /> AI parsing completed successfully
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Refine Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditSkills(currentDisplayData.skills);
                          setEditEducation(currentDisplayData.education);
                          setEditExperience(currentDisplayData.experience);
                          setEditMode(false);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-transparent text-gray-400 hover:text-white font-semibold text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyChanges}
                        className="px-3.5 py-1.5 rounded-lg bg-accent-purple text-white hover:bg-opacity-95 font-semibold text-xs flex items-center gap-1.5 transition-opacity"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Editable Fields / Static Fields */}
              <div className="space-y-6">
                {/* 1. Skills tags */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Extracted Tech Skills</h4>
                  {editMode ? (
                    <div className="space-y-3">
                      <form onSubmit={addSkill} className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add new skill (e.g. Tailwind CSS)"
                          className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple grow"
                        />
                        <button type="submit" className="p-2 rounded-lg bg-accent-purple text-white hover:opacity-90">
                          <Plus className="w-4 h-4" />
                        </button>
                      </form>
                      <div className="flex flex-wrap gap-1.5">
                        {editSkills.map((skill, index) => (
                          <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-800 text-white border border-gray-700 flex items-center gap-1.5">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {currentDisplayData.skills.map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                          {skill}
                        </span>
                      ))}
                      {currentDisplayData.skills.length === 0 && (
                        <span className="text-xs text-gray-500 italic">No skills specified</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Projects */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Extracted Projects</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentDisplayData.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-gray-800 bg-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white truncate">{proj.title}</h5>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400 font-semibold">{proj.tech}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Education */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Education Credentials</h4>
                  {editMode ? (
                    <input
                      type="text"
                      value={editEducation}
                      onChange={(e) => setEditEducation(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-accent-purple"
                    />
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-800 bg-white/5 text-xs text-gray-300">
                      {currentDisplayData.education}
                    </div>
                  )}
                </div>

                {/* 4. Experience */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Experience Logs</h4>
                  {editMode ? (
                    <input
                      type="text"
                      value={editExperience}
                      onChange={(e) => setEditExperience(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-accent-purple"
                    />
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-800 bg-white/5 text-xs text-gray-300">
                      {currentDisplayData.experience}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!parsing && !currentDisplayData && (
            <div className="glass rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px] border-dashed border-gray-800">
              <AlertCircle className="w-12 h-12 text-gray-600" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">No active profile loaded</h4>
                <p className="text-xs text-gray-500">Upload a resume file on the left or select a student preset to populate data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
