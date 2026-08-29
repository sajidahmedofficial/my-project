// agent-notes: { ctx: "AI Roleplay and simulation service managing scenario catalogs, real-time in-character conversations, and scored feedback analytics", deps: ["crypto", "../storage/persistentStore", "./geminiService", "../data/roleplayScenarios.data"], state: "active", last: "anti@2026-08-29" }

import crypto from 'crypto';
import { readCollection, writeCollection } from '../storage/persistentStore.js';
import { DEFAULT_SCENARIOS } from '../data/roleplayScenarios.data.js';
import { analyzeWithGemini } from './geminiService.js';

const SCENARIOS_COLLECTION = 'roleplay_scenarios';
const SESSIONS_COLLECTION = 'roleplay_sessions';
const MESSAGES_COLLECTION = 'roleplay_messages';
const FEEDBACK_COLLECTION = 'roleplay_feedback';

/**
 * Initializes default scenarios in storage if not already loaded.
 */
function ensureScenariosInitialized() {
  const existing = readCollection(SCENARIOS_COLLECTION);
  if (!existing || existing.length === 0) {
    writeCollection(SCENARIOS_COLLECTION, DEFAULT_SCENARIOS);
    return DEFAULT_SCENARIOS;
  }
  return existing;
}

/**
 * Get all available scenarios (system built-in + user custom)
 */
export async function getScenarios(userId = 'default_user') {
  const scenarios = ensureScenariosInitialized();
  return scenarios.filter(s => s.is_system || s.user_id === userId || !s.user_id);
}

/**
 * Get single scenario by ID
 */
export async function getScenarioById(scenarioId, userId = 'default_user') {
  const scenarios = ensureScenariosInitialized();
  return scenarios.find(s => s.id === scenarioId && (s.is_system || s.user_id === userId || !s.user_id)) || null;
}

/**
 * Create a new custom scenario
 */
export async function createScenario({ title, category, persona_description, objective, difficulty = 'medium' }, userId = 'default_user') {
  const scenarios = ensureScenariosInitialized();
  const newScenario = {
    id: `sc_custom_${crypto.randomUUID()}`,
    user_id: userId,
    title: title.trim(),
    category: category.trim(),
    persona_description: persona_description.trim(),
    objective: objective.trim(),
    difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
    is_system: false,
    created_at: new Date().toISOString()
  };

  scenarios.unshift(newScenario);
  writeCollection(SCENARIOS_COLLECTION, scenarios);
  return newScenario;
}

/**
 * Delete a custom scenario (only user-created ones)
 */
export async function deleteScenario(scenarioId, userId = 'default_user') {
  const scenarios = ensureScenariosInitialized();
  const index = scenarios.findIndex(s => s.id === scenarioId && !s.is_system && (s.user_id === userId || !s.user_id));
  if (index === -1) {
    return false;
  }
  scenarios.splice(index, 1);
  writeCollection(SCENARIOS_COLLECTION, scenarios);
  return true;
}

/**
 * Builds the AI system prompt for maintaining character
 */
function buildRoleplaySystemPrompt(scenario) {
  return [
    `You are role-playing as a character in an immersive training simulation.`,
    `Stay strictly in character at all times. Never break character, never mention that you are an AI, and never evaluate the trainee during dialogue.`,
    ``,
    `Character Persona & Behavior: ${scenario.persona_description}`,
    `Scenario Category: ${scenario.category}`,
    `Difficulty Level: ${scenario.difficulty}`,
    `Trainee Goal/Objective: ${scenario.objective} (Do NOT mention this objective to them directly. Simply interact naturally as your persona.)`,
    ``,
    `Dialogue Guidelines:`,
    `- Keep replies conversational, concise, and realistic (1-4 sentences), exactly like spoken dialogue.`,
    `- React dynamically and believably to what the trainee actually says.`,
    `- If the difficulty is 'hard', challenge weak reasoning and test their depth; if 'easy', be more receptive.`
  ].join('\n');
}

/**
 * Generates an opening line from the AI character
 */
export async function generateOpeningLine(scenario) {
  try {
    const systemPrompt = buildRoleplaySystemPrompt(scenario);
    const userPrompt = `${systemPrompt}\n\nTask: Begin the simulation scenario now. Deliver only your opening line of spoken dialogue as your character to initiate the conversation with the trainee.`;
    
    const reply = await analyzeWithGemini(userPrompt, { temperature: 0.8 });
    if (reply && reply.trim()) {
      return reply.trim().replace(/^["']|["']$/g, '');
    }
  } catch (err) {
    console.warn('[Roleplay Service] Gemini AI opening fallback:', err.message);
  }

  // Realistic persona-based fallbacks
  if (scenario.category === 'interview') {
    return `Hello. Thanks for joining today. I reviewed your background, and I want to dive straight into your approach to system architecture and problem solving. Shall we begin?`;
  } else if (scenario.category === 'career' || scenario.title.toLowerCase().includes('salary')) {
    return `Hi! We are really excited about the possibility of having you join our team. I wanted to touch base regarding the offer details we sent over. How are you feeling about the package?`;
  } else if (scenario.category === 'workplace') {
    return `Hey, thanks for syncing up quickly. As you know, the upcoming milestone is critical for the client demo, and we really need these updates included. How quickly can we commit them to this sprint?`;
  } else if (scenario.category === 'leadership') {
    return `Thank you everyone for hopping on this postmortem bridge so quickly. We had a significant service degradation earlier today, and I want us to understand the timeline and core failure points clearly.`;
  }

  return `Hello, thank you for meeting with me today. Let's discuss our priorities and how we can achieve our goals.`;
}

/**
 * Generates in-character reply to trainee's latest message
 */
export async function generateCharacterReply(scenario, history) {
  try {
    const systemPrompt = buildRoleplaySystemPrompt(scenario);
    const formattedHistory = history.map(m => `${m.role === 'user' ? 'Trainee' : 'Character'}: ${m.content}`).join('\n');
    const prompt = `${systemPrompt}\n\nConversation Transcript so far:\n${formattedHistory}\n\nGenerate Character's next spoken line of dialogue (1-3 sentences, staying fully in character):`;

    const reply = await analyzeWithGemini(prompt, { temperature: 0.75 });
    if (reply && reply.trim()) {
      return reply.trim().replace(/^["']|["']$/g, '').replace(/^Character:\s*/i, '');
    }
  } catch (err) {
    console.warn('[Roleplay Service] Gemini AI reply fallback:', err.message);
  }

  // Dynamic context-aware offline conversational fallback
  const lastUserMsg = [...history].reverse().find(m => m.role === 'user')?.content || '';
  if (lastUserMsg.length < 25) {
    return `Could you expand on that with more technical specifics or concrete examples?`;
  }
  if (lastUserMsg.toLowerCase().includes('database') || lastUserMsg.toLowerCase().includes('cache')) {
    return `That makes sense on paper, but how would your approach handle sudden failover or high concurrency spikes?`;
  }
  if (lastUserMsg.toLowerCase().includes('budget') || lastUserMsg.toLowerCase().includes('salary') || lastUserMsg.toLowerCase().includes('compensation')) {
    return `I understand your perspective, but our bands are structured around internal equity. What flexibility do you have on start dates or performance-based incentives?`;
  }

  return `I hear your point. Given our constraints and the risks involved, walk me through how you plan to execute that step by step.`;
}

/**
 * Evaluates the full transcript and generates coaching feedback
 */
export async function generateSessionFeedback(scenario, history) {
  const traineeLines = history.filter(m => m.role === 'user');
  if (traineeLines.length === 0) {
    return {
      overall_score: 50,
      strengths: ['Started the session promptly'],
      improvements: ['Participate actively and provide detailed responses during roleplay'],
      summary: 'Session ended before sufficient dialogue exchange took place.'
    };
  }

  try {
    const transcript = history.map(m => `${m.role === 'user' ? 'TRAINEE' : 'CHARACTER'}: ${m.content}`).join('\n');
    const prompt = [
      `You are an executive communication coach and technical hiring assessor.`,
      `Review this roleplay simulation transcript:`,
      `Scenario: ${scenario.title}`,
      `Category: ${scenario.category}`,
      `Difficulty: ${scenario.difficulty}`,
      `Trainee Target Objective: ${scenario.objective}`,
      ``,
      `Full Transcript:`,
      transcript,
      ``,
      `Evaluate ONLY the TRAINEE lines. Return a strictly valid JSON object matching this schema with NO markdown code fences or conversational text:`,
      `{`,
      `  "overall_score": <number between 40 and 98 based on clarity, empathy, technical rigor, and objective fulfillment>,`,
      `  "strengths": [<2 to 4 specific positive observations with examples from trainee lines>],`,
      `  "improvements": [<2 to 4 constructive, actionable tactical improvements>],`,
      `  "summary": "<2-3 sentence high-impact summary of overall communication and outcome>"}`,
      `}`
    ].join('\n');

    const raw = await analyzeWithGemini(prompt, { jsonMode: true, temperature: 0.4 });
    const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      overall_score: Math.max(35, Math.min(99, Math.round(Number(parsed.overall_score) || 75))),
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths.slice(0, 5) : [
        'Maintained a professional, composed demeanor throughout the exchange',
        'Directly addressed the counterparty’s key concerns'
      ],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length ? parsed.improvements.slice(0, 5) : [
        'Provide more concrete metrics and data points to substantiate arguments',
        'Structure key points using framework-based communication (e.g., Situation-Action-Result)'
      ],
      summary: parsed.summary || 'Demonstrated solid conversational engagement and effectively navigated the core challenges of the scenario.'
    };
  } catch (err) {
    console.warn('[Roleplay Service] Feedback generation fallback:', err.message);

    // Heuristic feedback calculation based on message count and depth
    const totalWords = traineeLines.reduce((acc, m) => acc + (m.content || '').split(/\s+/).length, 0);
    const avgWordsPerReply = totalWords / traineeLines.length;
    let score = 70;
    if (avgWordsPerReply > 30) score += 12;
    if (traineeLines.length >= 3) score += 8;
    score = Math.min(92, Math.max(55, score));

    return {
      overall_score: score,
      strengths: [
        'Maintained consistent active participation across conversational turns',
        'Articulated responses clearly with relevant situational awareness',
        'Remained constructive while navigating constraints'
      ],
      improvements: [
        'Add more specific quantifiable outcomes or technical architecture details',
        'Proactively clarify implicit assumptions earlier in the discussion'
      ],
      summary: `Completed ${traineeLines.length} conversational turns with an average response depth of ${Math.round(avgWordsPerReply)} words. Demonstrated effective problem solving under simulation pressure.`
    };
  }
}

/**
 * Start a new roleplay session
 */
export async function startRoleplaySession(scenarioId, userId = 'default_user') {
  const scenario = await getScenarioById(scenarioId, userId);
  if (!scenario) {
    throw new Error('Scenario not found');
  }

  const sessions = readCollection(SESSIONS_COLLECTION);
  const messages = readCollection(MESSAGES_COLLECTION);

  const session = {
    id: `sess_${crypto.randomUUID()}`,
    user_id: userId,
    scenario_id: scenarioId,
    status: 'active',
    started_at: new Date().toISOString(),
    ended_at: null
  };

  sessions.unshift(session);
  writeCollection(SESSIONS_COLLECTION, sessions);

  // Generate opening line
  const openingContent = await generateOpeningLine(scenario);
  const openingMessage = {
    id: `msg_${crypto.randomUUID()}`,
    session_id: session.id,
    role: 'assistant',
    content: openingContent,
    created_at: new Date().toISOString()
  };

  messages.push(openingMessage);
  writeCollection(MESSAGES_COLLECTION, messages);

  return {
    session,
    scenario,
    messages: [openingMessage]
  };
}

/**
 * Post user message to a session and get character response
 */
export async function postUserMessage(sessionId, content, userId = 'default_user') {
  const sessions = readCollection(SESSIONS_COLLECTION);
  const session = sessions.find(s => s.id === sessionId && (s.user_id === userId || !s.user_id));
  if (!session) throw new Error('Session not found');
  if (session.status !== 'active') throw new Error('Session has already completed');

  const scenario = await getScenarioById(session.scenario_id, userId);
  const messages = readCollection(MESSAGES_COLLECTION);

  const userMsg = {
    id: `msg_${crypto.randomUUID()}`,
    session_id: sessionId,
    role: 'user',
    content: content.trim(),
    created_at: new Date().toISOString()
  };
  messages.push(userMsg);

  // Session message history for AI context
  const sessionHistory = messages.filter(m => m.session_id === sessionId);

  // Generate AI reply
  const replyContent = await generateCharacterReply(scenario, sessionHistory);
  const assistantMsg = {
    id: `msg_${crypto.randomUUID()}`,
    session_id: sessionId,
    role: 'assistant',
    content: replyContent,
    created_at: new Date().toISOString()
  };
  messages.push(assistantMsg);

  writeCollection(MESSAGES_COLLECTION, messages);

  return {
    userMessage: userMsg,
    assistantMessage: assistantMsg
  };
}

/**
 * Get full session details, messages, and feedback if completed
 */
export async function getSessionDetails(sessionId, userId = 'default_user') {
  const sessions = readCollection(SESSIONS_COLLECTION);
  const session = sessions.find(s => s.id === sessionId && (s.user_id === userId || !s.user_id));
  if (!session) return null;

  const scenario = await getScenarioById(session.scenario_id, userId);
  const messages = readCollection(MESSAGES_COLLECTION).filter(m => m.session_id === sessionId);
  const feedbacks = readCollection(FEEDBACK_COLLECTION);
  const feedback = feedbacks.find(f => f.session_id === sessionId) || null;

  return {
    session,
    scenario,
    messages,
    feedback
  };
}

/**
 * End a session and generate feedback
 */
export async function endRoleplaySession(sessionId, userId = 'default_user') {
  const sessions = readCollection(SESSIONS_COLLECTION);
  const sessionIndex = sessions.findIndex(s => s.id === sessionId && (s.user_id === userId || !s.user_id));
  if (sessionIndex === -1) throw new Error('Session not found');

  const session = sessions[sessionIndex];
  const scenario = await getScenarioById(session.scenario_id, userId);
  const messages = readCollection(MESSAGES_COLLECTION).filter(m => m.session_id === sessionId);

  const feedbackData = await generateSessionFeedback(scenario, messages);

  const feedbacks = readCollection(FEEDBACK_COLLECTION);
  const feedback = {
    id: `fb_${crypto.randomUUID()}`,
    session_id: sessionId,
    scenario_id: session.scenario_id,
    user_id: userId,
    overall_score: feedbackData.overall_score,
    strengths: feedbackData.strengths,
    improvements: feedbackData.improvements,
    summary: feedbackData.summary,
    created_at: new Date().toISOString()
  };

  const existingFbIndex = feedbacks.findIndex(f => f.session_id === sessionId);
  if (existingFbIndex >= 0) {
    feedbacks[existingFbIndex] = feedback;
  } else {
    feedbacks.unshift(feedback);
  }
  writeCollection(FEEDBACK_COLLECTION, feedbacks);

  session.status = 'completed';
  session.ended_at = new Date().toISOString();
  session.overall_score = feedbackData.overall_score;
  sessions[sessionIndex] = session;
  writeCollection(SESSIONS_COLLECTION, sessions);

  return {
    session,
    scenario,
    feedback
  };
}

/**
 * Get user roleplay history with scenarios and scores
 */
export async function getUserRoleplayHistory(userId = 'default_user') {
  const sessions = readCollection(SESSIONS_COLLECTION).filter(s => s.user_id === userId || !s.user_id);
  const scenarios = ensureScenariosInitialized();
  const feedbacks = readCollection(FEEDBACK_COLLECTION);

  return sessions.map(s => {
    const sc = scenarios.find(item => item.id === s.scenario_id) || {};
    const fb = feedbacks.find(item => item.session_id === s.id) || null;
    return {
      id: s.id,
      status: s.status,
      started_at: s.started_at,
      ended_at: s.ended_at,
      scenario_id: s.scenario_id,
      scenario_title: sc.title || 'Custom Roleplay Scenario',
      scenario_category: sc.category || 'general',
      scenario_difficulty: sc.difficulty || 'medium',
      overall_score: fb ? fb.overall_score : (s.overall_score || null),
      feedback_summary: fb ? fb.summary : null
    };
  });
}
