const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.AI_MODEL || 'claude-sonnet-4-5-20250929';

async function callClaude({ system, messages, maxTokens = 600 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set on the server.');
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const textBlock = (data.content || []).find((c) => c.type === 'text');
  return textBlock ? textBlock.text : '';
}

function buildRoleplaySystemPrompt(scenario) {
  return [
    `You are role-playing as a character in a training simulation. Stay fully in character at all times — never break character, never mention that you are an AI, and never comment on the quality of the trainee's performance during the conversation itself.`,
    ``,
    `Character and behavior: ${scenario.persona_description}`,
    ``,
    `Scenario category: ${scenario.category}`,
    `Difficulty level: ${scenario.difficulty}`,
    `The trainee's objective (do not state this explicitly to them, just respond naturally as your character would): ${scenario.objective}`,
    ``,
    `Keep replies conversational and realistic — typically 1-4 sentences, like real spoken dialogue, not an essay. React believably to what the trainee actually says.`,
  ].join('\n');
}

export async function getRoleplayOpeningLine(scenario) {
  const system = buildRoleplaySystemPrompt(scenario);
  const reply = await callClaude({
    system,
    messages: [
      {
        role: 'user',
        content:
          'Begin the scenario now. Deliver only your opening line of dialogue as your character, as if the conversation is just starting.',
      },
    ],
    maxTokens: 200,
  });
  return reply.trim();
}

export async function getRoleplayReply(scenario, history) {
  const system = buildRoleplaySystemPrompt(scenario);
  const messages = history.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));
  const reply = await callClaude({ system, messages, maxTokens: 400 });
  return reply.trim();
}

export async function getFeedback(scenario, history) {
  const transcript = history
    .map((m) => `${m.role === 'user' ? 'TRAINEE' : 'CHARACTER'}: ${m.content}`)
    .join('\n');

  const system = [
    'You are an expert communication coach reviewing a training roleplay transcript.',
    `Scenario: ${scenario.title}`,
    `Category: ${scenario.category}`,
    `Trainee's objective: ${scenario.objective}`,
    '',
    'Evaluate ONLY the lines marked TRAINEE. Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:',
    '{"overall_score": <integer 0-100>, "strengths": [<2-4 short strings>], "improvements": [<2-4 short strings>], "summary": "<2-3 sentence summary>"}',
  ].join('\n');

  const raw = await callClaude({
    system,
    messages: [{ role: 'user', content: `Transcript:\n\n${transcript}` }],
    maxTokens: 500,
  });

  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
  try {
    const parsed = JSON.parse(cleaned);
    return {
      overall_score: Math.max(0, Math.min(100, Math.round(parsed.overall_score))),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 6) : [],
      summary: parsed.summary || '',
    };
  } catch (err) {
    return {
      overall_score: 0,
      strengths: [],
      improvements: [],
      summary: 'Feedback could not be generated automatically for this session.',
    };
  }
}
