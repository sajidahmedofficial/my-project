// agent-notes: { ctx: "Main Express API server with CORS, health check, and route mounts", deps: ["dotenv", "express", "cors", "./routes/*"], state: "active", last: "anti@2026-08-06" }
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import resumeRoutes from './routes/resume.routes.js';
import skillRoutes from './routes/skill.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';

import aiRoutes from './routes/ai.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);

app.use(express.json());

app.use("/api/ai", aiRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/roadmap", roadmapRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "SkillBridge Resume AI"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
