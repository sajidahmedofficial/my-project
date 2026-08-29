// agent-notes: { ctx: "Main Express API server with MongoDB connection, CORS, health check, and route mounts including roleplay simulation", deps: ["dotenv", "express", "cors", "mongoose", "./routes/*"], state: "active", last: "anti@2026-08-29" }
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
import { roleplayRouter } from './routes/roleplay.routes.js';
import { checkSupabaseConnection } from './services/supabase.service.js';
import { aiRateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Cached database connection promise for serverless cold starts & Node runtime
let dbConnectionPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (dbConnectionPromise) {
    return dbConnectionPromise;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.info('[DB] No MONGODB_URI configured. Running in resilient local store / demo mode.');
    return null;
  }

  dbConnectionPromise = mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000
  }).then((conn) => {
    console.log(`[DB] MongoDB connected successfully to database: "${conn.connection.name}". Connection state: CONNECTED (readyState: 1)`);
    return conn.connection;
  }).catch((err) => {
    console.error(`[DB] MongoDB connection attempt failed (${err.name}: ${err.message}). Check MONGODB_URI credentials or network access. Operating in resilient fallback mode.`);
    dbConnectionPromise = null;
    return null;
  });

  return dbConnectionPromise;
}

// Immediately initiate connection on module load
connectDB().catch(() => {});

// Middleware ensuring DB connection check completes before routes handle requests (critical for serverless / cold starts)
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (err) {
      console.error('[DB Middleware] Error checking DB connection:', err.message);
    }
  }
  next();
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*"
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRateLimiter, aiRoutes);
app.use("/api/skill-gap", aiRateLimiter, skillGapRoutes);
app.use("/api/roleplay", roleplayRouter);
app.use("/api/resume", resumeRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api", aptitudeRoutes);

app.get("/api/health", async (req, res) => {
  const supabaseCheck = await checkSupabaseConnection();
  const readyState = mongoose.connection.readyState;
  const stateLabels = {
    0: "DISCONNECTED",
    1: "CONNECTED",
    2: "CONNECTING",
    3: "DISCONNECTING"
  };

  res.json({
    status: "OK",
    service: "SkillBridge AI API",
    database: readyState === 1 ? "CONNECTED" : (process.env.MONGODB_URI ? `ERROR_${stateLabels[readyState] || "OFFLINE"}` : "LOCAL_FALLBACK"),
    databaseReadyState: readyState,
    databaseStatus: stateLabels[readyState] || "UNKNOWN",
    supabaseStatus: supabaseCheck.connected ? (supabaseCheck.status || "CONNECTED") : "DISCONNECTED",
    endpoints: [
      "/api/auth",
      "/api/ai",
      "/api/skill-gap",
      "/api/roleplay",
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

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
