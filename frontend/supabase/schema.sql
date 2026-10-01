-- ====================================================================
-- SkillBridge Complete Supabase Database Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Create Helper Function for Updated Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================================================
-- 2. USER PROGRESS & PROFILES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    college TEXT,
    career_goal TEXT,
    scores JSONB DEFAULT '{}'::jsonb,
    resume_analysis JSONB,
    raw_user_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 3. USER SKILLS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    level TEXT DEFAULT 'Beginner',
    verified BOOLEAN DEFAULT false,
    score INTEGER DEFAULT 0,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 4. VERIFIED CERTIFICATES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    skill_name TEXT,
    credential_id TEXT,
    issue_date TEXT,
    status TEXT DEFAULT 'verified',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 5. LEARNING ROADMAPS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    target_timeline TEXT,
    milestones JSONB DEFAULT '[]'::jsonb,
    overall_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 6. MOCK INTERVIEW SESSIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT,
    difficulty TEXT,
    overall_score INTEGER,
    feedback JSONB DEFAULT '{}'::jsonb,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ====================================================================
-- User Progress Policies
DROP POLICY IF EXISTS "Allow public access on user_progress" ON public.user_progress;
CREATE POLICY "Allow public access on user_progress" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);

-- User Skills Policies
DROP POLICY IF EXISTS "Allow public access on user_skills" ON public.user_skills;
CREATE POLICY "Allow public access on user_skills" ON public.user_skills FOR ALL USING (true) WITH CHECK (true);

-- Certificates Policies
DROP POLICY IF EXISTS "Allow public access on certificates" ON public.certificates;
CREATE POLICY "Allow public access on certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

-- Roadmaps Policies
DROP POLICY IF EXISTS "Allow public access on roadmaps" ON public.roadmaps;
CREATE POLICY "Allow public access on roadmaps" ON public.roadmaps FOR ALL USING (true) WITH CHECK (true);

-- Interview Sessions Policies
DROP POLICY IF EXISTS "Allow public access on interview_sessions" ON public.interview_sessions;
CREATE POLICY "Allow public access on interview_sessions" ON public.interview_sessions FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 9. CREATE INDEXES FOR FAST QUERIES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
