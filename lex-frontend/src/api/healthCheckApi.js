import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore"
import { callAI } from "../services/aiService.js"
import CONSTANTS from "../services/ai/constants.js"
import MODELS from "../services/ai/models.js"
import { buildHealthCheckPrompts } from "../services/ai/promptBuilder.js"
import { parseHealthCheckResponse } from "../services/ai/responseParser.js"
import { db } from "../firebase/firebase.js"
import { apiResult, requireUser } from "../services/firestoreService.js"

export const getQuestions = async () => apiResult([
  { id: "housing", question: "Are you currently renting or have you recently signed a lease?", type: "boolean" },
  { id: "employment", question: "Are you currently employed and have you signed an employment contract?", type: "boolean" },
  { id: "debt", question: "Do you have any outstanding debts, loans, or accounts in collections?", type: "boolean" },
  { id: "disputes", question: "Do you have any ongoing disputes with a landlord, employer, or business?", type: "boolean" },
  { id: "recent_documents", question: "Have you signed any contracts or legal documents in the last 6 months?", type: "boolean" },
  { id: "government_letters", question: "Have you received any letters from courts, government agencies, or debt collectors recently?", type: "boolean" },
  { id: "small_business", question: "Do you own or operate a small business?", type: "boolean" }
])

export const runHealthCheck = async (jurisdictionOrAnswers, maybeAnswers) => {
  const user = requireUser()
  const answers = maybeAnswers || jurisdictionOrAnswers
  const explicitJurisdiction = maybeAnswers ? jurisdictionOrAnswers : null

  if (!answers || Object.keys(answers).length === 0) {
    throw new Error("Health check answers are required.")
  }

  const userRef = doc(db, CONSTANTS.COLLECTIONS.USERS, user.uid)
  const userDoc = await getDoc(userRef)
  const jurisdiction = explicitJurisdiction || userDoc.data()?.jurisdiction || "Unknown"
  const { systemPrompt, userPrompt } = buildHealthCheckPrompts({ jurisdiction, userId: user.uid }, answers)
  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.healthCheck.model,
    maxTokens: MODELS.healthCheck.maxTokens,
    jsonMode: true
  })
  const parsed = parseHealthCheckResponse(raw)
  const healthCheckResult = {
    id: `hc_${Date.now()}`,
    lastCheckDate: new Date().toISOString(),
    exposures: parsed.exposures,
    recommendations: parsed.recommendations,
    areasToReview: parsed.areasToReview,
    overallHealthScore: parsed.overallHealthScore,
    summary: parsed.summary,
    jurisdiction
  }

  await setDoc(userRef, {
    lastHealthCheck: healthCheckResult,
    healthCheckHistory: [healthCheckResult, ...(userDoc.data()?.healthCheckHistory || [])].slice(0, 10),
    updatedAt: new Date().toISOString()
  }, { merge: true })

  await Promise.all(parsed.exposures
    .filter((exposure) => exposure.severity === "High")
    .map((exposure) => addDoc(collection(db, CONSTANTS.COLLECTIONS.ALERTS), {
      userId: user.uid,
      type: CONSTANTS.ALERT_TYPES.HEALTH_CHECK,
      content: {
        title: `Legal exposure identified: ${exposure.area}`,
        message: exposure.risk,
        action: exposure.action,
        severity: exposure.severity
      },
      read: false,
      createdAt: new Date().toISOString()
    })))

  return apiResult(healthCheckResult)
}

export const getHealthCheckHistory = async () => {
  const user = requireUser()
  const userDoc = await getDoc(doc(db, CONSTANTS.COLLECTIONS.USERS, user.uid))
  return apiResult(userDoc.data()?.healthCheckHistory || [])
}

export const getLastHealthCheck = async () => {
  const user = requireUser()
  const userDoc = await getDoc(doc(db, CONSTANTS.COLLECTIONS.USERS, user.uid))
  return apiResult(userDoc.data()?.lastHealthCheck || null)
}
