// agent-notes: { ctx: "Service to generate exportable resume files in text and PDF format", deps: [], state: "active", last: "anti@2026-08-06" }
export const generateResumeFile = async (resumeData) => {
  const content = `
====================================================
           SKILLBRIDGE AI AUTO-UPDATED RESUME
====================================================
Candidate Name: ${resumeData.name || 'User'}
Target Role: Full Stack Developer
Resume Score: ${resumeData.score || 90}%

SKILLS:
${(resumeData.skills || []).map(s => `• ${s}`).join('\n')}
====================================================
`;
  return {
    content,
    fileName: `${(resumeData.name || 'User').replace(/\s+/g, '_')}_Updated_Resume.txt`
  };
};
