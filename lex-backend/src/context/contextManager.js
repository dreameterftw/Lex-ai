// src/context/contextManager.js
import { db } from "../config/firebase.js";
import CONSTANTS from "../config/constants.js";
import { createError } from "../middleware/errorHandler.js";

const { COLLECTIONS, SESSION_STATUS } = CONSTANTS;

// ─── Default context structure ────────────────────────────────────
// This is the complete shape of every user's legal context
// Every feature reads from and writes to specific fields here
const buildDefaultContext = () => ({

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

});

// ─── Create a new session ─────────────────────────────────────────
export const createSession = async (userId, jurisdiction) => {
  try {

    const sessionData = {
      userId,
      status: SESSION_STATUS.ACTIVE,
      jurisdiction,
      context: buildDefaultContext(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const sessionRef = await db
      .collection(COLLECTIONS.SESSIONS)
      .add(sessionData);

    await db
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .set({ jurisdiction, updatedAt: new Date().toISOString() },
        { merge: true });

    console.log(`[CONTEXT] Session created: ${sessionRef.id}`);

    return {
      sessionId: sessionRef.id,
      ...sessionData
    };

  } catch (err) {
    console.error("[CONTEXT] createSession error:", err.message);
    throw createError("Failed to create session.", 500);
  }
};

// ─── Get full context object ────────────────────────────────────────
export const getFullContext = async (sessionId, userId) => {
  try {

    const sessionDoc = await db
      .collection(COLLECTIONS.SESSIONS)
      .doc(sessionId)
      .get();

    if (!sessionDoc.exists) {
      throw createError("Session not found.", 404);
    }

    const sessionData = sessionDoc.data();

    if (sessionData.userId !== userId) {
      throw createError("Unauthorised access to session.", 403);
    }

    return {
      sessionId,
      ...sessionData
    };

  } catch (err) {
    if (err.status) throw err;
    console.error("[CONTEXT] getFullContext error:", err.message);
    throw createError("Failed to retrieve session.", 500);
  }
};

// ─── Get context field ─────────────────────────────────────────────
export const getContext = async (sessionId, userId, field = null) => {
  try {

    const session = await getFullContext(sessionId, userId);

    if (field) {
      if (!(field in session.context)) {
        throw createError(`Context field "${field}" not found.`, 404);
      }
      return session.context[field];
    }

    return session.context;

  } catch (err) {
    if (err.status) throw err;
    throw createError("Failed to retrieve context.", 500);
  }
};

// ─── Update a specific context field ───────────────────────────────
export const updateContext = async (
  sessionId,
  userId,
  field,
  data
) => {
  try {

    await getFullContext(sessionId, userId);

    await db
      .collection(COLLECTIONS.SESSIONS)
      .doc(sessionId)
      .update({
        [`context.${field}`]: data,
        updatedAt: new Date().toISOString()
      });

    console.log(`[CONTEXT] Updated field "${field}" for session: ${sessionId}`);

    return true;

  } catch (err) {
    if (err.status) throw err;
    console.error("[CONTEXT] updateContext error:", err.message);
    throw createError("Failed to update context.", 500);
  }
};

// ─── Append to timeline ───────────────────────────────────────────
export const appendToTimeline = async (sessionId, userId, event) => {
  try {

    const context = await getContext(sessionId, userId, "timeline");

    const newEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    const updatedEvents = [...(context.events || []), newEvent];

    await updateContext(sessionId, userId, "timeline", {
      events: updatedEvents,
      completedAt: context.completedAt
    });

    return newEvent;

  } catch (err) {
    if (err.status) throw err;
    throw createError("Failed to append to timeline.", 500);
  }
};

// ─── Append to counsel history ────────────────────────────────────
export const appendToCounselHistory = async (
  sessionId,
  userId,
  userMessage,
  aiResponse
) => {
  try {

    const context = await getContext(sessionId, userId, "counsel");

    const exchange = {
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: userMessage,
      lex: aiResponse
    };

    const updatedHistory = [...(context.history || []), exchange];
    const trimmedHistory = updatedHistory.slice(-20);

    await updateContext(sessionId, userId, "counsel", {
      history: trimmedHistory,
      topicsDiscussed: context.topicsDiscussed || []
    });

    return exchange;

  } catch (err) {
    if (err.status) throw err;
    throw createError("Failed to update counsel history.", 500);
  }
};

// ─── Update session status ────────────────────────────────────────
export const updateSessionStatus = async (
  sessionId,
  userId,
  status
) => {
  try {

    await getFullContext(sessionId, userId);

    await db
      .collection(COLLECTIONS.SESSIONS)
      .doc(sessionId)
      .update({
        status,
        updatedAt: new Date().toISOString()
      });

    return true;

  } catch (err) {
    if (err.status) throw err;
    throw createError("Failed to update session status.", 500);
  }
};

// ─── Get all sessions for a user ──────────────────────────────────
export const getUserSessions = async (userId) => {
  try {

    const snapshot = await db
      .collection(COLLECTIONS.SESSIONS)
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .get();

    const sessions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      sessions.push({
        sessionId: doc.id,
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
      });
    });

    return sessions;

  } catch (err) {
    console.error("[CONTEXT] getUserSessions error:", err.message);
    throw createError("Failed to retrieve sessions.", 500);
  }
};

// ─── Build context summary for AI ────────────────────────────────
export const buildContextSummary = (context) => {
  const parts = [];

  if (context.situation?.legalCategory) {
    parts.push(`SITUATION:
      Category: ${context.situation.legalCategory}
      Subcategory: ${context.situation.subcategory || "N/A"}
      Severity: ${context.situation.severity}
      Jurisdiction: ${context.situation.jurisdiction}
      Time Sensitive: ${context.situation.timeIsSensitive}
      Description: ${context.situation.rawDescription}`
    );
  }

  if (context.document?.documentType) {
    const clauses = context.document.flaggedClauses
      ?.map(c =>
        `- ${c.clauseId}: ${c.issue} (${c.severity})`
      ).join("\n") || "None";

    parts.push(`DOCUMENT:
      Type: ${context.document.documentType}
      Overall Risk: ${context.document.overallRisk}
      Flagged Clauses:
${clauses}
      Missing Protections: ${
        context.document.missingProtections?.join(", ") || "None"
      }`
    );
  }

  if (context.rights?.identified?.length > 0) {
    const rights = context.rights.identified
      ?.map(r =>
        `- ${r.right} (${r.law}): ${
          r.violated ? "VIOLATED" : "Not violated"
        }`
      ).join("\n");

    parts.push(`RIGHTS:
${rights}`);
  }

  if (context.deadlines?.active?.length > 0) {
    const deadlines = context.deadlines.active
      ?.map(d =>
        `- ${d.name}: ${d.daysRemaining} days remaining (${d.urgency})`
      ).join("\n");

    parts.push(`ACTIVE DEADLINES:
${deadlines}`);
  }

  if (context.signal?.letterGenerated) {
    parts.push(`SIGNAL LETTER: Generated (${context.signal.letterType})`);
  }

  if (context.counsel?.history?.length > 0) {
    const recentHistory = context.counsel.history
      .slice(-5)
      .map(h => `User: ${h.user}\nLex: ${h.lex}`)
      .join("\n\n");

    parts.push(`RECENT CONVERSATION:
${recentHistory}`);
  }

  return parts.length > 0
    ? parts.join("\n\n")
    : "No context available yet.";
};
