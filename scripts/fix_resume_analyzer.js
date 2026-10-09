import fs from 'fs';
const path = 'c:/Users/Administrator/.gemini/antigravity/scratch/skillbridge-ai/backend/services/resumeAnalyzer.service.js';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes('function extractProfessionalSummary'));
const lastFuncIdx = lines.findIndex((l, i) => i > startIdx && l.includes('function extractEducationList'));
let actualEndIdx = lines.findIndex((l, i) => i > lastFuncIdx && l.startsWith('}'));

console.log('startIdx:', startIdx);
console.log('lastFuncIdx:', lastFuncIdx);
console.log('actualEndIdx:', actualEndIdx);

if (startIdx !== -1 && actualEndIdx !== -1) {
  const extracted = lines.slice(startIdx, actualEndIdx + 1);
  lines.splice(startIdx, actualEndIdx - startIdx + 1);
  
  const insertIdx = lines.findIndex(l => l.includes('function generateRuleBasedAnalysis'));
  console.log('insertIdx:', insertIdx);
  
  if (insertIdx !== -1) {
    lines.splice(insertIdx, 0, ...extracted, '');
    fs.writeFileSync(path, lines.join('\n'), 'utf8');
    console.log('Successfully moved functions.');
  } else {
    console.log('Could not find insert position.');
  }
} else {
  console.log('Could not find functions to extract.');
}
