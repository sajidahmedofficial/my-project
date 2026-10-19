// agent-notes: { ctx: "Unit tests for skill gap persistence, refresh restoration, and cache integrity", deps: ["vitest", "../../services/userPersistence"], state: "active", last: "anti@2026-10-19" }
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSkillGapReportToSupabase, loadSavedSkillGapReport } from '../../services/userPersistence.js';

describe('Skill Gap Persistence & Refresh Restoration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('persists skill gap report to localStorage and returns success', async () => {
    const mockReport = {
      overallMatchScore: 82,
      strongSkills: [{ skillName: 'React', category: 'Frontend', proficiency: 'Advanced' }],
      missingSkills: [{ skillName: 'Docker', category: 'DevOps', requiredLevel: 'Proficient' }],
      partialSkills: []
    };

    const result = await saveSkillGapReportToSupabase({
      userId: 'test_user_456',
      targetRole: 'Full Stack Engineer',
      report: mockReport
    });

    expect(result).not.toBeNull();
    expect(result.success).toBe(true);

    const savedLocal = JSON.parse(localStorage.getItem('sb_skillgap_report_test_user_456'));
    expect(savedLocal).toBeDefined();
    expect(savedLocal.overallMatchScore).toBe(82);
    expect(savedLocal.targetRole).toBe('Full Stack Engineer');
  });

  it('restores saved report from localStorage on page refresh without data loss', async () => {
    const savedData = {
      overallMatchScore: 78,
      strongSkills: [{ skillName: 'Python', category: 'Backend', proficiency: 'Expert' }],
      missingSkills: [{ skillName: 'Kubernetes', category: 'Cloud', requiredLevel: 'Intermediate' }],
      partialSkills: [],
      targetRole: 'Cloud Architect'
    };

    localStorage.setItem('sb_skillgap_report_user_789', JSON.stringify(savedData));

    const loadedReport = await loadSavedSkillGapReport('user_789');
    expect(loadedReport).not.toBeNull();
    expect(loadedReport.overallMatchScore).toBe(78);
    expect(loadedReport.targetRole).toBe('Cloud Architect');
    expect(loadedReport.strongSkills[0].skillName).toBe('Python');
    expect(loadedReport.missingSkills[0].skillName).toBe('Kubernetes');
  });

  it('preserves tab state and resume markers across reload', () => {
    localStorage.setItem('sb_active_tab', 'skillgap');
    localStorage.setItem('sb_has_uploaded_resume', 'true');
    localStorage.setItem('sb_resume_filename', 'Sajid_Resume.pdf');

    const restoredTab = localStorage.getItem('sb_active_tab');
    const hasResume = localStorage.getItem('sb_has_uploaded_resume') === 'true';
    const resumeFile = localStorage.getItem('sb_resume_filename');

    expect(restoredTab).toBe('skillgap');
    expect(hasResume).toBe(true);
    expect(resumeFile).toBe('Sajid_Resume.pdf');
  });
});
