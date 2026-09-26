import 'dotenv/config';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

export class AiServiceError extends Error {
  statusCode: number;
  code: string;
  userMessage: string;

  constructor(statusCode: number, code: string, userMessage: string, technicalDetails?: string) {
    super(technicalDetails || userMessage);
    this.name = 'AiServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = userMessage;
  }
}

function getApiKey(): string | null {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  const possiblePaths = ['/app/.dev.env.json', '.dev.env.json', '../.dev.env.json'];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.GEMINI_API_KEY && typeof parsed.GEMINI_API_KEY === 'string') {
          process.env.GEMINI_API_KEY = parsed.GEMINI_API_KEY.trim();
          return process.env.GEMINI_API_KEY;
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

function classifyGeminiError(err: any): AiServiceError {
  const rawMsg = String(err?.message || err || '');
  const status = Number(err?.status || err?.code || err?.statusCode || 0);

  // Sanitize any key occurrences from internal trace
  const safeMsg = rawMsg.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');

  if (safeMsg.includes('API_KEY') || safeMsg.includes('API key') || status === 401 || status === 403) {
    return new AiServiceError(
      401,
      'AUTH_ERROR',
      'AI service authentication error. Please contact the platform administrator.',
      safeMsg
    );
  }
  if (safeMsg.includes('RESOURCE_EXHAUSTED') || safeMsg.includes('quota') || status === 429) {
    return new AiServiceError(
      429,
      'RATE_LIMIT',
      'The AI service is currently handling high student volume. Please wait a few seconds and try again.',
      safeMsg
    );
  }
  if (safeMsg.includes('INVALID_ARGUMENT') || status === 400) {
    return new AiServiceError(
      400,
      'BAD_REQUEST',
      'Your question could not be processed. Please rephrase or shorten your question.',
      safeMsg
    );
  }
  if (safeMsg.includes('NOT_FOUND') || status === 404) {
    return new AiServiceError(
      404,
      'MODEL_NOT_FOUND',
      'The requested AI model is unavailable. Please notify the administrator.',
      safeMsg
    );
  }
  if (safeMsg.includes('UNAVAILABLE') || safeMsg.includes('high demand') || status === 503 || status === 500) {
    return new AiServiceError(
      503,
      'SERVICE_UNAVAILABLE',
      'The AI service is temporarily experiencing high traffic. Please try again in a few moments.',
      safeMsg
    );
  }
  if (safeMsg.includes('timeout') || safeMsg.includes('ETIMEDOUT') || safeMsg.includes('ECONNRESET')) {
    return new AiServiceError(
      504,
      'TIMEOUT',
      'AI request timed out. Please check your internet connection and try again.',
      safeMsg
    );
  }
  return new AiServiceError(
    500,
    'INTERNAL_AI_ERROR',
    'AI assistance is momentarily unavailable. You can continue using your normal CBT exam features.',
    safeMsg
  );
}

/**
 * Robust caller with automatic retry for transient spikes (503/429)
 * and seamless fallback between gemini-3.8-flash and gemini-3.1-flash-lite.
 */
async function callGeminiWithFallback(options: {
  contents: any;
  config?: any;
  preferredModel?: string;
  fallbackModel?: string;
  timeoutMs?: number;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getAiClient();
  if (!ai) {
    throw new AiServiceError(
      401,
      'AUTH_MISSING_KEY',
      'AI service is not configured. Please contact the platform administrator.',
      'GEMINI_API_KEY environment variable is missing or empty'
    );
  }

  const primaryModel = options.preferredModel || 'gemini-3.8-flash';
  const secondaryModel = options.fallbackModel || 'gemini-3.1-flash-lite';
  const modelsToTry = [primaryModel, secondaryModel];

  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const currentModel = modelsToTry[mIdx];
    // For each model, attempt up to 2 times for transient network/503 spikes
    const maxAttempts = mIdx === 0 ? 2 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: options.contents,
          config: options.config,
        });

        const textOutput = response?.text?.trim();
        if (textOutput) {
          return { text: textOutput, modelUsed: currentModel };
        }

        // If candidates exist with content parts, try manual extraction
        const candidateParts = response?.candidates?.[0]?.content?.parts;
        if (Array.isArray(candidateParts)) {
          const joined = candidateParts
            .map((p: any) => p.text || '')
            .join('')
            .trim();
          if (joined) {
            return { text: joined, modelUsed: currentModel };
          }
        }

        throw new Error('AI model returned an empty response.');
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || '');
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('ETIMEDOUT') ||
          errMsg.includes('ECONNRESET');

        console.warn(
          `[AI Pipeline Notice]: Model ${currentModel} (attempt ${attempt}/${maxAttempts}) failed:`,
          errMsg.slice(0, 100)
        );

        // If transient error and have another attempt for this model, wait briefly
        if (isTransient && attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        } else {
          // Break to next fallback model
          break;
        }
      }
    }
  }

  throw classifyGeminiError(lastError);
}

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

  try {
    const { text, modelUsed } = await callGeminiWithFallback({
      contents: 'Respond with "Ready" to confirm service operational status.',
      config: {
        temperature: 0.1,
      },
    });

    const latencyMs = Date.now() - start;
    if (text) {
      return {
        available: true,
        status: 'Operational',
        model: modelUsed,
        provider: 'Google Gemini AI',
        latencyMs,
        checkedAt,
        statusText: `Operational - ${modelUsed} Connected (${latencyMs}ms)`,
        details: 'AI Service is operational with live model responses verified.',
      };
    }

    return {
      available: true,
      status: 'Degraded',
      model: modelUsed,
      provider: 'Google Gemini AI',
      latencyMs,
      checkedAt,
      statusText: 'Degraded - Empty response',
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
      statusText: `Degraded - ${err?.userMessage || err?.message?.substring(0, 60) || 'Service error'}`,
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
  context?: string,
  history?: { role: 'user' | 'model'; text: string }[]
): Promise<{ reply: string; modelUsed: string }> {
  if (!isAiTutorEnabled()) {
    throw new AiServiceError(
      403,
      'FEATURE_DISABLED',
      'The AI Clinical Tutor has been disabled by the administrator. Normal CBT examination and curriculum features remain accessible.'
    );
  }

  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    throw new AiServiceError(
      400,
      'EMPTY_PROMPT',
      'Please enter a clinical question or concept you would like explained.'
    );
  }

  // Cost protection & context bounding
  const safePrompt = cleanPrompt.slice(0, 1000);
  const safeContext = context ? context.slice(0, 500) : '';

  // Format bounded history if provided (last 6 turns, max 300 chars each)
  let formattedHistory = '';
  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-6).map((h) => {
      const speaker = h.role === 'user' ? 'Student' : 'Tutor';
      const safeText = (h.text || '').slice(0, 300).replace(/\n+/g, ' ');
      return `${speaker}: ${safeText}`;
    });
    formattedHistory = recent.join('\n');
  }

  const systemInstruction = `You are an expert, supportive clinical nursing education tutor for student nurses.
Explain concepts in clear, student-friendly language suitable for nursing and health science students.
Cover core clinical concepts including anatomy, physiology, pharmacology, pathology, clinical assessment, medical-surgical nursing, and NCLEX-style exam reasoning.
Provide clear, step-by-step explanations when appropriate (e.g. pathophysiological steps, drug mechanisms of action, or the 5 phases of the nursing process: Assessment, Diagnosis, Planning, Implementation, Evaluation).
Keep your tone encouraging, professional, and accessible.
Admit when you do not know something and never invent facts.
Never modify or discuss changing examination scores, CBT results, or official student records.`;

  let userContent = '';
  if (formattedHistory) {
    userContent += `Recent Conversation History:\n${formattedHistory}\n\n`;
  }
  if (safeContext) {
    userContent += `Clinical Context/Topic: ${safeContext}\n\n`;
  }
  userContent += `Student Question: ${safePrompt}`;

  try {
    const { text, modelUsed } = await callGeminiWithFallback({
      contents: userContent,
      config: {
        systemInstruction,
        temperature: 0.35,
      },
    });

    return {
      reply: text || 'No response generated by tutor.',
      modelUsed,
    };
  } catch (error: any) {
    if (error instanceof AiServiceError) {
      throw error;
    }
    throw classifyGeminiError(error);
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

  const formattedOptions = (options || [])
    .map((o) => `${o.id}: ${o.text}`)
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
    const { text } = await callGeminiWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = parseJsonSafely<McqExplainResult>(text || '', {
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
    const { text } = await callGeminiWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = parseJsonSafely<any>(text || '', null);

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
