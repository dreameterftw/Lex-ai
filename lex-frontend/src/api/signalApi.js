import { callAI } from "../services/aiService.js"
import MODELS from "../services/ai/models.js"
import { buildSignalPrompts } from "../services/ai/promptBuilder.js"
import { parseSignalResponse } from "../services/ai/responseParser.js"
import { apiResult, appendToTimeline, getSession, requireUser, updateContext } from "../services/firestoreService.js"

export const generateSignal = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  if (!session.context.rights?.identified?.length) {
    throw new Error("Please complete Rights Navigator before generating a letter.")
  }

  const { systemPrompt, userPrompt } = buildSignalPrompts(session.context)
  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.signalLetter.model,
    maxTokens: MODELS.signalLetter.maxTokens,
    jsonMode: true
  })
  const parsed = parseSignalResponse(raw)
  const signalContext = {
    letterGenerated: true,
    letterContent: parsed,
    letterType: parsed.letterType,
    sentDate: null,
    completedAt: new Date().toISOString()
  }

  await updateContext(sessionId, user.uid, "signal", signalContext)
  await appendToTimeline(sessionId, user.uid, {
    type: "signal_letter_generated",
    title: "Signal letter generated",
    description: `${parsed.letterType} drafted - ${parsed.legalCitations.length} laws cited`
  })

  return apiResult(signalContext)
}

export const markLetterSent = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  if (!session.context.signal?.letterGenerated) throw new Error("No letter has been generated yet.")

  const updatedSignal = {
    ...session.context.signal,
    sentDate: new Date().toISOString()
  }

  await updateContext(sessionId, user.uid, "signal", updatedSignal)
  await appendToTimeline(sessionId, user.uid, {
    type: "signal_letter_sent",
    title: "Signal letter sent",
    description: "Formal rights assertion letter sent to recipient"
  })

  return apiResult({ success: true, sentDate: updatedSignal.sentDate })
}
