// agent-notes: { ctx: "Frontend API client for Skill Gap Analysis, Multi-stage Roadmap, Verification & Certificate downloads with strict error propagation", deps: [], state: "active", last: "anti@2026-08-20" }

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const skillGapApi = {
  /**
   * Run AI Skill Gap Analysis
   */
  analyzeSkillGap: async ({ resumeId, resumeFile, resumeText, userSkills = [], targetRole = "Frontend Developer", jobDescription = "", verifiedSkills = [], userId = "guest_user" }) => {
    let res;
    if (resumeFile) {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      if (resumeId) formData.append('resumeId', resumeId);
      formData.append('targetRole', targetRole);
      formData.append('jobDescription', jobDescription);
      formData.append('userId', userId);
      if (userSkills && userSkills.length) {
        formData.append('userSkills', JSON.stringify(userSkills));
      }
      if (verifiedSkills && verifiedSkills.length) {
        formData.append('verifiedSkills', JSON.stringify(verifiedSkills));
      }

      res = await fetch(`${API_BASE_URL}/skill-gap/analyze`, {
        method: 'POST',
        body: formData
      });
    } else {
      res = await fetch(`${API_BASE_URL}/skill-gap/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          resumeText,
          userSkills,
          targetRole,
          jobDescription,
          verifiedSkills,
          userId
        })
      });
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Skill gap analysis failed with status: ${res.status}`);
    }

    const data = await res.json();
    if (!data || !data.report) {
      throw new Error("Invalid skill gap response from server.");
    }

    return data;
  },

  /**
   * Get saved skill gap report for user
   */
  getSavedSkillGap: async (userId = "guest_user") => {
    const res = await fetch(`${API_BASE_URL}/skill-gap/${userId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch saved skill gap");
    }
    return await res.json();
  },

  /**
   * Generate multi-stage roadmap for missing skill
   */
  generateRoadmap: async ({ skillName, targetRole = "Frontend Developer", currentLevel = "Beginner", targetLevel = "Advanced", priority = "High", userId = "guest_user" }) => {
    const res = await fetch(`${API_BASE_URL}/skill-gap/roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillName, targetRole, currentLevel, targetLevel, priority, userId })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Roadmap generation failed with status: ${res.status}`);
    }

    const data = await res.json();
    if (!data || !data.roadmap) {
      throw new Error("Invalid roadmap response from server.");
    }
    return data;
  },

  /**
   * Verify skill through multi-modal assessments
   */
  verifySkill: async ({ skillName, userName = "SkillBridge Student", userId = "guest_user", mcqResults, codingResults, projectSubmission, targetRole = "Frontend Developer" }) => {
    const res = await fetch(`${API_BASE_URL}/skill-gap/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skillName,
        userName,
        userId,
        mcqResults,
        codingResults,
        projectSubmission,
        targetRole
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Verification API failed with status: ${res.status}`);
    }

    const data = await res.json();
    if (!data || !data.evaluation) {
      throw new Error("Invalid verification response from server.");
    }
    return data;
  },

  /**
   * Get verified skills
   */
  getVerifiedSkills: async (userId = "guest_user") => {
    const res = await fetch(`${API_BASE_URL}/skills/verified?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      throw new Error("Failed to fetch verified skills");
    }
    return await res.json();
  },

  /**
   * Update resume from verified skills
   */
  updateResumeFromSkills: async ({ resumeData, verifiedSkills, certificateCode }) => {
    const res = await fetch(`${API_BASE_URL}/resume/update-from-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, verifiedSkills, certificateCode })
    });

    if (!res.ok) {
      throw new Error("Resume update failed");
    }
    return await res.json();
  },

  /**
   * Download certificate URL helper
   */
  getCertificateDownloadUrl: (certificateId) => {
    return `${API_BASE_URL}/certificates/${certificateId}/download`;
  }
};

export default skillGapApi;
