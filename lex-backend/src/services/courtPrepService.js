// src/services/courtPrepService.js
import { callAI } from "../ai/groqService.js";
import { buildCourtPrepPrompts } from "../ai/promptBuilder.js";
import { parseCourtPrepResponse } from "../ai/responseParser.js";
import MODELS from "../ai/models.js";
import {
  getFullContext,
  updateContext,
  appendToTimeline
} from "../context/contextManager.js";
import { createError } from "../middleware/errorHandler.js";

export const generateCourtPrep = async (sessionId, userId) => {

  const session = await getFullContext(sessionId, userId);

  // Needs at minimum a situation and rights identified
  if (!session.context.situation?.legalCategory) {
    throw createError(
      "Please complete Situation Finder before generating court prep.",
      400
    );
  }

  if (!session.context.rights?.identified?.length) {
    throw createError(
      "Please complete Rights Navigator before generating court prep.",
      400
    );
  }

  const { systemPrompt, userPrompt } =
    buildCourtPrepPrompts(session.context);

  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.courtPrep.model,
    maxTokens: MODELS.courtPrep.maxTokens,
    jsonMode: true
  });

  const parsed = parseCourtPrepResponse(raw);

  const courtPrepContext = {
    briefGenerated: true,
    briefContent: parsed,
    completedAt: new Date().toISOString()
  };

  await updateContext(
    sessionId,
    userId,
    "courtPrep",
    courtPrepContext
  );

  await appendToTimeline(sessionId, userId, {
    type: "court_prep_generated",
    title: "Court preparation brief generated",
    description: `${parsed.courtType} preparation brief created — ${parsed.keyArguments.length} key arguments identified`
  });

  return courtPrepContext;
};


// ─── Get existing court prep ──────────────────────────────────────
export const getCourtPrep = async (sessionId, userId) => {
  const session = await getFullContext(sessionId, userId);

  if (!session.context.courtPrep?.briefGenerated) {
    throw createError(
      "No court prep brief has been generated yet.",
      404
    );
  }

  return session.context.courtPrep;
};
