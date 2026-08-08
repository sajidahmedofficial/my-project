// agent-notes: { ctx: "Express controller for skill gap analysis and skill progress tracking", deps: ["../services/skillGap.service.js", "../services/skillBridge.service.js"], state: "active", last: "anti@2026-08-06" }
import { calculateSkillGap } from '../services/skillGap.service.js';
import { updateSkillProgress } from '../services/skillBridge.service.js';

export const getSkillGap = async (req, res) => {
  const { userSkills = [], roleRequirements = [] } = req.body;
  const gap = await calculateSkillGap(userSkills, roleRequirements);
  return res.status(200).json({ success: true, data: gap });
};

export const advanceSkill = async (req, res) => {
  const { skillName, currentProgress = 0 } = req.body;
  const result = await updateSkillProgress(skillName, currentProgress);
  return res.status(200).json({ success: true, data: result });
};
