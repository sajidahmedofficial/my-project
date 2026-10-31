<!-- agent-notes: { ctx: "Tracking implementation for dynamic target role badge and role synchronization in ResumeAnalyzer", deps: ["src/pages/ResumeAnalyzer.jsx", "frontend/src/pages/ResumeAnalyzer.jsx", "test/resume-analyzer-target-role-dynamic.test.js", "test/resume-target-role-dynamic.test.jsx"], state: "active", last: "sato@2026-10-31" } -->
# 2026-10-31 Dynamic Target Role in Resume Analyzer

## Problem Statement
The header badge in Resume Analyzer was hardcoded to `Full Stack Target` (`<span className="saas-badge text-[11px]">Full Stack Target</span>`). When users selected different tracks/skills (e.g. Frontend Developer, Cloud Architect, Data Engineer), the rest of the application reflected the selection, but the Resume Analyzer badge stubbornly showed "Full Stack Target", causing confusion.

## Changes Implemented
1. **Dynamic Target Role Resolution (`resolveTargetRole`):**
   - Resolves target role from `profile?.careerGoal`, `profile?.targetRole`, `profile?.role`, and `localStorage.getItem('sb_target_role')`.
   - Listens to global window `storage` events for instant reactive updates when the user switches tracks in other views.
2. **Dynamic Badge Formatting (`formatTargetRoleBadge`):**
   - Appends "Target" cleanly without duplication (e.g., "Frontend Developer" -> "Frontend Developer Target").
   - Added test identifier `data-testid="target-role-badge"`.
3. **Child Component Role Propagation:**
   - Propagated active target role to `FinalMasteryDashboard`, `CurrentResumeCard`, `UploadResume`, and `ResumePreview` across both `src/` and `frontend/src/`.
4. **Automated Testing & Verification:**
   - `test/resume-analyzer-target-role-dynamic.test.js` (7/7 node assertion tests passing).
   - `test/resume-target-role-dynamic.test.jsx` (6/6 vitest unit tests passing).
   - `npm run lint` (0 errors) and `npm run build` (clean Vite production build in 2.11s).
