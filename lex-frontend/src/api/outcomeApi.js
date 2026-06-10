import { addDoc, collection } from "firebase/firestore"
import CONSTANTS from "../services/ai/constants.js"
import { db } from "../firebase/firebase.js"
import {
  apiResult,
  appendToTimeline,
  getSession,
  requireUser,
  updateContext,
  updateSessionStatus
} from "../services/firestoreService.js"

export const recordOutcome = async (sessionId, outcome, decidingFactor) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  if (session.context.outcome?.resolved) {
    throw new Error("This situation has already been resolved.")
  }

  const outcomeContext = {
    resolved: true,
    result: outcome,
    decidingFactor,
    resolvedAt: new Date().toISOString()
  }

  await updateContext(sessionId, user.uid, "outcome", outcomeContext)
  await updateSessionStatus(sessionId, user.uid, CONSTANTS.SESSION_STATUS.RESOLVED)
  await appendToTimeline(sessionId, user.uid, {
    type: "situation_resolved",
    title: "Situation resolved",
    description: `Outcome: ${outcome.replace(/_/g, " ")}${decidingFactor ? ` - ${decidingFactor}` : ""}`
  })
  await addDoc(collection(db, "outcomes"), {
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
      counselMessageCount: session.context.counsel?.history?.length || 0
    },
    resolvedAt: outcomeContext.resolvedAt
  })

  return apiResult({
    success: true,
    outcome,
    decidingFactor,
    resolvedAt: outcomeContext.resolvedAt
  })
}

export const getOutcome = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  return apiResult(session.context.outcome)
}
