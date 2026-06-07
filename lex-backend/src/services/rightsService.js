// src/services/rightsService.js
import { callAI } from "../ai/groqService.js";
import { buildRightsPrompts } from "../ai/promptBuilder.js";
import { parseRightsResponse } from "../ai/responseParser.js";
import MODELS from "../ai/models.js";
import {
  getFullContext,
  updateContext,
  appendToTimeline
} from "../context/contextManager.js";
import { createError } from "../middleware/errorHandler.js";

export const identifyRights = async (sessionId, userId) => {

  const session = await getFullContext(sessionId, userId);

  // Situation must exist before identifying rights
  if (!session.context.situation?.legalCategory) {
    throw createError(
      "Please complete Situation Finder before identifying rights.",
      400
    );
  }

  const { systemPrompt, userPrompt } =
    buildRightsPrompts(session.context);

  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.rightsNavigator.model,
    maxTokens: MODELS.rightsNavigator.maxTokens,
    jsonMode: true
  });

  const parsed = parseRightsResponse(raw);

  const rightsContext = {
    identified: parsed.identified,
    violated: parsed.violated,
    evidenceToCollect: parsed.evidenceToCollect,
    immediateAction: parsed.immediateAction,
    completedAt: new Date().toISOString()
  };

  await updateContext(sessionId, userId, "rights", rightsContext);

  await appendToTimeline(sessionId, userId, {
    type: "rights_identified",
    title: "Rights identified",
    description: `${parsed.identified.length} rights identified, ${parsed.violated.length} potential violations found`
  });

  return rightsContext;
};
