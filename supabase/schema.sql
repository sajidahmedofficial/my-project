-- SkillBridge Supabase Database Schema
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query

-- 1. Create user_progress table
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for public/authenticated access
CREATE POLICY "Allow public select on user_progress" 
    ON public.user_progress FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert on user_progress" 
    ON public.user_progress FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on user_progress" 
    ON public.user_progress FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public delete on user_progress" 
    ON public.user_progress FOR DELETE 
    USING (true);
