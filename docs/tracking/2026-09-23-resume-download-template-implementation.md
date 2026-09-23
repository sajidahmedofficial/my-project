<!-- agent-notes: { ctx: "TDD tracking document for strict resume download template and extraction rules", deps: ["test/resume-download-template-structure.test.js", "src/utils/resumePdfGenerator.js", "backend/services/resumeAnalyzer.service.js"], state: "active", last: "anti@2026-09-23" } -->

# Implementation Tracking: Strict Resume Download Structure & Extraction Rules

**Date:** 2026-09-23  
**Topic:** Resume Download Template Structure, AI & Rule-based Extraction Engine  
**Author:** Tara / Sato (TDD)  
**Status:** Completed  

---

## 1. Summary of Changes

- **User Specification & Requirements:**
  - When clicking "Download", the resume must strictly follow the specified template structure:
    - **Header:** `[Full Name]`, `[City, State, Zip Code] | [Phone Number] | [Professional Email Address] | [LinkedIn Profile URL]`
    - **Professional Summary:** 3-4 sentence concise paragraph synthesizing core expertise and achievements.
    - **Core Competencies & Skills:** 4 distinct categories: `Technical Skills`, `Industry Knowledge`, `Soft Skills`, `Languages`.
    - **Professional Experience:** `[Job Title]`, `[Company Name], [City, State] | [Month, Year] – [Month, Year]`, with all bullets formatted strictly as `Action + Metric + Impact: [details]`.
    - **Education:** `[Degree Earned]`, `[University Name], [City, State] | [Graduation Month, Year]`.
    - **Certifications:** `[Certification Name], [Issuing Organization] – [Year]`.
  - Visual styling: Clean single-column ATS-optimized A4 layout matching user screenshot/PDF with navy headers, divider rules, and clean typography.

- **Key Implementations:**
  1. **Strict Text and HTML/PDF Generators:**
     - Created `generateStructuredResumeText` and `generateFullResumeHtml` in `src/utils/resumePdfGenerator.js` and `frontend/src/utils/resumePdfGenerator.js`.
     - Supports both downloading the raw `.txt` template file (`downloadStructuredResumeText`) and generating/printing the styled ATS PDF (`downloadResumeAsPdf`).
  2. **Extraction Engine Updates (`resumeAnalyzer.service.js`):**
     - Updated AI extraction prompt with the strict schema: `location`, `portfolio`, `coreCompetencies` (technical, industry, soft, languages), `certifications`, and `structuredResumeText`.
     - Added robust fallback parsing functions: `extractCandidateLocation`, `extractCoreCompetencies`, `extractCertificationsList`, `formatStructuredResumeText`.
     - Enhanced `extractWorkExperiences` & `finalizeExperience` to ensure all bullets start with `Action + Metric + Impact:` and include location & date ranges.
     - Enhanced `extractEducationList` to handle combined single-line and multi-line degree/institution patterns without dropping school names.
  3. **UI Preview & Download Actions:**
     - Updated `ResumePreview.jsx` in both `src/` and `frontend/` to display the exact template structure and provide direct download options (PDF Print and TXT).
     - Enhanced `ResumeAnalyzer.jsx` to pass complete candidate data, categorized competencies, and certifications to both the preview and download handlers.

---

## 2. Test Verification

- **TDD Test Suite:** [test/resume-download-template-structure.test.js](file:///c:/Users/Administrator/.gemini/antigravity/scratch/skillbridge-ai/test/resume-download-template-structure.test.js)
  - **Test 1:** Validates `generateStructuredResumeText` output structure, headers, pipes, and `Action + Metric + Impact:` bullets — **Passed**
  - **Test 2:** Validates `generateFullResumeHtml` contains clean ATS formatting, header classes, and valid HTML — **Passed**
  - **Test 3:** Validates `analyzeResume` extracts location, categorized competencies, normalized bullets, and `structuredResumeText` — **Passed**

- **Regression Test Suites:**
  - `test/resumeAnalyzer.test.js` — **Passed**
  - `test/resume-experience-parsing.test.js` — **Passed**
  - `test/resume-name-parsing.test.js` — **Passed**
  - `test/separate-roles.test.js` — **Passed**
  - `test/target-industries.test.js` — **Passed**
  - Production build (`npm run build`) — **Passed with 0 errors**
  - Linter (`npx oxlint`) — **Passed with 0 errors**

---

## 3. Results & Status

The resume analysis, preview, and download pipeline now strictly conforms to the requested template structure, ATS visual guidelines, and extraction framework across both backend parsing and frontend download generation.
