# SkillBridge AI 🚀

**SkillBridge AI** is an intelligent full-stack career acceleration and technical readiness platform. It empowers engineers and students to benchmark skills, optimize resumes for ATS standards, navigate personalized learning roadmaps, simulate realistic technical screens and workplace negotiations with in-character AI personas, and track verifiable skill mastery.

---

## 🌟 Key Features

### 1. 🎭 AI Communication & Roleplay Simulator (Rolemint Integration)
- **Dynamic In-Character AI Personas:** Practice high-stakes conversations (Senior Frontend Technical Screen, Offer & Salary Negotiation, Scope Pushback, Outage Postmortem, Client Pitch).
- **Custom Scenario Builder:** Define your own counterparty persona, scenario objective, difficulty levels (*Easy*, *Medium*, *Hard*), and context.
- **Scored Coaching Evaluation:** Turn-by-turn simulation analysis delivering an overall readiness score (0–100), key behavioral strengths, tactical next steps, and transcript replays.

### 2. 📄 ATS Resume Analyzer & Fixer
- **Deep Resume Parsing:** Extracts skills, experience, project impacts, and identifies missing competencies.
- **Actionable ATS Optimization:** Scored feedback, keyword density checks, and one-click problem resolution.

### 3. 🎯 Skill Gap Analysis & Job Market Matrix
- **Benchmark vs Industry Benchmarks:** Compare your verified profile against real-world job roles (Frontend, Backend, Full Stack, DevOps, AI/ML).
- **Missing Skills Identification:** Automatically pinpoints prerequisite gaps and recommends targeted modules.

### 4. 🗺️ Personalized Learning Roadmap
- **Curated Milestones:** Step-by-step sequential learning phases tailored to your career goal.
- **Skill Verification:** Built-in challenge sandbox and certificate generation.

### 5. 💻 Interactive Mock Interview & Coding Practice
- **Real-time Technical Questions:** In-depth coding evaluations, test-case sandboxes, and aptitude assessments across quantitative and logical reasoning topics.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, Persistent Storage Layer (resilient local & serverless cache) |
| **AI Services** | Google Gemini AI (`@google/generative-ai`), Anthropic API integration, intelligent zero-API offline fallbacks |
| **Databases** | MongoDB (Mongoose), Supabase Client, File/Memory Storage fallback |
| **Quality & Tests** | Vitest, Oxlint, Husky |

---

## 📁 Repository Structure

```
skillbridge/
├── backend/
│   ├── ai/                      # Gemini prompts and schema definitions
│   ├── config/                  # Server configuration
│   ├── data/                    # Seed datasets (roleplay scenarios, aptitude banks)
│   ├── middleware/              # Rate limiters, authentication handlers
│   ├── models/                  # Data models (Assessment, Profile, etc.)
│   ├── routes/                  # Express API routes (roleplay, resume, skills, auth)
│   ├── services/                # Business logic & AI generation services
│   ├── storage/                 # Resilient persistent storage engine
│   └── server.js                # Express API gateway
├── src/
│   ├── components/
│   │   ├── common/              # Avatars, UI decorations, badges
│   │   ├── roleplay/            # AI Roleplay Hub, ScenarioCard, Chat, Feedback, Builder
│   │   ├── resume/              # Resume analyzers and verification modals
│   │   ├── aptitude/            # Aptitude testing modules
│   │   └── Dashboard.jsx        # SaaS metrics dashboard
│   ├── context/                 # AuthContext and state management
│   ├── services/                # Frontend API clients (roleplayApi, api, aptitudeApi)
│   ├── styles/                  # Tailwind and core styling tokens
│   ├── App.jsx                  # Main application router and navigation
│   └── main.jsx                 # Client entry point
├── test/                        # Backend and service unit tests
└── docs/                        # Architecture decision records & methodology
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### 1. Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Environment Configuration

Create a `.env` file in the root and in `backend/.env`:

```env
# Server & Port
PORT=5000
FRONTEND_URL=http://localhost:5173

# AI Keys (Optional - resilient fallback mode active if omitted)
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database (Optional - persistent memory/file store active if omitted)
MONGODB_URI=mongodb://localhost:27017/skillbridge
```

### 3. Running the Application

```bash
# Run backend Express server
npm run dev:server

# Run frontend development server (in a separate terminal)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/roleplay/scenarios` | `GET` | Retrieve built-in and custom roleplay scenarios |
| `/api/roleplay/scenarios` | `POST` | Create a new custom scenario & AI persona |
| `/api/roleplay/scenarios/:id` | `DELETE` | Delete custom scenario |
| `/api/roleplay/sessions` | `POST` | Start simulation session & get AI opening line |
| `/api/roleplay/sessions/:id` | `GET` | Get session transcript and metadata |
| `/api/roleplay/sessions/:id/messages` | `POST` | Submit trainee line and receive in-character reply |
| `/api/roleplay/sessions/:id/end` | `POST` | End session and generate scored coaching report |
| `/api/roleplay/history` | `GET` | Retrieve user simulation history and performance scores |
| `/api/health` | `GET` | System health check and active database status |

---

## 🧪 Testing

Run backend service verification tests:

```bash
node test/roleplay.service.test.js
```

---

## 📄 License
ISC
