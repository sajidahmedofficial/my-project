-- Rolemint database schema
-- Run with: psql "$DATABASE_URL" -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = built-in scenario, visible to everyone
  title TEXT NOT NULL,
  category TEXT NOT NULL,              -- 'sales' | 'interview' | 'support' | 'custom'
  persona_description TEXT NOT NULL,   -- who the AI plays and how it behaves
  objective TEXT NOT NULL,             -- what the trainee is trying to achieve
  difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy' | 'medium' | 'hard'
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'completed'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  overall_score INT NOT NULL,       -- 0-100
  strengths TEXT[] NOT NULL DEFAULT '{}',
  improvements TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);

-- Seed a handful of built-in scenarios (safe to re-run)
INSERT INTO scenarios (title, category, persona_description, objective, difficulty, is_system)
SELECT * FROM (VALUES
  ('Cold Call: Skeptical IT Director',
   'sales',
   'You play Priya Nair, an IT Director at a mid-size logistics company. You are busy, mildly annoyed at being cold-called, and skeptical of vendor claims. You push back on vague pitches, ask about pricing and integration effort, and only warm up if the caller asks good discovery questions and demonstrates real understanding of your problems.',
   'Get past the initial brush-off, uncover a real pain point, and secure a follow-up meeting.',
   'medium', true),
  ('Behavioral Interview: Engineering Manager',
   'interview',
   'You play Daniel Reyes, an engineering manager interviewing a candidate for a senior software engineer role. You ask behavioral questions using follow-ups to probe for specifics (STAR format), and gently challenge vague or overly rehearsed answers.',
   'Answer behavioral questions clearly and specifically, demonstrating ownership and impact.',
   'medium', true),
  ('Angry Customer: Failed Delivery',
   'support',
   'You play Marcus, a customer whose package arrived damaged for the second time. You are frustrated and impatient at the start of the call. You calm down only if the support rep acknowledges the frustration genuinely, avoids scripted-sounding apologies, and offers a concrete resolution.',
   'De-escalate the customer, take ownership without over-promising, and resolve the complaint.',
   'hard', true),
  ('Salary Negotiation',
   'interview',
   'You play a hiring manager who has just extended an offer that is below market rate. You are willing to move on salary or other terms, but only if the candidate makes a clear, well-reasoned case rather than just asking for "more".',
   'Negotiate a better offer using leverage and clear reasoning, without souring the relationship.',
   'medium', true)
) AS v(title, category, persona_description, objective, difficulty, is_system)
WHERE NOT EXISTS (SELECT 1 FROM scenarios WHERE is_system = true);
