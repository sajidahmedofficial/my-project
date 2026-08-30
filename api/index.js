// agent-notes: { ctx: "Vercel serverless function entry point for Express API", deps: ["../backend/server.js"], state: "active", last: "anti@2026-08-30" }
import app from "../backend/server.js";

export default function handler(req, res) {
  try {
    // 1. Resolve actual path from Vercel rewrite headers
    const vercelPath = req.headers["x-matched-path"] || req.headers["x-vercel-matched-path"] || req.headers["x-rewrite-path"];
    if (vercelPath) {
      req.url = vercelPath;
    } else if (req.url && (req.url === "/api/index.js" || req.url.startsWith("/api/index.js"))) {
      const rest = req.url.replace("/api/index.js", "") || "/";
      req.url = rest.startsWith("/api") ? rest : `/api${rest.startsWith("/") ? "" : "/"}${rest}`;
    }

    // 2. Delegate to Express app
    return app(req, res);
  } catch (err) {
    console.error("[Vercel Serverless Function Error]:", err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Serverless Function Execution Error",
        message: err.message
      });
    }
  }
}
