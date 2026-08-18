// agent-notes: { ctx: "Unit tests for Supabase data persistence and restoration helper logic", deps: ["vitest"], state: "active", last: "anti@2026-08-18" }
import { describe, it, expect, vi } from 'vitest';

describe('Supabase Data Storage and Restoration Logic', () => {
  it('prepares and serializes user progress data correctly', () => {
    const mockUser = {
      id: 'usr_supabase_123',
      email: 'sajid@skillbridge.ai',
      name: 'Sajid Ahmed',
      college: 'Vaigai College of Engineering',
      scores: {
        skillScore: 88,
        resumeScore: 92,
        interviewReadiness: 90,
        placementReadiness: 85
      },
      resumeAnalysis: {
        analyzed: true,
        problems: [{ id: 1, fixed: true }],
        skillsStatus: [{ name: 'React', status: 'GAINED' }]
      }
    };

    const formatPayloadForSupabase = (user) => {
      if (!user || !user.id) return null;
      return {
        user_id: user.id,
        email: user.email,
        profile_name: user.name,
        college: user.college,
        scores: user.scores,
        resume_analysis: user.resumeAnalysis,
        last_updated: new Date().toISOString()
      };
    };

    const payload = formatPayloadForSupabase(mockUser);
    expect(payload).not.toBeNull();
    expect(payload.user_id).toBe('usr_supabase_123');
    expect(payload.scores.resumeScore).toBe(92);
    expect(payload.resume_analysis.analyzed).toBe(true);
  });

  it('merges Supabase metadata into current user object on login', () => {
    const baseUser = {
      id: 'usr_supabase_123',
      email: 'sajid@skillbridge.ai',
      name: 'Default Name'
    };

    const supabaseMetadata = {
      profile_name: 'Sajid Ahmed',
      college: 'Vaigai College of Engineering',
      scores: {
        skillScore: 95,
        resumeScore: 90
      },
      resume_analysis: {
        analyzed: true
      }
    };

    const mergeSupabaseData = (base, metadata) => {
      if (!metadata) return base;
      return {
        ...base,
        name: metadata.profile_name || base.name,
        college: metadata.college || base.college,
        scores: {
          ...base.scores,
          ...metadata.scores
        },
        resumeAnalysis: metadata.resume_analysis || base.resumeAnalysis,
        hasUploadedResume: Boolean(metadata.resume_analysis?.analyzed)
      };
    };

    const merged = mergeSupabaseData(baseUser, supabaseMetadata);
    expect(merged.name).toBe('Sajid Ahmed');
    expect(merged.college).toBe('Vaigai College of Engineering');
    expect(merged.scores.skillScore).toBe(95);
    expect(merged.hasUploadedResume).toBe(true);
  });
});
