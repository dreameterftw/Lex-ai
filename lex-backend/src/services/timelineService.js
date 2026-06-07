// src/services/timelineService.js
import {
  getFullContext,
  appendToTimeline
} from "../context/contextManager.js";

// ─── Get full timeline ────────────────────────────────────────────
export const getTimeline = async (sessionId, userId) => {
  const session = await getFullContext(sessionId, userId);
  return session.context.timeline?.events || [];
};


// ─── Add manual event ─────────────────────────────────────────────
export const addManualEvent = async (
  sessionId,
  userId,
  title,
  description
) => {
  const event = await appendToTimeline(sessionId, userId, {
    type: "manual",
    title,
    description,
    addedBy: "user"
  });

  return event;
};
