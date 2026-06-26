// src/services/signalService.js
import { callAI } from "../ai/groqService.js";
import { buildSignalPrompts } from "../ai/promptBuilder.js";
import { parseSignalResponse } from "../ai/responseParser.js";
import MODELS from "../ai/models.js";
import {
  getFullContext,
  updateContext,
  appendToTimeline
} from "../context/contextManager.js";
import { createError } from "../middleware/errorHandler.js";

export const generateSignalLetter = async (sessionId, userId) => {

  const session = await getFullContext(sessionId, userId);

  if (!session.context.rights?.identified?.length) {
    throw createError(
      "Please complete Rights Navigator before generating a letter.",
      400
    );
  }

  const { systemPrompt, userPrompt } =
    buildSignalPrompts(session.context);

  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.signalLetter.model,
    maxTokens: MODELS.signalLetter.maxTokens,
    jsonMode: true
  });

  const parsed = parseSignalResponse(raw);

  const signalContext = {
    letterGenerated: true,
    letterContent: parsed,
    letterType: parsed.letterType,
    subject: parsed.subject,
    recipient: parsed.recipient,
    requestedAction: parsed.requestedAction,
    responseDeadline: parsed.responseDeadline,
    legalCitations: parsed.legalCitations,
    body: parsed.body,
    disclaimer: parsed.disclaimer,
    sentDate: null,
    completedAt: new Date().toISOString()
  };

  await updateContext(sessionId, userId, "signal", signalContext);

  await appendToTimeline(sessionId, userId, {
    type: "signal_letter_generated",
    title: "Signal letter generated",
    description: `${parsed.letterType} drafted — ${parsed.legalCitations.length} laws cited`
  });

  return signalContext;
};


// ─── Mark letter as sent ──────────────────────────────────────────
export const markLetterSent = async (sessionId, userId) => {
  const session = await getFullContext(sessionId, userId);

  if (!session.context.signal?.letterGenerated) {
    throw createError("No letter has been generated yet.", 400);
  }

  const updatedSignal = {
    ...session.context.signal,
    sentDate: new Date().toISOString()
  };

  await updateContext(sessionId, userId, "signal", updatedSignal);

  await appendToTimeline(sessionId, userId, {
    type: "signal_letter_sent",
    title: "Signal letter sent",
    description: "Formal rights assertion letter sent to recipient"
  });

  return { success: true, sentDate: updatedSignal.sentDate };
};
