// src/services/counselService.js
import { callAIWithHistory } from "../ai/groqService.js";
import { buildCounselPrompts } from "../ai/promptBuilder.js";
import MODELS from "../ai/models.js";
import {
  getFullContext,
  appendToCounselHistory
} from "../context/contextManager.js";
import { sanitizeInput } from "../security/sanitizer.js";
import { guardPrompt } from "../security/promptGuard.js";
import { createError } from "../middleware/errorHandler.js";

export const sendCounselMessage = async (
  sessionId,
  userId,
  message
) => {

  // Get full context — Lex Counsel needs everything
  const session = await getFullContext(sessionId, userId);

  if (!session.context.situation?.legalCategory) {
    throw createError(
      "Please complete Situation Finder before using Lex Counsel.",
      400
    );
  }

  // Sanitize and guard message
  const cleanMessage = sanitizeInput(message, 1000);
  const { cleaned } = guardPrompt(cleanMessage);

  // Build prompts with full context
  const { systemPrompt } = buildCounselPrompts(
    session.context,
    cleaned
  );

  // Get conversation history for multi-turn
  const history = session.context.counsel?.history || [];

  // Call AI with full conversation history
  const aiResponse = await callAIWithHistory({
    systemPrompt,
    history,
    newMessage: cleaned,
    model: MODELS.lexCounsel.model,
    maxTokens: MODELS.lexCounsel.maxTokens
  });

  // Save exchange to context
  const exchange = await appendToCounselHistory(
    sessionId,
    userId,
    cleaned,
    aiResponse
  );

  return {
    message: aiResponse,
    exchangeId: exchange.id,
    timestamp: exchange.timestamp
  };
};


// ─── Get full counsel history ─────────────────────────────────────
export const getCounselHistory = async (sessionId, userId) => {
  const session = await getFullContext(sessionId, userId);
  return session.context.counsel?.history || [];
};
