import 'dotenv/config';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

let resolvedApiKey: string | null = null;

function getApiKey(): string | null {
  if (resolvedApiKey) return resolvedApiKey;
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    resolvedApiKey = process.env.GEMINI_API_KEY.trim();
    return resolvedApiKey;
  }
  const possiblePaths = ['/app/.dev.env.json', '.dev.env.json', '../.dev.env.json'];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.GEMINI_API_KEY && typeof parsed.GEMINI_API_KEY === 'string') {
          resolvedApiKey = parsed.GEMINI_API_KEY.trim();
          process.env.GEMINI_API_KEY = resolvedApiKey;
          return resolvedApiKey;
        }
      }
    } catch {}
  }
  return null;
}

// Initialize Gemini client with user-agent telemetry as instructed in the gemini-api skill
const getAiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==================== RATE LIMITER & COST PROTECTION ==================== //
// Tracks requests per user/IP: max 15 requests per 60-second window
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimits = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, limit = 15, windowMs = 60000): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimits.get(key) || { timestamps: [] };

  // Filter timestamps within the window
  const activeTimestamps = record.timestamps.filter(t => now - t < windowMs);

  if (activeTimestamps.length >= limit) {
    const oldest = activeTimestamps[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  activeTimestamps.push(now);
  rateLimits.set(key, { timestamps: activeTimestamps });
  return { allowed: true };
}

// ==================== AI SETTINGS & AVAILABILITY STATE ==================== //
export interface AiSettingsData {
  aiFeaturesEnabled: boolean;
  aiTutorEnabled: boolean;
  aiExplanationEnabled: boolean;
  updatedAt: string;
  updatedBy?: string;
}

let aiSettingsState: AiSettingsData = {
  aiFeaturesEnabled: true,
  aiTutorEnabled: true,
  aiExplanationEnabled: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Default',
};

export function getAiSettingsState(): AiSettingsData {
  return { ...aiSettingsState };
}

export function updateAiSettingsState(updates: Partial<AiSettingsData>): AiSettingsData {
  aiSettingsState = {
    ...aiSettingsState,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return { ...aiSettingsState };
}

export function isAiTutorEnabled(): boolean {
  return aiSettingsState.aiFeaturesEnabled && aiSettingsState.aiTutorEnabled;
}

export function isAiExplanationEnabled(): boolean {
  return aiSettingsState.aiFeaturesEnabled && aiSettingsState.aiExplanationEnabled;
}

export async function getAiServiceStatus(): Promise<{
  available: boolean;
  status: 'Operational' | 'Degraded' | 'Offline';
  model: string;
  provider: string;
  latencyMs: number;
  checkedAt: string;
  statusText: string;
  details: string;
}> {
  const start = Date.now();
  const apiKey = getApiKey();
  const checkedAt = new Date().toISOString();

  if (!apiKey) {
    return {
      available: false,
      status: 'Offline',
      model: 'gemini-3.8-flash',
      provider: 'Google Gemini AI',
      latencyMs: 0,
      checkedAt,
      statusText: 'AI Service Offline - GEMINI_API_KEY Missing',
      details: 'Gemini API key is not configured in environment or .dev.env.json',
    };
  }

  const ai = getAiClient();
  if (!ai) {
    return {
      available: false,
      status: 'Offline',
      model: 'gemini-3.8-flash',
      provider: 'Google Gemini AI',
      latencyMs: 0,
      checkedAt,
      statusText: 'AI Service Offline - Client Initialization Failed',
      details: 'GoogleGenAI client could not be instantiated.',
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Ping',
      config: {
        maxOutputTokens: 5,
        temperature: 0,
      },
    });

    const latencyMs = Date.now() - start;
    if (response && response.text) {
      return {
        available: true,
        status: 'Operational',
        model: 'gemini-3.8-flash',
        provider: 'Google Gemini AI',
        latencyMs,
        checkedAt,
        statusText: `Operational - Gemini 3.8 Flash Connected (${latencyMs}ms)`,
        details: 'AI Service is operational with live model responses verified.',
      };
    }

    return {
      available: true,
      status: 'Degraded',
      model: 'gemini-3.8-flash',
      provider: 'Google Gemini AI',
      latencyMs,
      checkedAt,
      statusText: 'Degraded - Response format unexpected',
      details: 'Service responded without text content.',
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    console.warn('[AI Service Status Check Notice]:', err?.message || err);
    return {
      available: false,
      status: 'Degraded',
      model: 'gemini-3.8-flash',
      provider: 'Google Gemini AI',
      latencyMs,
      checkedAt,
      statusText: `Degraded - ${err?.message?.substring(0, 60) || 'Service error'}`,
      details: err?.message || 'Error communicating with Gemini API',
    };
  }
}

// ==================== IN-MEMORY EXPLANATION CACHE ==================== //
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setInCache<T>(key: string, data: T, ttlMs = 2 * 60 * 60 * 1000): void {
  // Bound cache size
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// Clean helper to extract JSON from markdown code blocks or raw strings
function parseJsonSafely<T>(rawText: string, fallback: T): T {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }
    return JSON.parse(clean);
  } catch (err) {
    // Attempt to locate first { and last }
    try {
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      if (start !== -1 && end > start) {
        const substr = rawText.substring(start, end + 1);
        return JSON.parse(substr);
      }
    } catch {}
    return fallback;
  }
}

// ==================== FEATURE 1: AI STUDY TUTOR ==================== //
export async function askAiTutor(
  prompt: string,
  context?: string
): Promise<{ reply: string }> {
  if (!isAiTutorEnabled()) {
    return {
      reply: 'The AI Clinical Tutor has been disabled by the administrator. Normal CBT examination and curriculum features remain accessible.',
    };
  }

  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    return {
      reply: 'Please enter a clinical question or concept you would like explained.',
    };
  }

  const ai = getAiClient();
  if (!ai) {
    return {
      reply: 'AI assistance is temporarily unavailable. You can continue using the normal CBT features.',
    };
  }

  // Cost protection: restrict prompt length
  const safePrompt = cleanPrompt.slice(0, 800);
  const safeContext = context ? context.slice(0, 400) : '';

  const systemInstruction = `You are a supportive, knowledgeable clinical nursing education tutor for student nurses.
Explain concepts in clear, student-friendly language suitable for nursing and health science students.
Give step-by-step explanations when appropriate (e.g. pathophysiological steps, drug mechanisms, nursing care plans).
Keep your responses concise and focused (under 250 words) to avoid information overload.
Admit when you do not know something and never invent facts.
Encourage deep clinical understanding rather than rote memorization.
Never discuss changing student CBT exam scores or official records.`;

  const userContent = safeContext
    ? `Topic/Context: ${safeContext}\n\nStudent Question: ${safePrompt}`
    : `Student Question: ${safePrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userContent,
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 600,
      },
    });

    const reply = response.text?.trim() || 'No response generated by tutor.';
    return { reply };
  } catch (error: any) {
    console.warn('[AI Tutor notice]:', error?.message || error);
    return {
      reply: 'AI assistance is temporarily unavailable. You can continue using the normal CBT features.',
    };
  }
}

// ==================== FEATURE 2: AI EXPLANATION FOR MCQ ==================== //
export interface McqExplainParams {
  question: string;
  options: { id: string; text: string }[];
  correctOption: string;
  selectedOption: string | null;
  scenario?: string;
  rationale?: string;
}

export interface McqExplainResult {
  whyCorrect: string;
  whyStudentChoice: string;
  keyTakeaway: string;
  summary: string;
}

export async function explainMcqQuestion(params: McqExplainParams): Promise<McqExplainResult> {
  const { question, options, correctOption, selectedOption, scenario, rationale } = params;

  if (!isAiExplanationEnabled()) {
    const fallbackText = rationale || 'The selected option aligns with evidence-based nursing clinical standards.';
    return {
      whyCorrect: `Option ${correctOption} is correct according to nursing curriculum. ${fallbackText}`,
      whyStudentChoice: selectedOption === correctOption
        ? 'You selected the correct key! Great clinical assessment.'
        : selectedOption
        ? `Option ${selectedOption} is incorrect for this clinical presentation.`
        : 'You did not select an option for this question.',
      keyTakeaway: fallbackText,
      summary: 'AI explanations are currently disabled by the administrator.',
    };
  }

  // Build unique cache key
  const cacheKey = `mcq_${question.slice(0, 60)}_${correctOption}_${selectedOption || 'none'}`;
  const cached = getFromCache<McqExplainResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = getAiClient();
  if (!ai) {
    // Return fallback rationale without throwing so user experience is smooth
    const fallbackText = rationale || 'The selected option aligns with evidence-based nursing clinical standards.';
    return {
      whyCorrect: `Option ${correctOption} is correct according to nursing curriculum. ${fallbackText}`,
      whyStudentChoice: selectedOption === correctOption
        ? 'You selected the correct key! Great clinical assessment.'
        : selectedOption
        ? `Option ${selectedOption} is incorrect for this clinical presentation.`
        : 'You did not select an option for this question.',
      keyTakeaway: fallbackText,
      summary: fallbackText,
    };
  }

  const formattedOptions = (options || [])
    .map(o => `${o.id}: ${o.text}`)
    .join('\n');

  const prompt = `You are an expert clinical nursing instructor explaining a multiple-choice question to a nursing student.
Provide an encouraging, educational explanation that reinforces clinical learning.

Question Details:
${scenario ? `Clinical Scenario: ${scenario}\n` : ''}Question: ${question}

Options:
${formattedOptions}

Official Correct Option: ${correctOption}
Student's Selected Option: ${selectedOption || 'None (Unanswered)'}
${rationale ? `Curriculum Rationale: ${rationale}` : ''}

Respond in strict JSON with the following schema:
{
  "whyCorrect": "Explain clearly in 2-3 sentences why Option ${correctOption} is the correct clinical choice.",
  "whyStudentChoice": "Explain in 1-2 sentences why the student's answer was correct or incorrect (or explain what key factor was missed if unanswered).",
  "keyTakeaway": "1-2 sentence high-yield clinical concept or memory hook the student should remember for their nursing board exam.",
  "summary": "Short 1-sentence quick summary"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 600,
      },
    });

    const parsed = parseJsonSafely<McqExplainResult>(response.text || '', {
      whyCorrect: rationale || `Option ${correctOption} is the verified clinical answer.`,
      whyStudentChoice: selectedOption === correctOption ? 'Your choice was correct.' : 'Your choice did not meet the criteria.',
      keyTakeaway: rationale || 'Remember to evaluate patient stability and ABCs first.',
      summary: rationale || 'Verified clinical question.',
    });

    const validated: McqExplainResult = {
      whyCorrect: parsed.whyCorrect || `Option ${correctOption} is correct.`,
      whyStudentChoice: parsed.whyStudentChoice || (selectedOption === correctOption ? 'Correct choice.' : 'Incorrect option.'),
      keyTakeaway: parsed.keyTakeaway || 'Review core anatomy and clinical signs.',
      summary: parsed.summary || parsed.whyCorrect,
    };

    setInCache(cacheKey, validated);
    return validated;
  } catch (error: any) {
    console.error('[AI Explain MCQ Error]:', error?.message || error);
    // Graceful fallback to avoid breaking normal CBT review
    return {
      whyCorrect: rationale || `Option ${correctOption} is the correct clinical standard.`,
      whyStudentChoice: selectedOption === correctOption
        ? 'Your selection is correct.'
        : selectedOption
        ? `Option ${selectedOption} is incorrect.`
        : 'Question was left unanswered.',
      keyTakeaway: rationale || 'Always prioritize acute signs in clinical nursing scenarios.',
      summary: rationale || 'Verified answer.',
    };
  }
}

// ==================== FEATURE 3: AI THEORY ANSWER MARKING ==================== //
export interface TheoryMarkParams {
  question: string;
  expectedAnswer: string;
  studentAnswer: string;
  maxMarks?: number;
  category?: string;
}

export interface TheoryMarkResult {
  score: number;
  maxMarks: number;
  pointsCorrect: string[];
  pointsMissed: string[];
  pointsPartial: string[];
  feedback: string;
  isAiEvaluated: boolean;
}

export async function markTheoryAnswer(params: TheoryMarkParams): Promise<TheoryMarkResult> {
  const { question, expectedAnswer, studentAnswer, maxMarks = 10, category } = params;
  const safeMaxMarks = Math.max(1, Number(maxMarks) || 10);
  const cleanStudent = (studentAnswer || '').trim();

  // If student did not provide an answer, return 0 deterministically without wasting AI tokens
  if (!cleanStudent) {
    return {
      score: 0,
      maxMarks: safeMaxMarks,
      pointsCorrect: [],
      pointsMissed: ['No answer submitted by student.'],
      pointsPartial: [],
      feedback: 'No response was provided for this question. Consult the model answer to review the required concepts.',
      isAiEvaluated: true,
    };
  }

  // Cache key
  const cacheKey = `theory_${question.slice(0, 40)}_${cleanStudent.slice(0, 60)}`;
  const cached = getFromCache<TheoryMarkResult>(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = getAiClient();
  if (!ai) {
    // Graceful fallback to deterministic keyword/substance estimation
    return fallbackDeterministicMarking(cleanStudent, expectedAnswer, safeMaxMarks);
  }

  const prompt = `You are a strict, fair clinical nursing examiner assessing a student's written response to a theory question against the official marking criteria and model answer.

Question Category: ${category || 'General Clinical Nursing'}
Question: ${question}

Official Expected Answer / Rubric:
${expectedAnswer || 'Provide a thorough anatomical and physiological explanation with clinical nursing significance.'}

Student's Written Response:
"""
${cleanStudent}
"""

Maximum Marks: ${safeMaxMarks}

Marking Instructions:
1. Evaluate the MEANING and SUBSTANCE of the student's answer, not merely matching keywords.
2. Award marks based on how accurately and completely the student demonstrated understanding of the expected concepts.
3. If an answer contains similar words but makes factually incorrect clinical claims, deduct accordingly.
4. Score must be between 0 and ${safeMaxMarks}.
5. Categorize the points into:
   - "pointsCorrect": list of required concepts correctly articulated
   - "pointsPartial": list of concepts partially or vaguely stated
   - "pointsMissed": list of essential concepts from the rubric that were omitted
6. Provide a constructive, professional 2-3 sentence feedback note.

Respond ONLY with valid JSON with this exact structure:
{
  "score": <number from 0 to ${safeMaxMarks}>,
  "maxMarks": ${safeMaxMarks},
  "pointsCorrect": ["string", "string"],
  "pointsPartial": ["string"],
  "pointsMissed": ["string"],
  "feedback": "string"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 800,
      },
    });

    const parsed = parseJsonSafely<any>(response.text || '', null);

    if (!parsed || typeof parsed.score !== 'number' || isNaN(parsed.score)) {
      console.warn('[AI Theory Mark] Invalid structured response, using deterministic fallback');
      return fallbackDeterministicMarking(cleanStudent, expectedAnswer, safeMaxMarks);
    }

    // STRICT VALIDATION: Ensure 0 <= score <= safeMaxMarks
    const rawScore = Number(parsed.score);
    const validatedScore = Math.max(0, Math.min(safeMaxMarks, Math.round(rawScore * 10) / 10));

    const result: TheoryMarkResult = {
      score: validatedScore,
      maxMarks: safeMaxMarks,
      pointsCorrect: Array.isArray(parsed.pointsCorrect)
        ? parsed.pointsCorrect.map(String).filter(Boolean)
        : ['Demonstrated understanding of core concepts.'],
      pointsMissed: Array.isArray(parsed.pointsMissed)
        ? parsed.pointsMissed.map(String).filter(Boolean)
        : [],
      pointsPartial: Array.isArray(parsed.pointsPartial)
        ? parsed.pointsPartial.map(String).filter(Boolean)
        : [],
      feedback: typeof parsed.feedback === 'string' && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : `Your response was evaluated against the marking guide (${validatedScore}/${safeMaxMarks} marks).`,
      isAiEvaluated: true,
    };

    setInCache(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error('[AI Theory Marking Error]:', error?.message || error);
    return fallbackDeterministicMarking(cleanStudent, expectedAnswer, safeMaxMarks);
  }
}

// Fallback deterministic evaluation if AI service is temporarily offline
function fallbackDeterministicMarking(student: string, model: string, maxMarks: number): TheoryMarkResult {
  const studentWords = new Set(student.toLowerCase().match(/\b\w{4,}\b/g) || []);
  const modelWords = (model.toLowerCase().match(/\b\w{4,}\b/g) || []);

  let matches = 0;
  modelWords.forEach(w => {
    if (studentWords.has(w)) matches++;
  });

  const ratio = modelWords.length > 0 ? Math.min(1, matches / (modelWords.length * 0.4)) : 0.5;
  const estimatedScore = Math.round(ratio * maxMarks * 10) / 10;
  const clampedScore = Math.max(0, Math.min(maxMarks, estimatedScore));

  return {
    score: clampedScore,
    maxMarks,
    pointsCorrect: ['Answer submitted and recorded for curriculum evaluation.'],
    pointsMissed: ['AI assessment temporarily unavailable; standard model comparison applies.'],
    pointsPartial: [],
    feedback: `Evaluated using rubric comparison benchmark (${clampedScore}/${maxMarks} marks). Review the model answer to verify complete criteria coverage.`,
    isAiEvaluated: false,
  };
}
