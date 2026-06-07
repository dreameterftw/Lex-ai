// src/services/documentService.js
import { callAI } from "../ai/groqService.js";
import { buildDocumentPrompts } from "../ai/promptBuilder.js";
import { parseDocumentResponse } from "../ai/responseParser.js";
import MODELS from "../ai/models.js";
import {
  getFullContext,
  updateContext,
  appendToTimeline
} from "../context/contextManager.js";
import { sanitizeDocumentText } from "../security/sanitizer.js";
import { db } from "../config/firebase.js";
import CONSTANTS from "../config/constants.js";
import { createError } from "../middleware/errorHandler.js";

export const analyzeDocument = async (
  sessionId,
  userId,
  rawText,
  fileName
) => {

  // Get current context so AI has full picture
  const session = await getFullContext(sessionId, userId);

  // Sanitize document text
  const cleanText = sanitizeDocumentText(
    rawText,
    CONSTANTS.INPUT.DOCUMENT_MAX_CHARS
  );

  if (!cleanText || cleanText.length < 50) {
    throw createError(
      "Document text is too short to analyze.",
      400
    );
  }

  // Build prompts with full context
  const { systemPrompt, userPrompt } = buildDocumentPrompts(
    cleanText,
    session.context
  );

  // Call AI
  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.documentXRay.model,
    maxTokens: MODELS.documentXRay.maxTokens,
    jsonMode: true
  });

  // Parse and validate AI response
  const parsed = parseDocumentResponse(raw);

  // Build document context
  const documentContext = {
    fileName,
    documentType: parsed.documentType,
    rawText: cleanText,
    flaggedClauses: parsed.flaggedClauses,
    missingProtections: parsed.missingProtections,
    userLeveragePoints: parsed.userLeveragePoints,
    overallRisk: parsed.overallRisk,
    summary: parsed.summary,
    completedAt: new Date().toISOString()
  };

  // Write to session context
  await updateContext(sessionId, userId, "document", documentContext);

  // Save document analysis record to Firestore
  await db.collection(CONSTANTS.COLLECTIONS.DOCUMENTS).add({
    sessionId,
    userId,
    fileName,
    rawText: cleanText,
    analysis: parsed,
    uploadedAt: new Date().toISOString()
  });

  // Add document event to timeline
  await appendToTimeline(sessionId, userId, {
    type: "document_analyzed",
    title: "Document analyzed",
    description: `${parsed.documentType} analyzed — ${parsed.flaggedClauses.length} issues found (${parsed.overallRisk} risk)`
  });

  return documentContext;
};
