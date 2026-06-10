import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore"
import { auth, db } from "../firebase/firebase.js"
import CONSTANTS from "./ai/constants.js"

const { COLLECTIONS, SESSION_STATUS } = CONSTANTS

export const apiResult = (data) => {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return { ...data, data }
  }
  return { data }
}

export const requireUser = () => {
  const user = auth.currentUser
  if (!user) {
    window.dispatchEvent(new CustomEvent("auth:expired"))
    throw new Error("Please sign in again.")
  }
  return user
}

export const buildDefaultContext = () => ({
  situation: {
    rawDescription: null,
    legalCategory: null,
    subcategory: null,
    severity: null,
    timeIsSensitive: false,
    jurisdiction: null,
    completedAt: null
  },
  document: {
    fileName: null,
    documentType: null,
    rawText: null,
    flaggedClauses: [],
    missingProtections: [],
    userLeveragePoints: [],
    overallRisk: null,
    summary: null,
    completedAt: null
  },
  rights: {
    identified: [],
    violated: [],
    evidenceToCollect: [],
    immediateAction: null,
    completedAt: null
  },
  deadlines: {
    active: [],
    expired: [],
    completedAt: null
  },
  signal: {
    letterGenerated: false,
    letterContent: null,
    letterType: null,
    sentDate: null,
    completedAt: null
  },
  timeline: {
    events: [],
    completedAt: null
  },
  counsel: {
    history: [],
    topicsDiscussed: []
  },
  courtPrep: {
    briefGenerated: false,
    briefContent: null,
    completedAt: null
  },
  healthCheck: {
    lastCheckDate: null,
    exposures: [],
    recommendations: [],
    completedAt: null
  },
  outcome: {
    resolved: false,
    result: null,
    decidingFactor: null,
    resolvedAt: null
  }
})

export const createSession = async (userId, jurisdiction) => {
  const now = new Date().toISOString()
  const sessionData = {
    userId,
    status: SESSION_STATUS.ACTIVE,
    jurisdiction,
    context: buildDefaultContext(),
    createdAt: now,
    updatedAt: now
  }

  const sessionRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), sessionData)
  await setDoc(doc(db, COLLECTIONS.USERS, userId), { jurisdiction, updatedAt: now }, { merge: true })

  return { sessionId: sessionRef.id, ...sessionData }
}

export const getSession = async (sessionId, userId) => {
  const snap = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId))
  if (!snap.exists()) throw new Error("Session not found.")

  const data = snap.data()
  if (data.userId !== userId) throw new Error("Unauthorised access to session.")

  return { sessionId, ...data }
}

export const getAllSessions = async (userId) => {
  const sessionsQuery = query(
    collection(db, COLLECTIONS.SESSIONS),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  )
  const snapshot = await getDocs(sessionsQuery)

  return snapshot.docs.map((sessionDoc) => {
    const data = sessionDoc.data()
    return {
      sessionId: sessionDoc.id,
      status: data.status,
      jurisdiction: data.jurisdiction,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      summary: {
        situationCategory: data.context?.situation?.legalCategory,
        severity: data.context?.situation?.severity,
        activeDeadlines: data.context?.deadlines?.active?.length || 0,
        hasDocument: !!data.context?.document?.fileName,
        resolved: data.context?.outcome?.resolved || false
      }
    }
  })
}

export const closeSession = async (sessionId, userId) => {
  await getSession(sessionId, userId)
  await updateDoc(doc(db, COLLECTIONS.SESSIONS, sessionId), {
    status: SESSION_STATUS.ARCHIVED,
    updatedAt: new Date().toISOString()
  })
  return { success: true }
}

export const updateContext = async (sessionId, userId, field, data) => {
  await getSession(sessionId, userId)
  await updateDoc(doc(db, COLLECTIONS.SESSIONS, sessionId), {
    [`context.${field}`]: data,
    updatedAt: new Date().toISOString()
  })
  return true
}

export const appendToTimeline = async (sessionId, userId, event) => {
  const session = await getSession(sessionId, userId)
  const timeline = session.context?.timeline || { events: [], completedAt: null }
  const newEvent = {
    id: `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...event
  }

  await updateContext(sessionId, userId, "timeline", {
    events: [...(timeline.events || []), newEvent],
    completedAt: timeline.completedAt
  })

  return newEvent
}

export const appendToCounselHistory = async (sessionId, userId, userMessage, aiResponse) => {
  const session = await getSession(sessionId, userId)
  const counsel = session.context?.counsel || { history: [], topicsDiscussed: [] }
  const exchange = {
    id: `msg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: userMessage,
    lex: aiResponse
  }

  await updateContext(sessionId, userId, "counsel", {
    history: [...(counsel.history || []), exchange].slice(-20),
    topicsDiscussed: counsel.topicsDiscussed || []
  })

  return exchange
}

export const ensureUserProfile = async (userId, email, jurisdiction) => {
  const now = new Date().toISOString()
  await setDoc(
    doc(db, COLLECTIONS.USERS, userId),
    { email, jurisdiction, updatedAt: now, createdAt: now },
    { merge: true }
  )
  return { success: true }
}

export const updateSessionStatus = async (sessionId, userId, status) => {
  await getSession(sessionId, userId)
  await updateDoc(doc(db, COLLECTIONS.SESSIONS, sessionId), {
    status,
    updatedAt: new Date().toISOString()
  })
  return true
}

export const buildContextSummary = (context) => {
  const parts = []

  if (context.situation?.legalCategory) {
    parts.push(`SITUATION:
      Category: ${context.situation.legalCategory}
      Subcategory: ${context.situation.subcategory || "N/A"}
      Severity: ${context.situation.severity}
      Jurisdiction: ${context.situation.jurisdiction}
      Time Sensitive: ${context.situation.timeIsSensitive}
      Description: ${context.situation.rawDescription}`)
  }

  if (context.document?.documentType) {
    const clauses = context.document.flaggedClauses
      ?.map((c) => `- ${c.clauseId}: ${c.issue} (${c.severity})`)
      .join("\n") || "None"

    parts.push(`DOCUMENT:
      Type: ${context.document.documentType}
      Overall Risk: ${context.document.overallRisk}
      Flagged Clauses:
${clauses}
      Missing Protections: ${context.document.missingProtections?.join(", ") || "None"}`)
  }

  if (context.rights?.identified?.length > 0) {
    const rights = context.rights.identified
      ?.map((r) => `- ${r.right} (${r.law}): ${r.violated ? "VIOLATED" : "Not violated"}`)
      .join("\n")
    parts.push(`RIGHTS:
${rights}`)
  }

  if (context.deadlines?.active?.length > 0) {
    const deadlines = context.deadlines.active
      ?.map((d) => `- ${d.name}: ${d.daysRemaining} days remaining (${d.urgency})`)
      .join("\n")
    parts.push(`ACTIVE DEADLINES:
${deadlines}`)
  }

  if (context.signal?.letterGenerated) {
    parts.push(`SIGNAL LETTER: Generated (${context.signal.letterType})`)
  }

  if (context.counsel?.history?.length > 0) {
    const recentHistory = context.counsel.history
      .slice(-5)
      .map((h) => `User: ${h.user}\nLex: ${h.lex}`)
      .join("\n\n")
    parts.push(`RECENT CONVERSATION:
${recentHistory}`)
  }

  return parts.length > 0 ? parts.join("\n\n") : "No context available yet."
}
