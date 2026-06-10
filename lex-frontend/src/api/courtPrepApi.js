import { callAI } from "../services/aiService.js"
import MODELS from "../services/ai/models.js"
import { buildCourtPrepPrompts } from "../services/ai/promptBuilder.js"
import { parseCourtPrepResponse } from "../services/ai/responseParser.js"
import { apiResult, appendToTimeline, getSession, requireUser, updateContext } from "../services/firestoreService.js"

export const generateCourtPrep = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  if (!session.context.situation?.legalCategory) {
    throw new Error("Please complete Situation Finder before generating court prep.")
  }
  if (!session.context.rights?.identified?.length) {
    throw new Error("Please complete Rights Navigator before generating court prep.")
  }

  const { systemPrompt, userPrompt } = buildCourtPrepPrompts(session.context)
  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.courtPrep.model,
    maxTokens: MODELS.courtPrep.maxTokens,
    jsonMode: true
  })
  const parsed = parseCourtPrepResponse(raw)
  const courtPrepContext = {
    briefGenerated: true,
    briefContent: parsed,
    completedAt: new Date().toISOString()
  }

  await updateContext(sessionId, user.uid, "courtPrep", courtPrepContext)
  await appendToTimeline(sessionId, user.uid, {
    type: "court_prep_generated",
    title: "Court preparation brief generated",
    description: `${parsed.courtType} preparation brief created - ${parsed.keyArguments.length} key arguments identified`
  })

  return apiResult(courtPrepContext)
}

export const getCourtPrep = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  if (!session.context.courtPrep?.briefGenerated) {
    throw new Error("No court prep brief has been generated yet.")
  }
  return apiResult(session.context.courtPrep)
}
