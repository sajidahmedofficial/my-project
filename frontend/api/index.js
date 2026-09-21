// agent-notes: { ctx: "Vercel serverless function entry point with resilient dynamic loader & error diagnostics", deps: [], state: "active", last: "anti@2026-08-30" }

let appPromise = null;

async function getApp() {
  if (!appPromise) {
    appPromise = import("../backend/server.js")
      .then(m => m.default || m)
      .catch(err => {
        console.error("[Vercel Serverless Loader Error]:", err);
        appPromise = null;
        throw err;
      });
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error("[Vercel Serverless Function Crash]:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        success: false,
        error: "Vercel Serverless Initialization Error",
        message: err.message,
        stack: err.stack
      }, null, 2));
    }
  }
}
