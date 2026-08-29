// agent-notes: { ctx: "Vercel serverless function entry point for Express API", deps: ["../backend/server.js"], state: "active", last: "anti@2026-08-29" }
import app from '../backend/server.js';

export default function handler(req, res) {
  return app(req, res);
}
