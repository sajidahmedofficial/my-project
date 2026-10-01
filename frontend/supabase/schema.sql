-- ====================================================================
-- SkillBridge AI Complete Supabase Database Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Helper function for automated updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================================================
-- 2. PROFILES TABLE (Keyed by authenticated auth.users.id)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    profile_image_url TEXT,
    career_goal TEXT,
    bio TEXT,
    resume_id UUID,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 3. RESUMES TABLE (Stores parsed resume documents & history)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT,
    file_path TEXT,
    file_url TEXT,
    parsed_text TEXT,
    resume_data JSONB DEFAULT '{}'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    resume_score INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint to profiles.resume_id if resumes table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_resume_id_fkey'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_resume_id_fkey 
        FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ====================================================================
-- 4. USER_PROGRESS TABLE (Tracks feature completion & overall percentage)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    overall_progress INTEGER DEFAULT 0,
    resume_analysis_completed BOOLEAN DEFAULT false,
    skill_gap_completed BOOLEAN DEFAULT false,
    job_matrix_completed BOOLEAN DEFAULT false,
    career_guidance_completed BOOLEAN DEFAULT false,
    ai_mentor_completed BOOLEAN DEFAULT false,
    coding_tasks_completed INTEGER DEFAULT 0,
    certificates_completed INTEGER DEFAULT 0,
    current_stage TEXT DEFAULT 'Onboarding',
    completed_tasks JSONB DEFAULT '[]'::jsonb,
    scores JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 5. SKILL_GAPS TABLE (Tracks gap analysis per user & resume)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    skill_name TEXT NOT NULL,
    category TEXT,
    current_level TEXT DEFAULT 'Beginner',
    required_level TEXT DEFAULT 'Intermediate',
    gap_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'todo',
    recommended_action TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 6. CAREER_DATA TABLE (Tracks target role, recommendations & job matches)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.career_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role TEXT,
    recommended_roles JSONB DEFAULT '[]'::jsonb,
    job_matches JSONB DEFAULT '[]'::jsonb,
    career_recommendations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 7. SUPABASE STORAGE BUCKET: resumes
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ====================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_data ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view and edit their own row
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Resumes: Users can only access their own uploaded resumes
DROP POLICY IF EXISTS "Users can access own resumes" ON public.resumes;
CREATE POLICY "Users can access own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Progress: Users can only access their own progress
DROP POLICY IF EXISTS "Users can access own progress" ON public.user_progress;
CREATE POLICY "Users can access own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Skill Gaps: Users can only access their own skill gaps
DROP POLICY IF EXISTS "Users can access own skill gaps" ON public.skill_gaps;
CREATE POLICY "Users can access own skill gaps" ON public.skill_gaps
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Career Data: Users can only access their own career data
DROP POLICY IF EXISTS "Users can access own career data" ON public.career_data;
CREATE POLICY "Users can access own career data" ON public.career_data
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage Policies for 'resumes' bucket
DROP POLICY IF EXISTS "Users can upload their own resume files" ON storage.objects;
CREATE POLICY "Users can upload their own resume files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resumes' AND
        (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'authenticated')
    );

DROP POLICY IF EXISTS "Users can view their own resume files" ON storage.objects;
CREATE POLICY "Users can view their own resume files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'resumes' AND
        (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'authenticated')
    );

-- ====================================================================
-- 9. PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes (user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_uploaded_at ON public.resumes (uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user_id ON public.skill_gaps (user_id);
CREATE INDEX IF NOT EXISTS idx_career_data_user_id ON public.career_data (user_id);
