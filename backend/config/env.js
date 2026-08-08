// agent-notes: { ctx: "Backend environment configuration helper including frontendUrl", deps: ["dotenv"], state: "active", last: "anti@2026-08-06" }
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/skillbridge',
  jwtSecret: process.env.JWT_SECRET || 'skillbridge_secret_key',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

export default config;
