// agent-notes: { ctx: "Unit tests for resume parser and structured AI resume analyzer", deps: ["../backend/services/resumeParser.service.js", "../backend/services/resumeAnalyzer.service.js"], state: "active", last: "anti@2026-08-29" }

import assert from 'assert';
import { extractResumeText } from '../backend/services/resumeParser.service.js';
import { analyzeResume } from '../backend/services/resumeAnalyzer.service.js';

async function runTests() {
  console.log('🧪 Starting Resume Parser & Analyzer unit tests...');

  // 1. Test plain text extraction
  const sampleText = `
    Alex Developer
    alex@example.com | github.com/alexdev | (555) 123-4567

    SUMMARY
    Senior Full Stack Engineer with 5+ years experience building React and Node.js applications.

    EXPERIENCE
    Software Engineer - Tech Corp (2021 - Present)
    - Developed UI components with React, TypeScript and Redux.
    - Optimized database queries in PostgreSQL, improving response time by 40%.
    - Built microservices in Node.js and Express handling 10k requests/minute.

    EDUCATION
    B.S. Computer Science - University (2020)

    SKILLS
    React, TypeScript, Node.js, Express, PostgreSQL, Git, Docker, REST API
  `;

  const parsed = await extractResumeText(Buffer.from(sampleText, 'utf-8'));
  assert(parsed.includes('Alex Developer'), 'Parser should extract text from buffer');
  console.log('✅ Buffer text extraction passed.');

  // 2. Test analysis with optional Job Description
  const sampleJD = `
    Senior Frontend Engineer
    Requirements:
    - 4+ years of React, TypeScript, Redux
    - Experience with GraphQL, AWS, CI/CD pipelines
    - Strong understanding of Web Performance & Core Web Vitals
  `;

  const result = await analyzeResume(parsed, { jobDescription: sampleJD });

  // Validate exact schema
  assert(typeof result.overall_score === 'number', 'overall_score must be a number');
  assert(result.overall_score >= 0 && result.overall_score <= 100, 'overall_score must be 0-100');
  
  assert(result.ats_compatibility && typeof result.ats_compatibility.score === 'number', 'ats_compatibility must contain score');
  assert(Array.isArray(result.ats_compatibility.formatting_issues), 'formatting_issues must be array');
  assert(Array.isArray(result.ats_compatibility.missing_standard_sections), 'missing_standard_sections must be array');
  assert(Array.isArray(result.ats_compatibility.parsing_risks), 'parsing_risks must be array');

  assert(result.keyword_gaps && Array.isArray(result.keyword_gaps.missing_keywords), 'missing_keywords must be array');
  assert(Array.isArray(result.keyword_gaps.matched_keywords), 'matched_keywords must be array');
  assert(typeof result.keyword_gaps.match_percentage === 'number', 'match_percentage must be number');

  assert(Array.isArray(result.section_feedback), 'section_feedback must be array');
  assert(result.section_feedback.length >= 1, 'section_feedback must contain entries');

  assert(Array.isArray(result.rewrite_suggestions), 'rewrite_suggestions must be array');
  assert(result.rewrite_suggestions.length >= 1, 'rewrite_suggestions must contain entries');
  assert(result.rewrite_suggestions[0].original && result.rewrite_suggestions[0].suggested, 'rewrite_suggestions must have before and after');

  assert(Array.isArray(result.strengths), 'strengths must be array');
  assert(result.strengths.length >= 1, 'strengths must have entries');

  console.log(`✅ Resume Analyzer returned verified schema with overall score: ${result.overall_score}/100.`);
  console.log(`   - Matched Keywords: ${result.keyword_gaps.matched_keywords.join(', ')}`);
  console.log(`   - Missing Keywords: ${result.keyword_gaps.missing_keywords.join(', ')}`);
  console.log(`   - Rewrites Generated: ${result.rewrite_suggestions.length}`);

  console.log('\n🎉 ALL RESUME ANALYZER TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
