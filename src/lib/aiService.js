import { Mistral } from "@mistralai/mistralai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import JSON5 from "json5";

/**
 * Nova AI Service - Unified Multi-Provider Engine
 * Supports Groq, Google Gemini, Mistral AI, and OpenAI with:
 * - Automatic provider detection & zero-config fallback
 * - Blazing-fast models (sub-second response times)
 * - Resilient JSON extraction and sanitization
 */

// Model Configurations for Ultra-Fast & High-Quality Generation
const PROVIDER_MODELS = {
  groq: {
    default: "llama-3.3-70b-versatile",
    fast: "llama-3.1-8b-instant",
  },
  gemini: {
    default: "gemini-2.0-flash",
    fast: "gemini-1.5-flash",
  },
  mistral: {
    // mistral-small-latest is 5x faster than mistral-large-latest while maintaining high quality
    default: process.env.MISTRAL_MODEL || "mistral-small-latest",
    fast: "mistral-small-latest",
  },
  openai: {
    default: "gpt-4o-mini",
    fast: "gpt-4o-mini",
  }
};

/**
 * Returns list of configured AI providers based on environment keys
 */
export function getAvailableProviders() {
  const providers = [];
  if (process.env.GROQ_API_KEY) providers.push("groq");
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) providers.push("gemini");
  if (process.env.MISTRAL_API_KEY) providers.push("mistral");
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  return providers;
}

export function isAIConfigured() {
  return getAvailableProviders().length > 0;
}

/**
 * Extract and parse JSON safely from LLM output.
 * Handles markdown formatting, surrounding text, trailing commas, and malformed strings.
 */
export function extractAndParseJSON(text, fallback = null) {
  if (!text || typeof text !== "string") return fallback;

  // Clean obvious markdown code tags
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // Find balanced brackets
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  // 1. Try standard JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    // 2. Try JSON5 (handles single quotes, unquoted keys, trailing commas)
    try {
      return JSON5.parse(cleaned);
    } catch (err2) {
      // 3. Clean common LLM syntax issues like trailing commas before closing braces
      try {
        const repaired = cleaned
          .replace(/,\s*([\}\]])/g, "$1") // Remove trailing commas
          .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
          .replace(/[\u2018\u2019]/g, "'"); // Replace smart single quotes
        return JSON5.parse(repaired);
      } catch (err3) {
        console.error("❌ [AI Service] Failed to parse JSON from response:", cleaned.slice(0, 200) + "...");
        return fallback;
      }
    }
  }
}

/**
 * Generate AI completion across available providers with automatic fallback.
 */
export async function generateAIResponse({
  prompt,
  systemPrompt = "",
  messages = [],
  jsonMode = false,
  fastMode = false,
  preferredProvider = null,
  modelOverride = null,
  temperature = 0.7,
}) {
  const available = getAvailableProviders();

  if (available.length === 0) {
    console.warn("⚠️ [AI Service] No AI API keys detected in environment (checked GROQ_API_KEY, GEMINI_API_KEY, MISTRAL_API_KEY, OPENAI_API_KEY).");
    throw new Error("No AI service configured. Please set GROQ_API_KEY, GEMINI_API_KEY, MISTRAL_API_KEY, or OPENAI_API_KEY in your environment.");
  }

  // Determine provider sequence to try
  const providersToTry = [];
  if (preferredProvider && available.includes(preferredProvider)) {
    providersToTry.push(preferredProvider);
  }
  // Add remaining available providers in order of speed and responsiveness
  for (const p of ["groq", "gemini", "mistral", "openai"]) {
    if (available.includes(p) && !providersToTry.includes(p)) {
      providersToTry.push(p);
    }
  }

  // Assemble full messages list
  const fullMessages = [];
  if (systemPrompt) {
    fullMessages.push({ role: "system", content: systemPrompt });
  }

  if (messages && messages.length > 0) {
    messages.forEach((m) => {
      fullMessages.push({
        role: m.role === "user" || m.role === "student" ? "user" : "assistant",
        content: m.content || m.text || "",
      });
    });
  }

  if (prompt) {
    fullMessages.push({ role: "user", content: prompt });
  }

  let lastError = null;

  for (const provider of providersToTry) {
    try {
      if (provider === "groq") {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const model = modelOverride || (fastMode ? PROVIDER_MODELS.groq.fast : PROVIDER_MODELS.groq.default);
        
        const params = {
          model,
          messages: fullMessages,
          temperature,
        };
        if (jsonMode) {
          params.response_format = { type: "json_object" };
        }

        const completion = await groq.chat.completions.create(params);
        const text = completion.choices[0]?.message?.content || "";
        return { text: text.trim(), provider: "groq", model };
      }

      if (provider === "gemini") {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = modelOverride || (fastMode ? PROVIDER_MODELS.gemini.fast : PROVIDER_MODELS.gemini.default);
        
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature,
            ...(jsonMode ? { responseMimeType: "application/json" } : {}),
          },
          ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
        });

        // Convert messages to Gemini history or direct prompt
        let promptText = "";
        if (fullMessages.length === 1) {
          promptText = fullMessages[0].content;
        } else {
          promptText = fullMessages
            .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
            .join("\n\n");
        }

        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text() || "";
        return { text: text.trim(), provider: "gemini", model: modelName };
      }

      if (provider === "mistral") {
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        const model = modelOverride || (fastMode ? PROVIDER_MODELS.mistral.fast : PROVIDER_MODELS.mistral.default);

        const params = {
          model,
          messages: fullMessages,
          temperature,
        };
        if (jsonMode) {
          params.responseFormat = { type: "json_object" };
        }

        const response = await mistral.chat.complete(params);
        const text = response.choices[0]?.message?.content || "";
        return { text: text.trim(), provider: "mistral", model };
      }

      if (provider === "openai") {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const model = modelOverride || (fastMode ? PROVIDER_MODELS.openai.fast : PROVIDER_MODELS.openai.default);

        const params = {
          model,
          messages: fullMessages,
          temperature,
        };
        if (jsonMode) {
          params.response_format = { type: "json_object" };
        }

        const completion = await openai.chat.completions.create(params);
        const text = completion.choices[0]?.message?.content || "";
        return { text: text.trim(), provider: "openai", model };
      }
    } catch (err) {
      console.warn(`⚠️ [AI Service] ${provider} call failed (${err.message}). Trying fallback provider...`);
      lastError = err;
    }
  }

  console.error("❌ [AI Service] All configured providers failed:", lastError?.message);
  throw lastError || new Error("All AI providers failed to generate a response");
}

/**
 * Generates an AI response and directly extracts structured JSON
 */
export async function generateAIJson({
  prompt,
  systemPrompt = "",
  messages = [],
  fallback = null,
  fastMode = false,
  preferredProvider = null,
}) {
  try {
    const { text, provider, model } = await generateAIResponse({
      prompt,
      systemPrompt: systemPrompt
        ? `${systemPrompt}\nIMPORTANT: You must return valid, parseable JSON matching the requested schema.`
        : "You must return valid, parseable JSON.",
      messages,
      jsonMode: true,
      fastMode,
      preferredProvider,
    });

    const parsed = extractAndParseJSON(text, fallback);
    if (!parsed && fallback !== null) {
      return fallback;
    }
    return parsed;
  } catch (err) {
    console.error("❌ [AI Service] generateAIJson error:", err.message);
    if (fallback !== null) return fallback;
    throw err;
  }
}

export default {
  generateAIResponse,
  generateAIJson,
  extractAndParseJSON,
  getAvailableProviders,
  isAIConfigured,
};
