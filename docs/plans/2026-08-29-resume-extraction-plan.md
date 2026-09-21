---
agent-notes: { ctx: "plan for multi-section resume extraction (personal info, education, experience, skills)", deps: ["backend/services/resumeAnalyzer.service.js", "src/components/OnboardingWizard.jsx"], state: active, last: "pat@2026-08-29" }
---

# Plan: Multi-Section Resume Extraction (Personal Info, Education, Experience, & Skills)

**Goal:** Ensure resume analysis extracts and populates Personal Info, Education, Work Experience / Internships, Professional Summary, and Skills consistently from both AI (Gemini) and heuristic rule-based fallbacks.

## Architecture Gate Scan
- **Gated items:** None. No new architectural patterns, database schemas, or third-party frameworks are required.

## Approach
1. Update Gemini prompt schema in [`backend/services/resumeAnalyzer.service.js`](file:///home/yourname/projects/skillbridge/backend/services/resumeAnalyzer.service.js) to specify full typed object structures for education and experience arrays instead of empty arrays.
2. Add backend normalization in `analyzeResume()` to guarantee consistent key names (`school`, `degree`, `field`, `year`, `company`, `role`, `startDate`, `endDate`, `duration`, `description`).
3. Refine frontend mapping in [`src/components/OnboardingWizard.jsx`](file:///home/yourname/projects/skillbridge/src/components/OnboardingWizard.jsx) to reliably bind all extracted fields and log raw response payloads.
4. Verify with automated test suites across all scenarios (100% pass rate).

## Acceptance Criteria
- Uploading a resume with candidate contact details, education, and internship populates all respective form fields on the Profile Review step.
- Uploading an empty/corrupted file leaves fields blank without hallucinating fake demo data.
