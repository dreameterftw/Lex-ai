import { callAI } from "../services/aiService.js"
import MODELS from "../services/ai/models.js"
import { buildRightsPrompts } from "../services/ai/promptBuilder.js"
import { parseRightsResponse } from "../services/ai/responseParser.js"
import { apiResult, appendToTimeline, getSession, requireUser, updateContext } from "../services/firestoreService.js"

export const identifyRights = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  if (!session.context.situation?.legalCategory) {
    throw new Error("Please complete Situation Finder before identifying rights.")
  }

  const { systemPrompt, userPrompt } = buildRightsPrompts(session.context)
  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.rightsNavigator.model,
    maxTokens: MODELS.rightsNavigator.maxTokens,
    jsonMode: true
  })
  const parsed = parseRightsResponse(raw)
  const rightsContext = {
    identified: parsed.identified,
    violated: parsed.violated,
    evidenceToCollect: parsed.evidenceToCollect,
    immediateAction: parsed.immediateAction,
    completedAt: new Date().toISOString()
  }

  await updateContext(sessionId, user.uid, "rights", rightsContext)
  await appendToTimeline(sessionId, user.uid, {
    type: "rights_identified",
    title: "Rights identified",
    description: `${parsed.identified.length} rights identified, ${parsed.violated.length} potential violations found`
  })

  return apiResult(rightsContext)
}
