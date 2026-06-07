// src/services/sessionService.js
import {
  createSession,
  getFullContext,
  getUserSessions,
  updateSessionStatus
} from "../context/contextManager.js";
import { db } from "../config/firebase.js";
import CONSTANTS from "../config/constants.js";
import { createError } from "../middleware/errorHandler.js";

// ─── Create a new legal session ───────────────────────────────────
export const createNewSession = async (userId, jurisdiction) => {
  const session = await createSession(userId, jurisdiction);

  return {
    sessionId: session.sessionId,
    status: session.status,
    jurisdiction: session.jurisdiction,
    createdAt: session.createdAt
  };
};


// ─── Get a single session ─────────────────────────────────────────
export const getSession = async (sessionId, userId) => {
  const session = await getFullContext(sessionId, userId);

  return {
    sessionId: session.sessionId,
    status: session.status,
    jurisdiction: session.jurisdiction,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    context: session.context
  };
};


// ─── Get all sessions for a user ──────────────────────────────────
export const getAllSessions = async (userId) => {
  return await getUserSessions(userId);
};


// ─── Close a session ──────────────────────────────────────────────
export const closeSession = async (sessionId, userId) => {
  await updateSessionStatus(
    sessionId,
    userId,
    CONSTANTS.SESSION_STATUS.RESOLVED
  );

  return { success: true, message: "Session resolved." };
};


// ─── Create user profile if first login ──────────────────────────
export const ensureUserProfile = async (userId, email, jurisdiction) => {
  try {
    const userRef = db
      .collection(CONSTANTS.COLLECTIONS.USERS)
      .doc(userId);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email,
        jurisdiction: jurisdiction || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return userDoc.data() || { email, jurisdiction };

  } catch (err) {
    throw createError("Failed to create user profile.", 500);
  }
};
