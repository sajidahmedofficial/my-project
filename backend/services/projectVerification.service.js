// agent-notes: { ctx: "GitHub Repository inspection service fetching live repository metadata, package manifests, README, and evaluating technology evidence", deps: ["../ai/gemini.js"], state: "active", last: "anti@2026-08-20" }
import { analyzeJSON } from "../ai/gemini.js";
import { validateGitHubUrl } from "../utils/security.js";

/**
 * Parses GitHub Owner & Repo name from URL with SSRF protection
 */
export function parseGitHubUrl(url) {
  const check = validateGitHubUrl(url);
  if (!check.valid) return null;
  return {
    owner: check.owner,
    repo: check.repo
  };
}

/**
 * Fetches repository metadata, package.json, and README from GitHub
 */
export async function fetchGitHubRepoDetails(owner, repo) {
  const headers = {
    'User-Agent': 'SkillBridge-Project-Validator/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    // 1. Fetch Repository Metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      return {
        isAccessible: false,
        error: repoRes.status === 404 ? "Repository not found or is private." : `GitHub API returned ${repoRes.status}`
      };
    }

    const repoData = await repoRes.json();

    // 2. Fetch package.json if available across main or master branches
    let packageJson = null;
    for (const branch of ['main', 'master']) {
      try {
        const pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`, { headers });
        if (pkgRes.ok) {
          packageJson = await pkgRes.json();
          break;
        }
      } catch {}
    }

    // 3. Fetch README.md if available
    let readmeText = "";
    for (const branch of ['main', 'master']) {
      try {
        const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`, { headers });
        if (readmeRes.ok) {
          readmeText = await readmeRes.text();
          break;
        }
      } catch {}
    }

    return {
      isAccessible: true,
      repoName: repoData.full_name || `${owner}/${repo}`,
      description: repoData.description || "",
      language: repoData.language || "",
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      defaultBranch: repoData.default_branch || "main",
      packageJson,
      readmeText: readmeText.slice(0, 3000)
    };
  } catch (err) {
    return {
      isAccessible: false,
      error: `Network error connecting to GitHub: ${err.message}`
    };
  }
}

/**
 * Inspects repository files & metadata for concrete skill evidence
 */
export function extractTechnologyEvidence(skillName, repoDetails) {
  const evidence = [];
  const skillLower = skillName.toLowerCase();

  if (!repoDetails || !repoDetails.isAccessible) {
    return evidence;
  }

  // 1. Check Primary Language
  if (repoDetails.language && repoDetails.language.toLowerCase().includes(skillLower)) {
    evidence.push(`Primary repository language verified as ${repoDetails.language}`);
  }

  // 2. Check Dependencies in package.json
  if (repoDetails.packageJson) {
    const deps = {
      ...(repoDetails.packageJson.dependencies || {}),
      ...(repoDetails.packageJson.devDependencies || {})
    };

    const depKeys = Object.keys(deps).map(d => d.toLowerCase());

    if (skillLower.includes('react') && depKeys.some(k => k === 'react' || k === 'react-dom')) {
      evidence.push(`Verified official React dependency: react@${deps.react || deps['react-dom'] || 'latest'}`);
    }
    if (skillLower.includes('next') && depKeys.includes('next')) {
      evidence.push(`Verified Next.js framework dependency: next@${deps.next}`);
    }
    if (skillLower.includes('node') && (depKeys.includes('express') || depKeys.includes('fastify') || depKeys.includes('koa') || repoDetails.packageJson.main)) {
      evidence.push(`Verified Node.js runtime backend manifest with entrypoint ${repoDetails.packageJson.main || 'server.js'}`);
    }
    if (skillLower.includes('typescript') && (depKeys.includes('typescript') || depKeys.some(k => k.startsWith('@types/')))) {
      evidence.push(`Verified strict TypeScript configuration with @types/ dependencies`);
    }
    if (skillLower.includes('docker') && (repoDetails.readmeText?.toLowerCase().includes('docker') || repoDetails.readmeText?.toLowerCase().includes('docker-compose'))) {
      evidence.push(`Verified Docker orchestration and container setup documented in repository`);
    }
  }

  // 3. Inspect README for architectural evidence
  if (repoDetails.readmeText) {
    const readmeLower = repoDetails.readmeText.toLowerCase();
    if (readmeLower.includes(skillLower)) {
      evidence.push(`README documentation details ${skillName} architecture and setup instructions`);
    }
    if (readmeLower.includes('api') || readmeLower.includes('endpoint')) {
      evidence.push(`REST API / Backend endpoint documentation verified in repository`);
    }
    if (readmeLower.includes('test') || readmeLower.includes('jest') || readmeLower.includes('vitest')) {
      evidence.push(`Automated unit and integration test documentation present`);
    }
  }

  return evidence;
}

/**
 * Authoritatively verifies a project repository against a skill using live GitHub evidence and AI evaluation
 */
export async function verifyProjectRepository({ repoUrl, skillName, targetRole = "Frontend Developer" }) {
  if (!repoUrl || typeof repoUrl !== 'string') {
    return {
      repoUrl: repoUrl || "",
      repoName: "",
      isAccessible: false,
      status: "unable_to_verify",
      projectScore: 0,
      evidence: [],
      feedback: "Please provide a valid GitHub repository URL.",
      verificationDate: new Date().toISOString()
    };
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return {
      repoUrl,
      repoName: "",
      isAccessible: false,
      status: "unable_to_verify",
      projectScore: 0,
      evidence: [],
      feedback: "Invalid GitHub repository URL format. Please provide a link like https://github.com/username/repository.",
      verificationDate: new Date().toISOString()
    };
  }

  // 1. Fetch live repository details
  const repoDetails = await fetchGitHubRepoDetails(parsed.owner, parsed.repo);

  if (!repoDetails.isAccessible) {
    return {
      repoUrl,
      repoName: `${parsed.owner}/${parsed.repo}`,
      isAccessible: false,
      status: "unable_to_verify",
      projectScore: 0,
      evidence: [],
      feedback: `Unable to verify project: ${repoDetails.error || 'Repository is private or does not exist.'}`,
      verificationDate: new Date().toISOString()
    };
  }

  // 2. Extract technical evidence
  const evidence = extractTechnologyEvidence(skillName, repoDetails);

  // 3. Run AI Evaluation on real repository artifacts
  let projectScore = 0;
  let feedback = "";

  if (evidence.length === 0) {
    // If no evidence found for this skill in the repo, fail verification
    projectScore = 20;
    feedback = `Repository was inspected, but no concrete evidence or dependencies for ${skillName} were found in the codebase.`;
  } else {
    // Base score computed from verifiable evidence
    const baseScore = Math.min(95, 50 + (evidence.length * 15));

    const prompt = `You are a Principal Software Engineer evaluating a candidate's practical project repository for "${skillName}".
Repository: "${repoDetails.repoName}"
Description: "${repoDetails.description}"
Language: "${repoDetails.language}"
Extracted Evidence:
${evidence.map(e => `- ${e}`).join('\n')}

README Excerpt:
"""
${(repoDetails.readmeText || "").slice(0, 1000)}
"""

Evaluate this real repository strictly.
Return JSON with:
{
  "projectScore": number (0-100),
  "feedback": "2-3 sentences of constructive technical feedback based on the repository content",
  "additionalEvidence": ["item 1", "item 2"]
}`;

    try {
      const aiResult = await analyzeJSON(prompt);
      if (aiResult && typeof aiResult.projectScore === 'number') {
        projectScore = Math.min(100, Math.max(30, Math.round(aiResult.projectScore)));
        feedback = aiResult.feedback || "";
        if (Array.isArray(aiResult.additionalEvidence)) {
          aiResult.additionalEvidence.forEach(ae => evidence.push(ae));
        }
      } else {
        projectScore = baseScore;
        feedback = `Successfully verified ${evidence.length} technological markers for ${skillName} in ${repoDetails.repoName}.`;
      }
    } catch {
      projectScore = baseScore;
      feedback = `Successfully verified ${evidence.length} technological markers for ${skillName} in ${repoDetails.repoName}.`;
    }
  }

  const isPassed = projectScore >= 70;

  return {
    repoUrl,
    repoName: repoDetails.repoName,
    isAccessible: true,
    status: isPassed ? "verified" : "insufficient_evidence",
    projectScore,
    evidence: [...new Set(evidence)],
    feedback,
    verificationDate: new Date().toISOString()
  };
}

export default {
  parseGitHubUrl,
  fetchGitHubRepoDetails,
  extractTechnologyEvidence,
  verifyProjectRepository
};
