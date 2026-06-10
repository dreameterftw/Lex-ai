import { addDoc, collection } from "firebase/firestore"
import { callAI } from "../services/aiService.js"
import CONSTANTS from "../services/ai/constants.js"
import MODELS from "../services/ai/models.js"
import { buildDocumentPrompts } from "../services/ai/promptBuilder.js"
import { sanitizeDocumentText } from "../services/ai/promptGuard.js"
import { parseDocumentResponse } from "../services/ai/responseParser.js"
import { db } from "../firebase/firebase.js"
import { apiResult, appendToTimeline, getSession, requireUser, updateContext } from "../services/firestoreService.js"

export const analyzeDocument = async (sessionId, rawText, fileName) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  const cleanText = sanitizeDocumentText(rawText, CONSTANTS.INPUT.DOCUMENT_MAX_CHARS)

  if (!cleanText || cleanText.length < 50) {
    throw new Error("Document text is too short to analyze.")
  }

  const { systemPrompt, userPrompt } = buildDocumentPrompts(cleanText, session.context)
  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.documentXRay.model,
    maxTokens: MODELS.documentXRay.maxTokens,
    jsonMode: true
  })
  const parsed = parseDocumentResponse(raw)
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
  }

  await updateContext(sessionId, user.uid, "document", documentContext)
  await addDoc(collection(db, CONSTANTS.COLLECTIONS.DOCUMENTS), {
    sessionId,
    userId: user.uid,
    fileName,
    rawText: cleanText,
    analysis: parsed,
    uploadedAt: new Date().toISOString()
  })
  await appendToTimeline(sessionId, user.uid, {
    type: "document_analyzed",
    title: "Document analyzed",
    description: `${parsed.documentType} analyzed - ${parsed.flaggedClauses.length} issues found (${parsed.overallRisk} risk)`
  })

  return apiResult(documentContext)
}
