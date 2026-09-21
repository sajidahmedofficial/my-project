# Rolemint (clone)

A full-stack AI roleplay practice app: pick or write a scenario, have a live text
conversation with an in-character AI (skeptical customer, interviewer, angry client,
whatever you define), then get a scored coaching report when you end the session.

This is an original build inspired by the *category* of app rolemint.ai appears to be in
(AI roleplay/communication practice) — not a copy of its code, design, or content, which
weren't accessible to build from directly.

## Stack

- **Backend:** Node.js, Express, PostgreSQL (`pg`), JWT auth, bcrypt password hashing
- **Frontend:** React (Vite), React Router, plain CSS (no UI framework)
- **AI:** Anthropic API (Claude) — one call per trainee message for the in-character
  reply, one call at session end to generate scored feedback

## Project structure

```
rolemint/
  backend/
    schema.sql          # Postgres schema + seed scenarios
    src/
      index.js          # Express app entry
      db.js              # Postgres pool
      middleware/auth.js # JWT auth middleware
      routes/            # auth, scenarios, sessions
      services/aiService.js # Anthropic API calls (roleplay + feedback)
  frontend/
    src/
      pages/             # Landing, Login, Signup, Dashboard, ScenarioBuilder, Roleplay, Feedback
      components/        # NavBar, ScenarioCard
      api.js             # fetch wrapper + token storage
      index.css           # design system
```

## 1. Database setup

You need a running Postgres instance (local, Docker, or a hosted one like Supabase/Neon/Railway).

```bash
createdb rolemint
psql "$DATABASE_URL" -f backend/schema.sql
```

The schema file is idempotent for the seed data — safe to re-run.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL, JWT_SECRET, and ANTHROPIC_API_KEY
npm install
npm run dev
```

The API runs on `http://localhost:4000` by default. Health check: `GET /api/health`.

### Environment variables (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Random secret used to sign auth tokens |
| `PORT` | API port (default 4000) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key — powers the roleplay AI and feedback scoring |
| `AI_MODEL` | Model name to call (default `claude-sonnet-4-5-20250929`) |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins |

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit `http://localhost:5173`.

## How the AI roleplay works

- **Starting a session** (`POST /api/sessions`): builds a system prompt from the
  scenario's `persona_description`, `objective`, and `difficulty`, and asks Claude for
  an in-character opening line.
- **Each trainee message** (`POST /api/sessions/:id/messages`): the full message
  history is replayed to Claude with the same system prompt so the character stays
  consistent turn to turn.
- **Ending a session** (`POST /api/sessions/:id/end`): the full transcript is sent to
  Claude with a coaching-specific system prompt that returns strict JSON
  (`overall_score`, `strengths`, `improvements`, `summary`), which is parsed and stored.

You can swap `services/aiService.js` to call a different provider (OpenAI, etc.) without
touching any routes — it's the only file that talks to the AI.

## Notes / things to harden before shipping this for real

- JWTs are stored in `localStorage` for simplicity — for production, prefer an
  httpOnly cookie to reduce XSS token-theft risk.
- No rate limiting on the AI endpoints — add some before exposing this publicly, since
  every chat message is a paid API call.
- No email verification / password reset flow yet.
- Scenario deletion is only wired up on the backend (`DELETE /api/scenarios/:id`); add
  a delete button in the UI if you want users to manage their custom scenarios.
