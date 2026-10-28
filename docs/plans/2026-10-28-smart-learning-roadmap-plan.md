---
agent-notes: { ctx: "plan for smart learning roadmap with youtube, free courses, notes, and progress", deps: ["src/components/LearningRoadmap.jsx", "src/services/learningResourcesService.js"], state: active, last: "pat@2026-10-28" }
---

# Plan: SkillBridge AI — Smart Learning Roadmap, Free Courses, YouTube Tutorials & AI Study Materials

**Goal:** Upgrade the existing Learning Roadmap into a personalized learning platform with stage-wise YouTube tutorials, verified free courses from Google & top tech companies, dynamic course discovery, AI study materials/notes with export capabilities, and persistent progress tracking via Supabase and LocalStorage.

## Architecture Gate Scan
- **Gated items:** None. Reuses existing React frontend, Tailwind/SaaS design tokens, Supabase persistence layer with offline fallback, and existing API structure.

## Core Features to Implement
1. **Stage-Wise YouTube Learning Resources:**
   - Add a `YouTube Learning Resources` section inside each expanded roadmap stage.
   - Intelligently match stage skill, level, topics, and practical tasks to verified educational YouTube tutorials (freeCodeCamp, Traversy Media, Programming with Mosh, Fireship, CS50, Academind, Net Ninja, etc.).
   - Support accurate fallback search queries for arbitrary skills and custom stages.
   - Display video title, channel, duration, skill covered, thumbnail, and "Watch Tutorial" button opening in a new tab.
   - Mark as completed or save for later.

2. **Free Online Courses from Google & Tech Companies:**
   - Add a `Free Online Courses` section inside each stage.
   - Curated catalog of verified free courses from Google Skills, Google Developers, Grow with Google, Microsoft Learn, AWS Skill Builder, IBM SkillsBuild, Cisco Networking Academy, Oracle University, freeCodeCamp, and Kaggle Learn.
   - Card details: provider, title, skills covered, level, duration, language, verified official URL, free-access status badge, digital badge/certificate badge, "Start Free Course" button, and "Save for Later".
   - Clear filtering: provider, difficulty, certificate availability, free status.

3. **Dynamic Course Discovery System:**
   - Catalog auto-refresh with last verified timestamp.
   - "Recently Added" badge for newly discovered courses.
   - Admin/user "Refresh Courses" action with deduplication and error resilience.

4. **AI-Generated Study Materials & Notes:**
   - Add a `Study Materials & Notes` section inside each stage.
   - Stage- and technology-specific notes (React, Python, JavaScript, Java, C++, SQL, AI/ML, Cloud) containing explanations, syntax-highlighted code examples, common pitfalls, exercises, and interview questions.
   - Notes editor for personal note taking.
   - Markdown (`.md`) and clean printable PDF/HTML export.
   - On-demand caching and regenerate action.

5. **Personalized Learning & Supabase Persistence:**
   - Track tutorial completion, course status (not started / in progress / completed), study topics read, and user personal notes.
   - Resume learning indicator for last completed item.
   - Integrated with Supabase `user_progress` / resource tracking and localStorage fallback.

6. **Preserve Existing UI:**
   - Keep stage accordions, core modules & checkboxes, hands-on practice tasks, checkpoint projects, capstone project, and skill certification test actions intact.

## TDD Plan
1. **Red:** Write comprehensive test suite in `test/learning-roadmap-enhancements.test.js` validating:
   - YouTube resource generation and search fallback formatting.
   - Free course catalog matching, provider attribution, certificate tagging, and filters.
   - Dynamic course refresh and duplicate prevention.
   - Study materials generation, Markdown export, and personal notes editing.
   - Progress persistence and resume-learning tracking.
2. **Green:** Implement `src/services/learningResourcesService.js` and Roadmap subcomponents (`YouTubeResources.jsx`, `FreeCourseCatalog.jsx`, `StudyMaterials.jsx`, `CourseFilters.jsx`). Update `LearningRoadmap.jsx`.
3. **Refactor:** Optimize performance, clean up CSS/Tailwind classes, ensure mobile responsiveness.
4. **Tracking:** Document completed work in `docs/tracking/2026-10-28-smart-learning-roadmap-implementation.md`.
