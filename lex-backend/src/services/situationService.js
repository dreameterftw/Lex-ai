// src/services/situationService.js
import { callAI } from "../ai/groqService.js";
import {
  buildSituationPrompts
} from "../ai/promptBuilder.js";
import {
  parseSituationResponse
} from "../ai/responseParser.js";
import MODELS from "../ai/models.js";
import {
  updateContext,
  appendToTimeline
} from "../context/contextManager.js";
import { sanitizeInput } from "../security/sanitizer.js";
import { guardPrompt } from "../security/promptGuard.js";

export const analyzeSituation = async (
  sessionId,
  userId,
  description,
  jurisdiction
) => {

  // Sanitize and guard input
  const cleanDescription = sanitizeInput(description, 2000);
  const { cleaned, injectionDetected } = guardPrompt(cleanDescription);

  // Build prompts
  const { systemPrompt, userPrompt } = buildSituationPrompts(
    cleaned,
    jurisdiction
  );

  // Call AI
  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.situationFinder.model,
    maxTokens: MODELS.situationFinder.maxTokens,
    jsonMode: true
  });

  // Parse and validate response
  const parsed = parseSituationResponse(raw);

  // Build context update
  const situationContext = {
    rawDescription: cleaned,
    legalCategory: parsed.legalCategory,
    subcategory: parsed.subcategory,
    severity: parsed.severity,
    timeIsSensitive: parsed.timeIsSensitive,
    jurisdiction,
    reasoning: parsed.reasoning,
    suggestedNextStep: parsed.suggestedNextStep,
    needsLawyer: parsed.needsLawyer,
    needsLawyerReason: parsed.needsLawyerReason,
    completedAt: new Date().toISOString()
  };

  // Write to context
  await updateContext(sessionId, userId, "situation", situationContext);

  // Add to timeline
  await appendToTimeline(sessionId, userId, {
    type: "situation_identified",
    title: "Situation classified",
    description: `Identified as ${parsed.legalCategory} — ${parsed.subcategory} (${parsed.severity} severity)`
  });

  return situationContext;
};
