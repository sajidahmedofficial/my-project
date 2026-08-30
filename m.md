# SkillBridge AI — Master Full-Stack Integration & Automation Prompt

## Project

You are working on my existing application:

**SkillBridge AI — AI-Powered Skill Gap Analyzer & Career Guidance Platform**

Live website:

https://my-project-eta-sepia.vercel.app/

This is **not** a request to build a new application from scratch.

Inspect my existing SkillBridge AI project and **upgrade, repair, connect, and complete the existing application**.

The final product must work as **one complete AI career ecosystem**, not as separate disconnected pages.

---

## 1. First: Understand the Existing Project

Before changing code, inspect the complete project.

Analyze:

- Frontend
- Backend
- Routes
- Components
- Pages
- API services
- Database
- Authentication
- Resume upload
- Resume analyzer
- Career module
- Skill-gap analyzer
- Job Matrix
- Learning module
- Certifications
- AI Mentor
- Dashboard
- Profile
- Settings
- Environment variables
- Vercel configuration

Find:

- Broken functionality
- Duplicate functionality
- Disconnected pages
- Fake/mock data
- Hardcoded data
- Broken API calls
- Broken authentication
- Missing backend connections
- Incorrect routing
- Incorrect state management
- Resume duplication
- API key exposure
- Vercel deployment issues
- Console errors
- Runtime errors
- Build errors

### Important

Do not rewrite everything unnecessarily.

Reuse the existing SkillBridge AI UI and functionality wherever possible.

Fix the architecture instead of destroying working features.

---

## 2. Target SkillBridge AI User Journey

The entire application must follow this connected flow:

```text
LANDING PAGE
      ↓
LOGIN / REGISTER
      ↓
GOOGLE LOGIN / GITHUB LOGIN
      ↓
PROFILE SETUP
      ↓
DASHBOARD
      ↓
UPLOAD RESUME — ONLY ONCE
      ↓
RESUME PROCESSING
      ↓
RESUME ANALYZER
      ↓
CAREER ANALYSIS
      ↓
SKILL GAP ANALYSIS
      ↓
JOB MATRIX
      ↓
LEARNING ROADMAP
      ↓
CERTIFICATIONS
      ↓
AI MENTOR
      ↓
CAREER PROGRESS
      ↓
UPDATED RESUME
```

The user must never feel that they are opening unrelated applications.

Everything must use the same authenticated user and the same stored resume.

---

## 3. Authentication

Implement a real authentication system.

### Email

- Register
- Login
- Logout
- Password hashing
- Forgot password
- Reset password
- Session persistence
- Protected routes

### Google

Implement REAL Google OAuth.

Flow:

```text
Google Login
↓
Google OAuth
↓
Callback
↓
Verify user
↓
Create/find SkillBridge user
↓
Create session
↓
Dashboard
```

### GitHub

Implement REAL GitHub OAuth.

Flow:

```text
GitHub Login
↓
GitHub OAuth
↓
Callback
↓
Verify user
↓
Create/find SkillBridge user
↓
Create session
↓
Dashboard
```

Do NOT create fake social-login buttons.

---

## 4. After Login

When the user successfully logs in:

Check whether the user has completed their profile.

If profile incomplete:

```text
Login
↓
Profile Setup
↓
Dashboard
```

If profile already exists:

```text
Login
↓
Dashboard
```

Do not force existing users through onboarding again.

---

## 5. User Profile

The user's profile should contain information used by every AI feature.

Possible fields:

```text
name
email
phone
location
education
college
degree
graduationYear
experience
skills
careerGoal
targetRole
preferredLocation
```

The user must be able to edit this later.

The profile must be stored in the database.

---

## 6. Dashboard

The Dashboard is the central control center of SkillBridge AI.

It must display REAL user data.

Show:

### Resume

- Resume uploaded
- Resume name
- Resume score
- ATS score
- Last analyzed date
- Resume status

### Career

- Target career
- Career readiness score
- Recommended role
- Career progress

### Skills

- Current skills
- Missing skills
- Skill-gap percentage
- Skills gained

### Jobs

- Recommended jobs
- Job match percentage
- Saved jobs
- Applied jobs

### Learning

- Current learning path
- Completed skills
- Progress

### Certifications

- Available certifications
- Earned certifications

### AI Mentor

- Recent conversation
- Continue Mentor button

The Dashboard must retrieve this information from the backend.

**NO hardcoded dashboard statistics.**

---

## 7. Most Important Feature — One Resume Only

This is a critical requirement.

The user uploads their resume **ONE TIME**.

For example:

```text
Dashboard
↓
Upload Resume
↓
Resume stored
↓
Resume ID generated
↓
Resume text extracted
↓
Resume analyzed
```

After that, every feature automatically uses the same resume.

The user must NOT upload another resume on:

- Resume Analyzer
- Career
- Skill Gap
- Job Matrix
- Learning
- AI Mentor

---

## 8. Central Resume System

Create one source of truth for the user's resume.

Conceptually:

```text
User
  ↓
Resume
  ↓
Resume ID
  ↓
Resume Data
  ├── Personal Information
  ├── Education
  ├── Experience
  ├── Skills
  ├── Projects
  ├── Certifications
  └── Resume Analysis
```

Every page must retrieve the authenticated user's current resume.

Example:

```javascript
currentUser.resumeId
```

Then:

```text
resumeId
↓
Resume API
↓
Resume data
```

Do not duplicate resume objects separately in every page.

---

## 9. Resume Upload Flow

When a resume is uploaded:

```text
Upload
↓
Validate file
↓
Store file
↓
Extract text
↓
Parse resume
↓
Save structured resume
↓
Generate resume ID
↓
Run AI analysis
↓
Calculate resume score
↓
Calculate ATS score
↓
Extract skills
↓
Identify skill gaps
↓
Save results
↓
Update Dashboard
```

Supported formats:

- PDF
- DOCX

Validate:

- file type
- file size
- corrupted file
- empty document

---

## 10. Resume Analyzer

When the user opens **Resume Analyzer**, do NOT show another upload screen if the user already has a resume.

Instead:

```text
Existing Resume
↓
Automatically Load
↓
Analyze
```

The Resume Analyzer must identify:

### Grammar

- Grammar errors
- Spelling mistakes
- Sentence problems
- Incorrect wording

### Resume structure

- Missing sections
- Poor formatting
- Weak section organization
- ATS problems

### Content

- Weak bullet points
- Weak action verbs
- Repeated words
- Unclear achievements
- Missing measurable results

### Skills

- Existing skills
- Missing skills
- Important industry skills

### Career relevance

Compare the resume with the user's:

```text
careerGoal
targetRole
experience
skills
```

Generate:

```text
Resume Score
ATS Score
Grammar Issues
Content Issues
Skill Gaps
Recommendations
```

---

## 11. Apply Resume Fixes

Every suggested resume correction should have:

```text
Problem
↓
Suggested Solution
↓
Apply Change
```

When the user clicks **Apply Change**, actually update the stored resume.

Do NOT only change the visual UI.

After applying a change:

```text
Resume Updated
↓
Recalculate Resume Score
↓
Update ATS Score
↓
Update Skill Analysis
↓
Update Career Analysis
↓
Update Job Matching
↓
Update Dashboard
```

---

## 12. Resume Version History

Whenever meaningful resume changes occur, create versions:

```text
Resume v1
Resume v2
Resume v3
...
```

The newest version becomes the active resume.

All downstream features must use the latest active resume.

---

## 13. Career Page

The Career page must automatically use:

```text
User Profile
+
Current Resume
+
Current Skills
+
Experience
+
Career Goal
```

Do NOT request another upload.

Generate:

### Career recommendations

- Suitable careers
- Recommended job roles
- Required skills
- Missing skills
- Learning roadmap
- Career readiness

Example:

```text
Target Role:
Full Stack Developer

Career Readiness:
76%

Current Skills:
React
JavaScript
HTML
CSS
Node.js

Skill Gaps:
TypeScript
Docker
AWS
Testing
System Design
```

---

## 14. Skill Gap Analyzer

SkillBridge AI's core purpose is skill-gap analysis.

Compare:

```text
USER SKILLS
        VS
TARGET ROLE REQUIREMENTS
```

Calculate:

```text
Matched Skills
Missing Skills
Skill Match %
Skill Gap %
Career Readiness %
```

Classify skills:

```text
Beginner
Intermediate
Advanced
Job Ready
```

Do not generate random skill scores.

The calculation should be based on actual resume/profile/role data.

---

## 15. Job Matrix

Job Matrix must automatically use:

```text
Current Resume
+
Profile
+
Skills
+
Career Goal
+
Skill Gaps
+
Experience
```

NO resume upload.

For each job show:

```text
Job Title
Company
Location
Required Skills
Matched Skills
Missing Skills
Match %
Experience Requirement
Application Status
```

Allow:

- Save
- Apply
- Mark Applied
- Interview
- Rejected
- Selected

Persist status in the database.

---

## 16. Personalized Job Matching

Do not show the same jobs to every user.

Use the user's:

- target role
- skills
- experience
- resume
- location preference
- skill gaps

to calculate relevance.

---

## 17. Learning Roadmap

After Skill Gap analysis, automatically generate a personalized learning roadmap.

Example:

```text
Skill Gap
↓
Priority Skills
↓
Learning Order
↓
Resources
↓
Practice
↓
Completion
```

Example:

```text
1. TypeScript
2. Advanced SQL
3. Docker
4. Testing
5. AWS
```

Track:

```text
Not Started
In Progress
Completed
```

---

## 18. Certifications

Connect certifications to the skill system.

Do not simply display random certificates.

Show:

```text
Skill Gap
↓
Recommended Certification
↓
Learning
↓
Certification
↓
Skill Gained
```

When a skill is completed/certification earned, update:

```text
Skills
Skill Score
Career Readiness
Dashboard
Resume
```

---

## 19. AI Mentor — Must Actually Work

The AI Mentor must not be a static chatbot UI.

It must connect to the configured AI API through the backend.

The frontend must never expose secret API keys.

The Mentor should understand:

```text
Profile
Resume
Career Goal
Skills
Skill Gaps
Job Matches
Learning Progress
Certifications
```

Example:

> How can I become job-ready for a full-stack developer role?

The Mentor should analyze the user's actual SkillBridge data before answering.

It should provide personalized guidance.

---

## 20. AI Mentor Conversation Memory

Persist conversations.

Example:

```text
User
 ↓
Mentor Conversation
 ↓
Messages
```

Store:

```text
conversationId
userId
role
message
timestamp
```

Allow:

- New conversation
- Continue conversation
- Previous conversations
- Delete conversation

Do not send unlimited conversation history to the AI.

Use sensible context management.

---

## 21. AI Mentor Context

When generating an AI response, construct context from:

```text
USER PROFILE
+
CURRENT RESUME
+
RESUME ANALYSIS
+
CURRENT SKILLS
+
SKILL GAPS
+
CAREER GOAL
+
JOB MATCHES
+
LEARNING PROGRESS
+
CERTIFICATIONS
```

This makes the Mentor a **SkillBridge Career Mentor**, not a generic chatbot.

---

## 22. Connect Everything Automatically

The most important architecture:

```text
AUTHENTICATED USER
       ↓
USER PROFILE
       ↓
ONE CURRENT RESUME
       ↓
RESUME ANALYSIS
       ↓
SKILLS
       ↓
SKILL GAPS
       ↓
CAREER ANALYSIS
       ↓
JOB MATCHING
       ↓
LEARNING
       ↓
CERTIFICATIONS
       ↓
AI MENTOR
```

If one source changes, dependent information should refresh.

Example:

```text
User applies resume improvement
        ↓
Resume changes
        ↓
Resume score changes
        ↓
Skills change
        ↓
Skill gap changes
        ↓
Career readiness changes
        ↓
Job match changes
        ↓
Dashboard changes
```

---

## 23. Page Navigation

Create one application shell.

Navigation:

```text
Dashboard
Career
Resume Analyzer
Skill Gap
Job Matrix
Learning
Certifications
AI Mentor
Profile
Settings
Logout
```

The sidebar should remain consistent.

Show active route.

Show progress/status where useful.

---

## 24. Continue Career Journey

Instead of making users figure out what to do next, SkillBridge AI should show:

```text
YOUR NEXT STEP
```

Examples:

If no resume:

```text
Upload your resume
```

If resume uploaded but not analyzed:

```text
Analyze your resume
```

If skill gap exists:

```text
Start learning TypeScript
```

If learning completed:

```text
Explore matching jobs
```

If job saved:

```text
Prepare with AI Mentor
```

Make this dynamic.

---

## 25. Backend API Architecture

Use the existing architecture if already implemented.

Conceptually support APIs for:

```text
/auth
/profile
/resume
/resume/analyze
/resume/versions
/career
/skills
/skill-gap
/jobs
/jobs/match
/jobs/:id/status
/learning
/certifications
/mentor
/mentor/conversations
/mentor/messages
/dashboard
```

Do not duplicate existing endpoints unnecessarily.

---

## 26. Database

Ensure relationships conceptually look like:

```text
User
 │
 ├── Profile
 │
 ├── Resume
 │    ├── ResumeAnalysis
 │    ├── ResumeVersions
 │    └── Skills
 │
 ├── CareerAnalysis
 │
 ├── SkillProgress
 │
 ├── JobMatches
 │
 ├── Applications
 │
 ├── Certifications
 │
 └── MentorConversations
       └── Messages
```

Every record must belong to the authenticated user.

A user must never access another user's data.

---

## 27. Security

Fix:

- Authentication
- Authorization
- Protected APIs
- User ownership validation
- Input validation
- File validation
- API key protection
- OAuth security
- Password hashing
- Session security
- CORS
- Rate limiting where appropriate

Never trust a frontend-provided `userId` when the authenticated session already identifies the user.

---

## 28. AI API Security

AI API keys must exist only on the backend.

Never do:

```javascript
const API_KEY = "..."
```

inside frontend code.

Use environment variables.

Example:

```env
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
DATABASE_URL=
JWT_SECRET=
```

Only create variables actually required by the existing project.

---

## 29. Vercel Deployment

The current SkillBridge AI site is deployed on Vercel.

Make the production application work correctly on Vercel.

Check:

- Build
- Routing
- API endpoints
- Environment variables
- OAuth
- Database
- CORS
- File upload
- AI API
- Production URLs

Remove inappropriate hardcoded:

```text
localhost
127.0.0.1
```

from production logic.

---

## 30. Google OAuth + Vercel

Make sure production OAuth supports:

```text
Development
+
Production
```

Configure the correct production callback URL.

Do not hardcode localhost as the only OAuth callback.

---

## 31. GitHub OAuth + Vercel

Configure:

```text
Client ID
Client Secret
Callback URL
Production URL
Development URL
```

Secrets must remain server-side.

---

## 32. Loading States

Every AI operation must show a useful loading state.

Examples:

```text
Reading your resume...
Extracting your skills...
Analyzing your career profile...
Finding your skill gaps...
Matching jobs...
Generating your learning roadmap...
Connecting you with your AI Mentor...
```

Do not leave blank screens.

---

## 33. Error Handling

Every major operation needs:

### Loading

### Success

### Empty

### Error

Example:

```text
We couldn't analyze your resume right now.
Please try again.
```

Do not expose:

- stack traces
- API keys
- database errors
- internal server details

to users.

---

## 34. Performance

Do not repeatedly call AI APIs every time a page loads.

Cache/store analysis results.

For example:

```text
Resume unchanged
↓
Use existing analysis
```

Only reanalyze when:

```text
Resume changes
OR
User requests reanalysis
OR
Relevant career target changes
```

---

## 35. Real Data Only

Remove fake production data.

Do not use fake:

- resume scores
- skill scores
- job matches
- career recommendations
- AI answers
- dashboard statistics

Development seed data is acceptable only when clearly separated from production.

---

## 36. Responsive UI

The existing SkillBridge AI interface should remain visually consistent while becoming more polished.

Improve:

- visual hierarchy
- spacing
- cards
- progress indicators
- charts
- buttons
- loading states
- error states
- responsive design
- mobile layout

Do not redesign the entire application unnecessarily.

---

## 37. Complete End-to-End Test

Test this exact journey:

```text
NEW USER
 ↓
REGISTER
 ↓
PROFILE
 ↓
DASHBOARD
 ↓
UPLOAD RESUME
 ↓
RESUME ANALYZER
 ↓
CAREER
 ↓
SKILL GAP
 ↓
JOB MATRIX
 ↓
LEARNING
 ↓
CERTIFICATIONS
 ↓
AI MENTOR
```

Then test:

```text
LOGOUT
 ↓
LOGIN AGAIN
 ↓
DASHBOARD
 ↓
PREVIOUS RESUME STILL EXISTS
 ↓
ALL PREVIOUS DATA STILL EXISTS
```

---

## 38. Social Login Test

Test:

```text
Google
 ↓
OAuth
 ↓
SkillBridge account
 ↓
Dashboard
```

and:

```text
GitHub
 ↓
OAuth
 ↓
SkillBridge account
 ↓
Dashboard
```

---

## 39. Resume Reuse Test

This test is mandatory.

Upload:

```text
resume.pdf
```

Then visit:

```text
Dashboard
Career
Resume Analyzer
Skill Gap
Job Matrix
AI Mentor
```

Confirm that every page automatically uses the SAME stored resume.

There must be NO:

```text
Upload Resume
```

request on every page.

---

## 40. Final Code Audit

Before finishing, search the project for:

```text
TODO
FIXME
mock
dummy
fake
sample
localhost
127.0.0.1
console.log
hardcoded API keys
```

Fix all production-critical issues.

Check:

- npm build
- lint
- API errors
- routing
- authentication
- OAuth
- database
- resume upload
- AI API
- Vercel deployment

---

## 41. Do Not Stop at UI

This is the most important instruction.

Do NOT tell me:

> "The UI is complete."

if the backend is not connected.

Do NOT tell me:

> "Login is ready."

if OAuth is fake.

Do NOT tell me:

> "Resume Analyzer works."

if it uses hardcoded results.

Do NOT tell me:

> "AI Mentor works."

if it does not call the actual AI backend.

Do NOT create buttons that only change the page.

Every important action must have a real implementation.

---

## 42. Implementation Order

Work in this order:

```text
1. Inspect SkillBridge AI
2. Identify existing architecture
3. Fix authentication
4. Add Google OAuth
5. Add GitHub OAuth
6. Fix user/profile persistence
7. Fix one-time resume upload
8. Create centralized resume state
9. Fix Resume Analyzer
10. Fix resume editing/versioning
11. Connect Career
12. Connect Skill Gap
13. Connect Job Matrix
14. Connect Learning
15. Connect Certifications
16. Connect AI Mentor
17. Connect Dashboard
18. Connect navigation
19. Add loading/error states
20. Security audit
21. API audit
22. Database audit
23. Vercel audit
24. Full end-to-end testing
25. Fix remaining errors
```

---

## 43. Final Architecture Goal

SkillBridge AI should ultimately behave like this:

```text
                         ┌──────────────┐
                         │ AUTHENTICATION│
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │ USER PROFILE │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │  ONE RESUME  │
                         └──────┬───────┘
                                ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
             RESUME ANALYZER          SKILL EXTRACTION
                    ↓                       ↓
                    └───────────┬───────────┘
                                ↓
                         ┌──────────────┐
                         │  SKILL GAP   │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │   CAREER     │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │  JOB MATRIX  │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │   LEARNING   │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │CERTIFICATION │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │  AI MENTOR   │
                         └──────┬───────┘
                                ↓
                         ┌──────────────┐
                         │  DASHBOARD   │
                         └──────────────┘
```

Everything must remain connected to the same authenticated user.

---

# Final Command

Now inspect my existing **SkillBridge AI** codebase.

Do not start by creating random new pages.

First understand what already exists.

Then:

**AUDIT → FIX → CONNECT → IMPLEMENT → TEST → VERIFY → DEPLOY**

Do not stop until the existing SkillBridge AI application behaves as one complete, production-ready AI career platform.

At the end, report exactly:

```text
AUTHENTICATION       PASS/FAIL
GOOGLE LOGIN         PASS/FAIL
GITHUB LOGIN         PASS/FAIL
PROFILE              PASS/FAIL
ONE-TIME RESUME      PASS/FAIL
RESUME ANALYZER      PASS/FAIL
CAREER               PASS/FAIL
SKILL GAP            PASS/FAIL
JOB MATRIX           PASS/FAIL
LEARNING             PASS/FAIL
CERTIFICATIONS       PASS/FAIL
AI MENTOR            PASS/FAIL
DASHBOARD            PASS/FAIL
DATABASE             PASS/FAIL
SECURITY             PASS/FAIL
VERCEL                PASS/FAIL
END-TO-END FLOW      PASS/FAIL
```

Only mark **PASS** after actually testing the feature.
