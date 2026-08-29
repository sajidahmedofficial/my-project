// agent-notes: { ctx: "AI Resume Analyzer page with drag-and-drop PDF/DOCX parsing, JD matching, radial score gauge, and expandable feedback", deps: ["react", "react-router-dom", "../services/resumeApi"], state: "active", last: "anti@2026-08-29" }

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { analyzeResumeFile } from '../services/resumeApi.js';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const validateAndSetFile = (f) => {
    setError('');
    const validExts = ['.pdf', '.docx', '.doc'];
    const hasValidExt = validExts.some((ext) => f.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError('Please upload a valid PDF (.pdf) or Word document (.docx).');
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit. Please choose a smaller file.');
      return;
    }

    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      validateAndSetFile(dropped);
    }
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!file && !resumeText.trim()) {
      setError('Please upload a resume file or paste your resume text.');
      return;
    }

    setError('');
    setLoading(true);
    setLoadingStep('Uploading and extracting text…');

    try {
      setTimeout(() => setLoadingStep('Running ATS & keyword alignment models…'), 800);
      setTimeout(() => setLoadingStep('Generating section-by-section critiques & rewrites…'), 1800);

      const res = await analyzeResumeFile({
        file: useTextInput ? null : file,
        resumeText: useTextInput ? resumeText : '',
        jobDescription,
        targetRole
      });

      if (res?.analysis) {
        setResult(res.analysis);
      } else {
        throw new Error('Analysis response was empty.');
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResumeText('');
    setResult(null);
    setError('');
  };

  const handleCopyReport = () => {
    if (!result) return;
    const textReport = [
      `=== AI RESUME ANALYSIS REPORT ===`,
      `Overall Score: ${result.overall_score}/100`,
      `ATS Compatibility: ${result.ats_compatibility?.score}/100`,
      `Keyword Match: ${result.keyword_gaps?.match_percentage}%`,
      ``,
      `--- STRENGTHS ---`,
      ...(result.strengths || []).map((s) => `• ${s}`),
      ``,
      `--- KEYWORD GAPS ---`,
      `Missing: ${(result.keyword_gaps?.missing_keywords || []).join(', ') || 'None'}`,
      `Matched: ${(result.keyword_gaps?.matched_keywords || []).join(', ') || 'None'}`,
      ``,
      `--- REWRITE SUGGESTIONS ---`,
      ...(result.rewrite_suggestions || []).map((r, i) => 
        `[#${i + 1}] ORIGINAL: ${r.original}\nSUGGESTED: ${r.suggested}\nREASON: ${r.reason}\n`
      ),
      ``,
      `--- SECTION FEEDBACK ---`,
      ...(result.section_feedback || []).map((sf) => `[${sf.section}]: ${sf.feedback}`)
    ].join('\n');

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const score = result?.overall_score ?? 0;
  const getScoreColor = (s) => {
    if (s >= 80) return 'var(--teal)';
    if (s >= 60) return 'var(--spotlight)';
    return 'var(--coral)';
  };

  return (
    <div className="page" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>AI Resume Analyzer</h1>
          <p>Scan your resume for ATS compliance, keyword gaps, and get instant bullet-point rewrites.</p>
        </div>
        {result && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={handleCopyReport}>
              {copied ? '✓ Copied report' : 'Copy report'}
            </button>
            <button className="btn btn-primary" onClick={handleReset}>
              Analyze another
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* 1. UPLOAD & INPUT FORM (Visible when no result) */}
      {!result && (
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleAnalyze}>
            {/* Input Mode Toggle */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                className={`btn ${!useTextInput ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setUseTextInput(false)}
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                Upload File (PDF / DOCX)
              </button>
              <button
                type="button"
                className={`btn ${useTextInput ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setUseTextInput(true)}
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                Paste Resume Text
              </button>
            </div>

            {/* File Dropzone */}
            {!useTextInput ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: dragOver ? '2px dashed var(--spotlight)' : '2px dashed var(--line)',
                  borderRadius: '6px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: dragOver ? 'rgba(242, 183, 5, 0.05)' : 'var(--stage)',
                  cursor: 'pointer',
                  marginBottom: '24px',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {file ? (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--spotlight)', marginBottom: '6px' }}>
                      ✓ {file.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                      {(file.size / 1024).toFixed(1)} KB · Click or drag another file to replace
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--paper)', marginBottom: '6px' }}>
                      Drag and drop your resume here, or click to browse
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                      Supports PDF (.pdf) and Word documents (.docx) up to 5MB
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="field" style={{ marginBottom: '24px' }}>
                <label htmlFor="resumeText">Paste Plain Resume Text</label>
                <textarea
                  id="resumeText"
                  rows={8}
                  placeholder="Paste the full text of your resume here…"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Optional Target Job Description */}
            <div className="field" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <label htmlFor="jobDescription" style={{ margin: 0 }}>
                  Target Job Description <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <span style={{ fontSize: '12px', color: 'var(--spotlight)' }}>
                  Unlocks keyword gap & role matching
                </span>
              </div>
              <textarea
                id="jobDescription"
                rows={4}
                placeholder="Paste the target job description or requirements to identify missing skills and keyword matches…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || (!file && !resumeText.trim())}
              style={{ padding: '12px 20px', fontSize: '15px' }}
            >
              {loading ? (loadingStep || 'Analyzing resume…') : 'Run AI Resume Analysis'}
            </button>
          </form>
        </div>
      )}

      {/* 2. RESULTS VIEW */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Hero Score Ring & Summary */}
          <div className="score-hero">
            <div
              className="score-ring"
              style={{
                borderColor: getScoreColor(score),
                color: 'var(--paper)'
              }}
            >
              {score}
            </div>

            <div style={{ flex: 1 }}>
              <div className="section-label" style={{ margin: 0 }}>
                Overall ATS & Resume Score
              </div>
              <h3 style={{ margin: '6px 0 8px', fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>
                {score >= 85 ? 'Highly Competitive Resume' : score >= 70 ? 'Solid Foundation — Minor Tweaks Needed' : 'Actionable Improvements Required'}
              </h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
                ATS Compatibility Score: <strong style={{ color: 'var(--paper)' }}>{result.ats_compatibility?.score || score}/100</strong> • Keyword Match: <strong style={{ color: 'var(--paper)' }}>{result.keyword_gaps?.match_percentage || 70}%</strong>
              </p>
            </div>
          </div>

          {/* Strengths & ATS Compatibility 2-Column */}
          <div className="feedback-cols">
            {/* Strengths */}
            <div className="card strengths">
              <h4>What’s Working Well</h4>
              <ul>
                {(result.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* ATS Compatibility */}
            <div className="card improvements">
              <h4>ATS & Parsing Checks</h4>
              <ul>
                {(result.ats_compatibility?.formatting_issues || []).map((item, i) => (
                  <li key={`fmt-${i}`}>{item}</li>
                ))}
                {(result.ats_compatibility?.missing_standard_sections || []).map((sec, i) => (
                  <li key={`sec-${i}`}>Missing section header: <strong>{sec}</strong></li>
                ))}
                {(result.ats_compatibility?.parsing_risks || []).map((risk, i) => (
                  <li key={`risk-${i}`}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Keyword Gaps Grid */}
          <div className="card">
            <div className="section-label" style={{ margin: '0 0 12px' }}>
              Keyword & Skill Gap Analysis
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--coral)', fontWeight: 600, marginBottom: '8px' }}>
                  Missing Target Keywords
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(result.keyword_gaps?.missing_keywords || []).map((kw, i) => (
                    <span key={i} className="badge difficulty-hard">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', color: '#7fd9c3', fontWeight: 600, marginBottom: '8px' }}>
                  Matched Keywords Found
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(result.keyword_gaps?.matched_keywords || []).map((kw, i) => (
                    <span key={i} className="badge difficulty-easy">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Before & After Bullet Point Rewrites */}
          <div className="card">
            <div className="section-label" style={{ margin: '0 0 16px' }}>
              Actionable Bullet-Point Rewrites
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(result.rewrite_suggestions || []).map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                    background: 'var(--stage)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge" style={{ fontSize: '10px' }}>Recommendation #{i + 1}</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--coral)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      Original
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '2px', textDecoration: 'line-through' }}>
                      {item.original}
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11.5px', color: '#7fd9c3', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      AI Suggested Rewrite
                    </div>
                    <div style={{ color: 'var(--paper)', fontSize: '14.5px', fontWeight: 500, marginTop: '2px' }}>
                      {item.suggested}
                    </div>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--spotlight)', marginTop: '6px' }}>
                    <strong>Why it works:</strong> {item.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section-by-Section Critiques */}
          <div className="card">
            <div className="section-label" style={{ margin: '0 0 16px' }}>
              Section-by-Section Breakdown
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(result.section_feedback || []).map((sf, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 18px',
                    border: '1px solid var(--line)',
                    borderRadius: '5px',
                    background: 'var(--stage)'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--spotlight)', fontWeight: 700, marginBottom: '4px' }}>
                    {sf.section}
                  </div>
                  <div style={{ color: 'var(--paper)', fontSize: '14px', lineHeight: 1.55 }}>
                    {sf.feedback}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
