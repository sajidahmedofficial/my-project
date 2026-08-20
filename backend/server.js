// agent-notes: { ctx: "Main Express API server with MongoDB connection, CORS, health check, and route mounts", deps: ["dotenv", "express", "cors", "mongoose", "./routes/*"], state: "active", last: "anti@2026-08-20" }
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import resumeRoutes from './routes/resume.routes.js';
import skillRoutes from './routes/skill.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import authRoutes from './routes/auth.js';
import aptitudeRoutes from './routes/aptitude.routes.js';
import skillGapRoutes from './routes/skillGap.routes.js';
import aiRoutes from './routes/ai.js';

const app = express();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
}).then(() => {
  console.log('MongoDB connected successfully.');
}).catch((err) => {
  console.warn('MongoDB offline notification (operating in resilient local store mode):', err.message);
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api", aptitudeRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "SkillBridge AI API",
    database: mongoose.connection.readyState === 1 ? "CONNECTED" : "LOCAL_FALLBACK",
    endpoints: [
      "/api/auth",
      "/api/ai",
      "/api/skill-gap",
      "/api/resume",
      "/api/skills",
      "/api/certificates",
      "/api/roadmap",
      "/api/aptitude",
      "/api/topics",
      "/api/categories"
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
