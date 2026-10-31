// agent-notes: { ctx: "AI-generated study materials and notes component with exercises, interview Q&A, and markdown/pdf export", deps: ["lucide-react", "../../services/learningResourcesService"], state: "active", last: "sato@2026-10-31" }
import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Download, 
  Printer, 
  FileText, 
  Check, 
  HelpCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Save,
  RotateCw
} from 'lucide-react';
import { 
  exportNotesToMarkdown, 
  generateNotesPrintHtml 
} from '../../services/learningResourcesService';

export default function StudyMaterials({
  notes,
  stageNumber = 1,
  readTopics = [],
  personalNote = "",
  onToggleReadTopic,
  onSavePersonalNote,
  onRegenerateNotes
}) {
  const [localNoteText, setLocalNoteText] = useState(personalNote);
  const [isSavedNote, setIsSavedNote] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleDownloadMarkdown = () => {
    if (!notes) return;
    const md = exportNotesToMarkdown(notes);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notes.technology || 'Study'}_Stage_${stageNumber}_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    if (!notes) return;
    const html = generateNotesPrintHtml(notes);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const handleSaveNote = () => {
    if (onSavePersonalNote) {
      onSavePersonalNote(stageNumber, localNoteText);
      setIsSavedNote(true);
      setTimeout(() => setIsSavedNote(false), 2000);
    }
  };

  if (!notes) {
    return (
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
        No study materials currently loaded for this stage. Click below to generate notes.
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-3 border-t border-slate-100">
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              Study Materials & Notes
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> AI Generated
              </span>
            </h5>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onRegenerateNotes && (
            <button
              onClick={onRegenerateNotes}
              className="saas-btn-secondary py-1 px-2.5 text-[11px] gap-1"
              title="Regenerate notes"
            >
              <RotateCw className="w-3 h-3 text-slate-500" />
              <span>Regenerate</span>
            </button>
          )}

          <button
            onClick={handleDownloadMarkdown}
            className="saas-btn-secondary py-1 px-2.5 text-[11px] gap-1"
            title="Download Notes as Markdown"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>Markdown</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="saas-btn-secondary py-1 px-2.5 text-[11px] gap-1"
            title="Print or Save as PDF"
          >
            <Printer className="w-3 h-3 text-slate-500" />
            <span>PDF Print</span>
          </button>
        </div>
      </div>

      {/* Conceptual Overview */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Concept Overview
        </span>
        <p className="text-xs text-slate-700 leading-relaxed">
          {notes.overview}
        </p>
      </div>



      {/* Common Pitfalls & Solutions */}
      {notes.commonMistakes && notes.commonMistakes.length > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Common Pitfalls & How to Avoid Them</span>
          </div>
          <div className="space-y-1.5">
            {notes.commonMistakes.map((m, idx) => (
              <div key={idx} className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-amber-900">Mistake:</strong> {m.mistake}
                <div className="text-slate-600 pl-3 border-l-2 border-amber-300 mt-0.5">
                  <strong className="text-emerald-800">Fix:</strong> {m.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practice Exercises */}
      {notes.practiceExercises && notes.practiceExercises.length > 0 && (
        <div className="p-3.5 rounded-lg bg-indigo-50/40 border border-indigo-100 space-y-2">
          <span className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider block">
            Practice Exercises & Revision Tasks
          </span>
          <div className="space-y-2">
            {notes.practiceExercises.map((ex, idx) => (
              <div key={idx} className="text-xs text-slate-800">
                <span className="font-semibold text-indigo-700">Task {idx + 1}:</span> {ex.task}
                <p className="text-[11px] text-slate-500 italic mt-0.5">
                  Hint: {ex.solutionHint}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Interview Preparation */}
      {notes.interviewQuestions && notes.interviewQuestions.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="w-full text-left p-3 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-900">
                Interview Questions & Revision ({notes.interviewQuestions.length})
              </span>
            </div>
            {showQuestions ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {showQuestions && (
            <div className="p-3.5 space-y-3 border-t border-slate-100">
              {notes.interviewQuestions.map((iq, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-900">
                    Q{idx + 1}: {iq.question}
                  </p>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {iq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Personal Notes Editor */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>My Personal Stage Notes</span>
          </label>
          {isSavedNote && (
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Saved!
            </span>
          )}
        </div>

        <textarea
          rows={3}
          value={localNoteText}
          onChange={(e) => setLocalNoteText(e.target.value)}
          placeholder="Jot down personal takeaways, commands to remember, or key snippets for this stage..."
          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveNote}
            className="saas-btn-primary py-1 px-3 text-[11px] gap-1"
          >
            <Save className="w-3 h-3" />
            <span>Save Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
