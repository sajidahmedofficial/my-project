// agent-notes: { ctx: "Express router for skill gap analysis and skill progress endpoints", deps: ["express", "../controllers/skill.controller.js"], state: "active", last: "anti@2026-08-06" }
import express from 'express';
import { getSkillGap, advanceSkill } from '../controllers/skill.controller.js';

const router = express.Router();

router.post('/gap', getSkillGap);
router.post('/advance', advanceSkill);

export default router;
