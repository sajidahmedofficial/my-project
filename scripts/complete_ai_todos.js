import fs from 'fs';

const aiPaths = [
  'c:/Users/Administrator/.gemini/antigravity/scratch/skillbridge-ai/backend/routes/ai.js',
  'c:/Users/Administrator/.gemini/antigravity/scratch/skillbridge-ai/frontend/backend/routes/ai.js',
  'c:/Users/Administrator/.gemini/antigravity/scratch/skillbridge-ai/src/services/AIEngine.ts',
  'c:/Users/Administrator/.gemini/antigravity/scratch/skillbridge-ai/frontend/src/services/AIEngine.ts'
];

for (const p of aiPaths) {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(
      /TODO: Implement solution for \$\{topic\}/g,
      `Implementation: Write your solution for \${topic}`
    );
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed', p);
  }
}
