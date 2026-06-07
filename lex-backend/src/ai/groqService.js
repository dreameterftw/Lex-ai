// src/ai/groqService.js
import groq from "../config/groq.js";
import CONSTANTS from "../config/constants.js";
import { createError } from "../middleware/errorHandler.js";

// ─── Core AI call function ────────────────────────────────────────
// Every feature in Lex calls this one function
export const callAI = async ({
  systemPrompt,
  userPrompt,
  model = CONSTANTS.MODELS.POWERFUL,
  maxTokens = CONSTANTS.AI.MAX_TOKENS,
  jsonMode = false,
  temperature = CONSTANTS.AI.TEMPERATURE
}) => {

  try {

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   }
    ];

    const requestConfig = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    // Enable JSON mode when structured output is needed
    if (jsonMode) {
      requestConfig.response_format = { type: "json_object" };
    }

    const response = await groq.chat.completions.create(requestConfig);

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw createError("AI returned empty response.", 500);
    }

    // Parse JSON if json mode was requested
    if (jsonMode) {
      try {
        return JSON.parse(content);
      } catch {
        console.error("[AI] Failed to parse JSON response:", content);
        throw createError("AI returned invalid JSON.", 500);
      }
    }

    return content;

  } catch (err) {

    // Handle Groq-specific errors cleanly
    if (err.status === 429) {
      throw createError(
        "AI service is busy. Please wait a moment.",
        429
      );
    }

    if (err.status === 503) {
      throw createError(
        "AI service temporarily unavailable.",
        503
      );
    }

    if (err.status === 400) {
      console.error("[AI] Bad request to Groq:", err.message);
      throw createError("AI request failed. Please try again.", 400);
    }

    // Re-throw known errors
    if (err.status) throw err;

    console.error("[AI] Unexpected error:", err.message);
    throw createError("AI processing failed.", 500);
  }
};


// ─── Call AI with conversation history ───────────────────────────
// Used specifically by Lex Counsel for multi-turn conversation
export const callAIWithHistory = async ({
  systemPrompt,
  history = [],
  newMessage,
  model = CONSTANTS.MODELS.POWERFUL,
  maxTokens = CONSTANTS.AI.MAX_TOKENS_COUNSEL,
  temperature = CONSTANTS.AI.TEMPERATURE
}) => {

  try {

    // Build messages array with full conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      // Include past exchanges
      ...history.flatMap(exchange => [
        { role: "user",      content: exchange.user },
        { role: "assistant", content: exchange.lex  }
      ]),
      // Add the new message
      { role: "user", content: newMessage }
    ];

    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw createError("AI returned empty response.", 500);
    }

    return content;

  } catch (err) {
    if (err.status === 429) {
      throw createError("AI service is busy. Please wait.", 429);
    }
    if (err.status) throw err;
    throw createError("AI processing failed.", 500);
  }
};
