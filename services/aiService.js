import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

/**
 * AI Service for DebateArena AI using Google GenAI SDK.
 */

// Helper to sanitize API key string (strips outer quotes and whitespace)
const getApiKey = () => {
  const rawKey = process.env.GEMINI_API_KEY || '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
};

// Helper to check if API key is configured
export const isApiKeyConfigured = () => {
  const key = getApiKey();
  return Boolean(key && key !== '' && key !== 'YOUR_GEMINI_API_KEY' && key !== 'your_api_key_here');
};

// Helper to get GoogleGenAI client instance
const getGenAIClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server/.env');
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to get model name
const getModelName = () => {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
};

/**
 * Generates AI Opening Argument
 */
export const generateOpeningArgument = async ({ topic, aiPosition, userPosition, difficulty = 'Intermediate', style = 'Formal' }) => {
  if (!isApiKeyConfigured()) {
    return generateDemoOpening({ topic, aiPosition, difficulty, style });
  }

  const ai = getGenAIClient();
  const model = getModelName();

  const systemInstruction = `You are a skilled, respectful debate opponent participating in a formal structured debate on DebateArena AI.
Your assigned position on the topic "${topic}" is: ${aiPosition.toUpperCase()}.
The user's position is: ${userPosition.toUpperCase()}.
Difficulty level: ${difficulty}.
Debate style: ${style}.

Rules:
1. Firmly defend the ${aiPosition.toUpperCase()} position. Never switch sides or agree with the opposing stance.
2. Present a clear, captivating, and well-reasoned opening argument (120 - 200 words).
3. Match the requested style (${style}):
   - Formal: Structured, professional, articulate.
   - Friendly: Conversational, engaging, approachable yet persuasive.
   - Socratic: Ask a compelling core question that challenges the opposite view while stating your stance.
4. Adapt argument depth for difficulty (${difficulty}):
   - Beginner: Accessible language, relatable real-world examples.
   - Intermediate: Balanced statistics, structured points, clear logic.
   - Advanced: Nuanced concepts, systemic analysis, anticipating counters.
5. Do not write meta-commentary, greetings, or intro titles (like "Opening Argument:"). Jump straight into the argument.`;

  const prompt = `Topic: "${topic}"\nYour Position: ${aiPosition.toUpperCase()}\nUser Position: ${userPosition.toUpperCase()}\n\nPlease deliver your opening argument for the ${aiPosition.toUpperCase()} position.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text ? response.text.trim() : '';
    if (!text) {
      throw new Error('Received empty response from Gemini API');
    }
    return text;
  } catch (error) {
    console.error('[AIService] generateOpeningArgument error:', error.message);
    throw error;
  }
};

/**
 * Generates AI Counterargument / Rebuttal
 */
export const generateCounterArgument = async ({ topic, aiPosition, userPosition, difficulty = 'Intermediate', style = 'Formal', history = [], latestUserArgument }) => {
  if (!isApiKeyConfigured()) {
    return generateDemoCounter({ topic, aiPosition, latestUserArgument, history });
  }

  const ai = getGenAIClient();
  const model = getModelName();

  const systemInstruction = `You are an expert debate opponent in a live debate on DebateArena AI.
Topic: "${topic}"
Your Position: ${aiPosition.toUpperCase()}
User Position: ${userPosition.toUpperCase()}
Difficulty Level: ${difficulty}
Debate Style: ${style}

Rules:
1. Strictly defend the ${aiPosition.toUpperCase()} position. Never switch sides or concede your core thesis.
2. Respond DIRECTLY to the user's latest argument. Point out specific assumptions, logical flaws, missing evidence, or oversights in their statement.
3. Keep your counterargument sharp, coherent, and concise (120 - 200 words).
4. Maintain a respectful tone (no ad hominem or offensive language).
5. Build upon previous rounds without repeating verbatim points.
6. Do NOT include markdown labels like "AI Counterargument:" or stage directions.`;

  // Format conversation history for Gemini
  let formattedPrompt = `DEBATE TRANSCRIPT SO FAR:\nTopic: "${topic}"\nAI Position: ${aiPosition.toUpperCase()} | User Position: ${userPosition.toUpperCase()}\n\n`;

  history.forEach((msg) => {
    const sender = msg.role === 'user' ? 'USER' : 'AI OPPONENT';
    formattedPrompt += `[${sender}]: ${msg.content}\n\n`;
  });

  formattedPrompt += `[USER'S LATEST ARGUMENT]: ${latestUserArgument}\n\n`;
  formattedPrompt += `Formulate a direct counterargument defending the ${aiPosition.toUpperCase()} position and challenging the user's latest argument.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: formattedPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text ? response.text.trim() : '';
    if (!text) {
      throw new Error('Received empty response from Gemini API');
    }
    return text;
  } catch (error) {
    console.error('[AIService] generateCounterArgument error:', error.message);
    throw error;
  }
};

/**
 * AI Judge: Evaluates completed debate and returns structured JSON
 */
export const judgeDebate = async ({ topic, userPosition, history }) => {
  if (!isApiKeyConfigured()) {
    return generateDemoJudgeReport({ topic, userPosition, history });
  }

  const ai = getGenAIClient();
  const model = getModelName();

  const systemInstruction = `You are a distinguished, objective AI Debate Judge evaluating a student's debating skills.
Your task is to analyze the user's arguments across the debate transcript and provide an objective, detailed evaluation.

Evaluation Criteria:
- overallScore (0-100): Overall debate mastery score.
- logic (0-100): Logical consistency, valid reasoning, lack of fallacies.
- evidence (0-100): Use of concrete examples, statistics, analogies, or grounding facts.
- clarity (0-100): Articulation, structure, persuasiveness, tone.
- relevance (0-100): Direct addressing of the main topic and opposing points.
- rebuttalQuality (0-100): How effectively the user challenged the AI's counterarguments.

Output Format: You MUST respond ONLY with a single JSON object matching this exact JSON structure (no surrounding markdown text or commentary):

{
  "overallScore": 82,
  "logic": 85,
  "evidence": 78,
  "clarity": 88,
  "relevance": 85,
  "rebuttalQuality": 75,
  "strengths": [
    "Observation of strong point 1",
    "Observation of strong point 2"
  ],
  "improvements": [
    "Specific area to improve 1",
    "Specific area to improve 2"
  ],
  "strongestArgument": "Quote or summary of the user's best argument",
  "weakestArgument": "Quote or summary of the user's weakest argument or unaddressed point",
  "summary": "3-4 sentence comprehensive feedback summary."
}`;

  let transcriptText = `DEBATE EVALUATION REQUEST\nTopic: "${topic}"\nUser Position: ${userPosition.toUpperCase()}\n\nTRANSCRIPT:\n`;
  history.forEach((msg, idx) => {
    const roleName = msg.role === 'user' ? 'USER' : 'AI OPPONENT';
    transcriptText += `Round ${Math.floor(idx / 2) + 1} [${roleName}]: ${msg.content}\n\n`;
  });

  transcriptText += `\nEvaluate the user's performance and output the JSON evaluation report now.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: transcriptText,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ? response.text.trim() : '';
    const parsedReport = parseAndValidateJudgeJSON(text);
    return parsedReport;
  } catch (error) {
    console.error('[AIService] judgeDebate error:', error.message);
    throw error;
  }
};

/**
 * Safely parse JSON output from AI Judge
 */
function parseAndValidateJudgeJSON(rawText) {
  let cleanText = rawText;
  
  // Remove markdown codeblock wrapper if present
  cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  let data;
  try {
    data = JSON.parse(cleanText);
  } catch (e) {
    console.error('[AIService] Failed to parse JSON from AI Judge. Raw text:', rawText);
    // Fallback extraction regex if JSON parse fails
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      data = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('AI Judge returned malformed response.');
    }
  }

  // Validate fields and clamp numbers between 0 and 100
  const clamp = (val, defaultVal = 75) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return defaultVal;
    return Math.max(0, Math.min(100, num));
  };

  return {
    overallScore: clamp(data.overallScore, 80),
    logic: clamp(data.logic, 80),
    evidence: clamp(data.evidence, 75),
    clarity: clamp(data.clarity, 85),
    relevance: clamp(data.relevance, 85),
    rebuttalQuality: clamp(data.rebuttalQuality, 75),
    strengths: Array.isArray(data.strengths) && data.strengths.length > 0
      ? data.strengths.map(s => String(s))
      : ['Clear stance on the topic.', 'Consistent participation throughout the debate.'],
    improvements: Array.isArray(data.improvements) && data.improvements.length > 0
      ? data.improvements.map(i => String(i))
      : ['Incorporate more empirical statistics or real-world case studies.', 'Address counter-points with direct rebuttals before introducing new themes.'],
    strongestArgument: data.strongestArgument || 'User highlighted key ethical considerations effectively.',
    weakestArgument: data.weakestArgument || 'Initial opening statement could use stronger evidentiary backing.',
    summary: data.summary || 'Solid overall performance. The debater maintained focus and presented coherent reasoning throughout the debate session.',
  };
}

/* ==========================================================================
   DEMO MODE FALLBACKS (Used when GEMINI_API_KEY is not configured)
   ========================================================================== */

function generateDemoOpening({ topic, aiPosition }) {
  return `[DEMO MODE] As the opposing side (${aiPosition.toUpperCase()}) on "${topic}", I contend that we must critically examine the fundamental assumptions of this topic. While the opposing position raises valid points, it overlooks systemic drawbacks and unintended consequences. Throughout this debate, I will demonstrate why the ${aiPosition.toUpperCase()} stance offers a more balanced, practical, and resilient framework for society.`;
}

function generateDemoCounter({ topic, aiPosition, latestUserArgument }) {
  return `[DEMO MODE] Regarding your point about "${latestUserArgument.slice(0, 50)}...", that perspective omits a crucial counter-weight. In defending the ${aiPosition.toUpperCase()} position on "${topic}", we must recognize that short-term benefits often introduce long-term structural risks. How do you reconcile your position with these systemic trade-offs?`;
}

function generateDemoJudgeReport({ topic, userPosition, history }) {
  const userMsgCount = history.filter(m => m.role === 'user').length;
  const baseScore = Math.min(92, 70 + userMsgCount * 5);

  return {
    overallScore: baseScore,
    logic: baseScore + 2,
    evidence: baseScore - 3,
    clarity: baseScore + 4,
    relevance: baseScore + 1,
    rebuttalQuality: baseScore - 2,
    strengths: [
      `Maintained a firm ${userPosition.toUpperCase()} stance across ${userMsgCount} debate turns.`,
      'Exhibited good clarity of thought and respectful communication tone.',
      'Engaged directly with the core questions raised during arguments.'
    ],
    improvements: [
      'Include specific empirical data, research studies, or statistics to elevate argument authority.',
      'Formulate more concise rebuttals directly dismantling the opponent\'s primary premise before moving to secondary points.'
    ],
    strongestArgument: history.find(m => m.role === 'user')?.content.slice(0, 100) + '...' || 'Strong defense of core principles.',
    weakestArgument: 'Statements relying primarily on general observations without backing evidence.',
    summary: `[DEMO MODE EVALUATION] You conducted a structured ${userMsgCount}-round debate on "${topic}". Your overall reasoning was clear and logical. Adding concrete data and tighter counter-arguments will make your debate style even more compelling.`
  };
}
