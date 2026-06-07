// src/services/outcomeService.js
import {
  getFullContext,
  updateContext,
  updateSessionStatus,
  appendToTimeline
} from "../context/contextManager.js";
import { db } from "../config/firebase.js";
import CONSTANTS from "../config/constants.js";
import { createError } from "../middleware/errorHandler.js";

export const recordOutcome = async (
  sessionId,
  userId,
  outcome,
  decidingFactor = null
) => {

  const session = await getFullContext(sessionId, userId);

  if (session.context.outcome?.resolved) {
    throw createError(
      "This situation has already been resolved.",
      400
    );
  }

  const outcomeContext = {
    resolved: true,
    result: outcome,
    decidingFactor,
    resolvedAt: new Date().toISOString()
  };

  // Update context
  await updateContext(sessionId, userId, "outcome", outcomeContext);

  // Mark session as resolved
  await updateSessionStatus(
    sessionId,
    userId,
    CONSTANTS.SESSION_STATUS.RESOLVED
  );

  // Add to timeline
  await appendToTimeline(sessionId, userId, {
    type: "situation_resolved",
    title: "Situation resolved",
    description: `Outcome: ${outcome.replace(/_/g, " ")}${
      decidingFactor ? ` — ${decidingFactor}` : ""
    }`
  });

  // Save anonymised outcome data for
  // future outcome intelligence feature
  await db.collection("outcomes").add({
    legalCategory: session.context.situation?.legalCategory,
    subcategory: session.context.situation?.subcategory,
    jurisdiction: session.context.situation?.jurisdiction,
    severity: session.context.situation?.severity,
    outcome,
    decidingFactor,
    featuresUsed: {
      hadDocument: !!session.context.document?.documentType,
      hadSignalLetter: session.context.signal?.letterGenerated || false,
      hadCourtPrep: session.context.courtPrep?.briefGenerated || false,
      counselMessageCount:
        session.context.counsel?.history?.length || 0
    },
    resolvedAt: new Date().toISOString()
  });

  return {
    success: true,
    outcome,
    decidingFactor,
    resolvedAt: outcomeContext.resolvedAt
  };
};


// ─── Get outcome for a session ────────────────────────────────────
export const getOutcome = async (sessionId, userId) => {
  const session = await getFullContext(sessionId, userId);
  return session.context.outcome;
};
