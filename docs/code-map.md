---
agent-notes:
  ctx: "SkillBridge codebase structural overview, API route catalog, scoring logic & bundle map"
  deps: ["backend/server.js", "src/App.jsx"]
  state: active
  last: "anti@2026-08-25"
  key: ["UPDATE when adding packages, modules, or changing public APIs"]
---
# SkillBridge AI — Code Map & Architecture Guide

Structural overview of the SkillBridge AI platform. Read this file to understand the system architecture, REST API route contracts, AI service pipelines, and frontend bundle structure.

---

## 1. Architecture at a Glance

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    REACT 19 + VITE 8 FRONTEND (Vercel)                    │
│   Dashboard • Resume Analyzer • Skill Gap Hub • Roadmap • Mock Interview  │
│          Dynamic Chunking via React.lazy() & Suspense Module Splitting     │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │  HTTP / REST (JWT Bearer Auth)
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│            EXPRESS 4 BACKEND API (Standalone Node / Vercel Serverless)    │
│                                                                           │
│  [Rate Limiting]       express-rate-limit (60 req/15m on AI & Skill Gap)  │
│  [Auth Middleware]     JWT verification with production secret checks     │
│  [Cold Start DB Check] Cached connectDB() settles before route execution  │
└──────┬──────────────────────────────┬──────────────────────────────┬──────┘
       │                              │                              │
       ▼                              ▼                              ▼
┌──────────────┐             ┌─────────────────┐            ┌──────────────┐
│  MONGODB /   │             │ UNIFIED GEMINI  │            │  IN-MEMORY / │
│   MONGOOSE   │             │   AI CLIENT     │            │ LOCAL STORE  │
│ Mongoose     │             │ Exponential     │            │ Resilient    │
│ Models & DB  │             │ backoff + model │            │ zero-config  │
│ Persistence  │             │ fallback chain  │            │ fallback     │
└──────────────┘             └─────────────────┘            └──────────────┘
```

---

## 2. API Route Catalog

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registers student with hashed password | No |
| `POST` | `/api/auth/login` | Authenticates credentials and returns JWT token | No |
| `GET` | `/api/auth/me` | Returns active user profile | Yes (JWT) |

### Skill Gap & Verification (`/api/skill-gap`) — *Protected by `aiRateLimiter`*
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/skill-gap/analyze` | Compares resume text/skills with target JD; returns structured gap report | Yes (JWT / guest) |
| `POST` | `/api/skill-gap/roadmap` | Generates multi-stage personalized learning roadmap | Yes (JWT / guest) |
| `PUT` | `/api/skill-gap/roadmap/tasks/:taskId` | Updates roadmap task completion and stage progress | Yes (JWT / guest) |
| `GET` | `/api/skill-gap/questions` | Retrieves randomized MCQ assessment questions for skill | Yes (JWT / guest) |
| `GET` | `/api/skill-gap/coding-challenge` | Retrieves coding challenge and test suite for skill | Yes (JWT / guest) |
| `POST` | `/api/skill-gap/sandbox/run` | Executes user code in sandbox VM against challenge test cases | Yes (JWT / guest) |
| `POST` | `/api/skill-gap/project/inspect` | Inspects GitHub repository metadata and technological evidence | Yes (JWT / guest) |
| `POST` | `/api/skill-gap/verify` | Multi-modal evaluation: generates authoritative score & certificate | Yes (JWT / guest) |

### AI Generation & Mentorship (`/api/ai`) — *Protected by `aiRateLimiter`*
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/analyze-resume` | ATS resume parsing via Gemini structured JSON | No (Protected by rate limiter) |
| `POST` | `/api/ai/analyze-jd` | Technical JD decomposition and requirement extraction | No (Protected by rate limiter) |
| `POST` | `/api/ai/generate-questions` | Dynamic practice, coding & interview questions generation | No (Protected by rate limiter) |
| `POST` | `/api/ai/chat` | Sparky AI Career Mentor conversational advice | No (Protected by rate limiter) |
| `POST` | `/api/ai/evaluate-interview` | Technical correctness, confidence, and clarity grading | No (Protected by rate limiter) |
| `POST` | `/api/ai/generate-roadmap` | Weekly placement roadmap milestone generator | No (Protected by rate limiter) |

### Resume Operations (`/api/resume`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/resume/analyze` | Multer upload with `try/finally` file cleanup + parsing (*Rate limited*) | Yes (JWT / guest) |
| `POST` | `/api/resume/upload` | Compatibility endpoint for resume parsing | Yes (JWT / guest) |
| `POST` | `/api/resume/apply-fix` | Applies structural fixes to detected resume defects | Yes (JWT / guest) |
| `POST` | `/api/resume/update-from-skills` | Appends verified skills and bullets into resume data | Yes (JWT / guest) |

### Certificates (`/api/certificates`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/certificates/generate` | Generates verified certificate and issues unique code | Yes (JWT / guest) |
| `GET` | `/api/certificates/verify/:id` | Public verification lookup for certificate code | No |
| `GET` | `/api/certificates/:id/download` | PDF certificate download stream | No |

---

## 3. Authoritative Scoring & Verification Rules

SkillBridge uses a **single authoritative scoring formula** across all backend services and frontend views:

$$\text{Final Score} = (\text{MCQ Quiz} \times 0.25) + (\text{Coding Sandbox} \times 0.35) + (\text{GitHub Project} \times 0.40)$$

- **Passing Threshold**: **$\ge 75\%$**
- **Authoritative Issuance**: Certificates are issued **only** via `POST /api/skill-gap/verify` upon reaching the $\ge 75\%$ threshold.

---

## 4. AI & Gemini Engine Architecture

All Gemini interactions are consolidated into `backend/services/geminiService.js`:
- **Model Fallback Chain**: `gemini-1.5-flash` $\rightarrow$ `gemini-2.0-flash` $\rightarrow$ `gemini-1.5-pro`
- **Retry Strategy**: Exponential backoff ($1\text{s} \rightarrow 2\text{s} \rightarrow 4\text{s}$) with automatic model switching on 404/quota errors.
- **Structured JSON Mode**: Uses `responseMimeType: 'application/json'` with fallback markdown fence stripping.

---

## 5. Frontend Code Splitting & Bundle Structure

The frontend leverages `React.lazy()` and `<React.Suspense>` for route-level code splitting:

- **Entry Bundle**: `dist/assets/index-*.js` (Core React layout, Dashboard, Navigation)
- **Dynamic Feature Chunks**:
  - `dist/assets/ResumeAnalyzer-*.js` (~144 kB)
  - `dist/assets/AptitudeDashboard-*.js` (~108 kB)
  - `dist/assets/SkillVerificationModal-*.js` (~61 kB)
  - `dist/assets/SkillGapDashboard-*.js` (~34 kB)
  - `dist/assets/JobAnalyzer-*.js` (~31 kB)
  - `dist/assets/CodingPractice-*.js` (~28 kB)
  - `dist/assets/MockInterview-*.js` (~28 kB)
  - `dist/assets/CareerMentor-*.js` (~24 kB)
  - `dist/assets/LearningRoadmap-*.js` (~20 kB)
  - `dist/assets/ProjectRecommender-*.js` (~9 kB)
