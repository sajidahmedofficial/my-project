// agent-notes: { ctx: "Dedicated Gemini Prompt Builder constructing rich, diverse, placement-focused MCQ generation prompts", deps: [], state: "active", last: "anti@2026-08-04" }

/**
 * Dedicated prompt builder for generating high-quality placement aptitude MCQs via Gemini API.
 * Enforces strict pedagogical guidelines, pattern diversity, and machine-readable JSON schema output.
 * 
 * @param {Object} params
 * @param {string} params.topic - Topic title (e.g. "Percentage")
 * @param {string} params.topicId - Topic identifier slug (e.g. "percentage")
 * @param {string} params.category - Category title (e.g. "Quantitative Aptitude")
 * @param {string} params.difficulty - Difficulty level ("easy" | "medium" | "hard" | "expert")
 * @param {number} params.count - Target number of questions to generate (default: 20)
 * @returns {string} Formatted prompt string ready for Gemini API
 */
export function buildQuestionGenerationPrompt({
  topic = 'Percentage',
  topicId = 'percentage',
  category = 'Quantitative Aptitude',
  difficulty = 'medium',
  count = 20
} = {}) {
  return `You are an expert Indian Campus Placement Aptitude Test Creator for top engineering hiring drives (TCS NQT, Infosys, Accenture, Wipro, Cognizant, Capgemini).

Generate exactly ${count} unique, placement-grade multiple-choice questions (MCQs) for the specified topic below:

Topic: "${topic}" (topicId: "${topicId}")
Category: "${category}"
Difficulty Level: "${difficulty}"

==================================================
STRICT REQUIREMENTS
==================================================
1. TOPIC RELEVANCE: Every single question must directly test concept knowledge of "${topic}".
2. EXAM LEVEL: Questions must be suitable for college engineering placement examinations.
3. OPTIONS COUNT: Every question must contain EXACTLY 4 distinct options.
4. SINGLE CORRECT ANSWER: Exactly ONE option must be correct.
5. MATHEMATICAL VERIFIABILITY: The correct answer must be 100% mathematically and logically verifiable.
6. EXPLANATION: Provide a clear, detailed explanation of why the correct option is right.
7. STEP-BY-STEP SOLUTION: Provide a step-by-step calculation or logical derivation flow.
8. NO DUPLICATES: Do NOT generate duplicate or near-duplicate questions.
9. NO REPETITIVE PATTERNS: Vary numbers, names, contexts, and formulas. Avoid repeating the same numbers or pattern excessively.
10. DIVERSE QUESTION PATTERNS: Include a mix of different problem types such as:
    - Direct calculations
    - Application & word problems
    - Data comparison
    - Reverse calculations
    - Missing value determination
    - Percentage increase / decrease
    - Successive percentage / compound changes
    - Real campus placement scenario problems
11. AMBIGUITY PROHIBITION: Avoid ambiguous phrasing or questions where multiple options could be interpreted as correct.
12. FORBIDDEN OPTIONS: Do NOT use "all of the above", "all of these", "none of the above", or "none of these".

==================================================
JSON SCHEMA SPECIFICATION
==================================================
Return ONLY valid JSON matching this exact structure:
{
  "questions": [
    {
      "topicId": "${topicId}",
      "topic": "${topic}",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "question": "Clear, unambiguous placement question text here?",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correctAnswer": 1,
      "explanation": "Detailed explanation of why Option B is correct.",
      "solution": "Step 1: Formula... Step 2: Calculation... Answer = Option B",
      "tags": ["${topicId}", "${difficulty}"]
    }
  ]
}

CRITICAL: "correctAnswer" MUST be an integer index (0, 1, 2, or 3) pointing to the correct option string inside the 4-item "options" array.
Do NOT include any markdown code blocks, conversational intro, or trailing text outside the JSON object.`;
}
