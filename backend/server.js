// agent-notes: { ctx: "Main Express API server with MongoDB connection, CORS, health check, and route mounts", deps: ["dotenv", "express", "cors", "mongoose", "./routes/*"], state: "active", last: "anti@2026-08-25" }
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

// Middleware ensuring DB connection check does not block or timeout serverless requests
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
      await Promise.race([
        connectDB(),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
    }
  } catch (err) {
    console.error('[DB Middleware] Error checking DB connection:', err.message);
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
app.use("/api/resume", resumeRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api", aptitudeRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const supabaseCheck = await Promise.race([
      checkSupabaseConnection(),
      new Promise(resolve => setTimeout(() => resolve({ connected: false, status: 'TIMEOUT' }), 1000))
    ]);
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
      supabaseStatus: supabaseCheck?.connected ? (supabaseCheck.status || "CONNECTED") : "DISCONNECTED",
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
  } catch (err) {
    res.json({
      status: "OK",
      service: "SkillBridge AI API",
      fallback: true,
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL && !process.env.NOW_REGION && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
