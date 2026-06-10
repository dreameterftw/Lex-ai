import { callAI } from "../services/aiService.js"
import MODELS from "../services/ai/models.js"
import { buildDeadlinePrompts } from "../services/ai/promptBuilder.js"
import { parseDeadlineResponse } from "../services/ai/responseParser.js"
import { apiResult, appendToTimeline, getSession, requireUser, updateContext } from "../services/firestoreService.js"

export const calculateDeadlines = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  if (!session.context.situation?.legalCategory) {
    throw new Error("Please complete Situation Finder before tracking deadlines.")
  }

  const { systemPrompt, userPrompt } = buildDeadlinePrompts(session.context)
  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.deadlineTracker.model,
    maxTokens: MODELS.deadlineTracker.maxTokens,
    jsonMode: true
  })
  const parsed = parseDeadlineResponse(raw)
  const sortedActive = parsed.active.sort((a, b) => a.daysRemaining - b.daysRemaining)
  const deadlineContext = {
    active: sortedActive,
    expired: [],
    approaching: parsed.approaching,
    notes: parsed.notes,
    completedAt: new Date().toISOString()
  }

  await updateContext(sessionId, user.uid, "deadlines", deadlineContext)
  await appendToTimeline(sessionId, user.uid, parsed.active.some((d) => d.urgency === "Critical")
    ? {
        type: "critical_deadline",
        title: "Critical deadline identified",
        description: `${parsed.active.filter((d) => d.urgency === "Critical").map((d) => d.name).join(", ")} - act immediately`
      }
    : {
        type: "deadlines_calculated",
        title: "Deadlines calculated",
        description: `${parsed.active.length} active deadlines identified`
      })

  return apiResult(deadlineContext)
}

export const getDeadlines = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  return apiResult(session.context.deadlines)
}

export const createDeadline = async (sessionId, name, exactDate, actionRequired, description) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  const context = session.context.deadlines || { active: [], expired: [], approaching: [], completedAt: null }
  const dueDate = new Date(exactDate)
  if (Number.isNaN(dueDate.getTime())) throw new Error("Invalid due date.")

  const now = new Date()
  const diffMs = dueDate.getTime() - now.getTime()
  const daysRemaining = Math.floor(diffMs / 86400000)
  const urgency = diffMs <= 7 * 86400000
    ? "Critical"
    : diffMs <= 14 * 86400000
      ? "High"
      : diffMs <= 30 * 86400000
        ? "Medium"
        : "Low"
  const newDeadline = {
    id: `dl_${Date.now()}`,
    name: String(name),
    description: String(description || ""),
    exactDate: dueDate.toISOString(),
    actionRequired: actionRequired ? String(actionRequired) : "Review and complete before due date.",
    urgency,
    daysRemaining,
    createdBy: "user",
    createdAt: now.toISOString()
  }

  await updateContext(sessionId, user.uid, "deadlines", {
    active: [...(context.active || []), newDeadline].sort((a, b) => new Date(a.exactDate) - new Date(b.exactDate)),
    expired: context.expired || [],
    approaching: context.approaching || [],
    notes: context.notes || "",
    completedAt: new Date().toISOString()
  })
  await appendToTimeline(sessionId, user.uid, {
    type: "custom_deadline_created",
    title: "Custom deadline added",
    description: `${newDeadline.name} was added for ${dueDate.toLocaleDateString()}`
  })

  return apiResult(newDeadline)
}
