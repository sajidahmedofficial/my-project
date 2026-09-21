// agent-notes: { ctx: "Express server entrypoint with authentication and AI API routes", deps: ["express", "./controllers/authController.js", "./controllers/aiController.js"], state: "active", last: "anti@2026-07-31" }
import express from 'express';
import * as authController from './controllers/authController.js';
import * as aiController from './controllers/aiController.js';

const app = express();
app.use(express.json());

// CORS headers for Vite frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Authentication Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/verify-2fa', authController.verify2FA);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/onboarding', authController.completeOnboarding);
app.post('/api/auth/social-callback', authController.socialAuthCallback);

// AI & Personalization Routes
app.post('/api/ai/analyze-resume', aiController.analyzeResume);
app.post('/api/ai/skill-gap', aiController.analyzeSkillGap);
app.post('/api/ai/generate-roadmap', aiController.generateWeeklyRoadmap);
app.post('/api/ai/analyze-jd', aiController.analyzeJD);
app.post('/api/ai/chat', aiController.chat);
app.post('/api/ai/evaluate-interview', aiController.evaluateInterview);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SkillBridge AI Express server running on port ${PORT}`);
});

export default app;
