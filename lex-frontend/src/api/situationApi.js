import { callAI } from "../services/aiService.js"
import MODELS from "../services/ai/models.js"
import { buildSituationPrompts } from "../services/ai/promptBuilder.js"
import { guardPrompt, sanitizeInput } from "../services/ai/promptGuard.js"
import { parseSituationResponse } from "../services/ai/responseParser.js"
import { apiResult, appendToTimeline, requireUser, updateContext } from "../services/firestoreService.js"

export const analyzeSituation = async (sessionId, description, jurisdiction) => {
  const user = requireUser()
  const cleanDescription = sanitizeInput(description, 2000)
  const { cleaned } = guardPrompt(cleanDescription)
  const { systemPrompt, userPrompt } = buildSituationPrompts(cleaned, jurisdiction)

  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.situationFinder.model,
    maxTokens: MODELS.situationFinder.maxTokens,
    jsonMode: true
  })
  const parsed = parseSituationResponse(raw)
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
  }

  await updateContext(sessionId, user.uid, "situation", situationContext)
  await appendToTimeline(sessionId, user.uid, {
    type: "situation_identified",
    title: "Situation classified",
    description: `Identified as ${parsed.legalCategory} - ${parsed.subcategory} (${parsed.severity} severity)`
  })

  return apiResult(situationContext)
}
