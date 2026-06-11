import { callAIWithHistory } from "../services/aiService.js"
import MODELS from "../services/ai/models.js"
import { buildCounselPrompts } from "../services/ai/promptBuilder.js"
import { guardPrompt, sanitizeInput } from "../services/ai/promptGuard.js"
import { apiResult, appendToCounselHistory, getSession, requireUser } from "../services/firestoreService.js"

export const sendMessage = async (sessionId, message) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  if (!session.context.situation?.legalCategory) {
    throw new Error("Please complete Situation Finder before using Lex Counsel.")
  }

  const cleanMessage = sanitizeInput(message, 1000)
  const { cleaned } = guardPrompt(cleanMessage)
  const { systemPrompt, userPrompt } = buildCounselPrompts(session.context, cleaned)
  const aiResponse = await callAIWithHistory({
    systemPrompt,
    userPrompt,
    history: session.context.counsel?.history || [],
    newMessage: cleaned,
    model: MODELS.lexCounsel.model,
    maxTokens: MODELS.lexCounsel.maxTokens
  })
  const exchange = await appendToCounselHistory(sessionId, user.uid, cleaned, aiResponse)

  return apiResult({
    message: aiResponse,
    exchangeId: exchange.id,
    timestamp: exchange.timestamp
  })
}

export const getCounselHistory = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  return apiResult(session.context.counsel?.history || [])
}
