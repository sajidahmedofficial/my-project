// agent-notes: { ctx: "All-in-one runner to simultaneously boot Express backend and Vite frontend", deps: ["child_process"], state: "active", last: "anti@2026-08-30" }
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[35m%s\x1b[0m', '       🚀 STARTING SKILLBRIDGE (ALL-IN-ONE)       ');
console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[33m%s\x1b[0m', '➜ Starting Backend API Server (Port 5000)...');
console.log('\x1b[33m%s\x1b[0m', '➜ Starting Frontend Vite App   (Port 5173)...');
console.log('\x1b[36m%s\x1b[0m', '==================================================\n');

// 1. Launch Backend (Express)
const server = spawn('node', ['backend/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: process.env.PORT || '5000' }
});

// 2. Launch Frontend (Vite)
const frontend = spawn('npx', ['vite'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

function cleanup() {
  console.log('\n\x1b[31m%s\x1b[0m', 'Shutting down SkillBridge services...');
  server.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
