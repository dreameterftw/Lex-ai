// src/services/deadlineService.js
import { callAI } from "../ai/groqService.js";
import { buildDeadlinePrompts } from "../ai/promptBuilder.js";
import { parseDeadlineResponse } from "../ai/responseParser.js";
import MODELS from "../ai/models.js";
import {
  getFullContext,
  updateContext,
  appendToTimeline
} from "../context/contextManager.js";
import { createError } from "../middleware/errorHandler.js";

export const calculateDeadlines = async (sessionId, userId) => {

  const session = await getFullContext(sessionId, userId);

  if (!session.context.situation?.legalCategory) {
    throw createError(
      "Please complete Situation Finder before tracking deadlines.",
      400
    );
  }

  const { systemPrompt, userPrompt } =
    buildDeadlinePrompts(session.context);

  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.deadlineTracker.model,
    maxTokens: MODELS.deadlineTracker.maxTokens,
    jsonMode: true
  });

  const parsed = parseDeadlineResponse(raw);

  // Sort active deadlines by days remaining
  const sortedActive = parsed.active.sort(
    (a, b) => a.daysRemaining - b.daysRemaining
  );

  const deadlineContext = {
    active: sortedActive,
    expired: [],
    approaching: parsed.approaching,
    notes: parsed.notes,
    completedAt: new Date().toISOString()
  };

  await updateContext(sessionId, userId, "deadlines", deadlineContext);

  // Create alerts for critical deadlines
  if (parsed.active.some(d => d.urgency === "Critical")) {
    await appendToTimeline(sessionId, userId, {
      type: "critical_deadline",
      title: "Critical deadline identified",
      description: `${
        parsed.active
          .filter(d => d.urgency === "Critical")
          .map(d => d.name)
          .join(", ")
      } — act immediately`
    });
  } else {
    await appendToTimeline(sessionId, userId, {
      type: "deadlines_calculated",
      title: "Deadlines calculated",
      description: `${parsed.active.length} active deadlines identified`
    });
  }

  return deadlineContext;
};


// ─── Get current deadlines for a session ─────────────────────────
export const getDeadlines = async (sessionId, userId) => {
  const session = await getFullContext(sessionId, userId);
  return session.context.deadlines;
};

// ─── Add a custom user-created deadline ─────────────────────────────
export const addCustomDeadline = async (
  sessionId,
  userId,
  name,
  description,
  exactDate,
  actionRequired
) => {
  const session = await getFullContext(sessionId, userId);
  const context = session.context.deadlines || { active: [], expired: [], approaching: [], completedAt: null };

  const dueDate = new Date(exactDate);
  if (Number.isNaN(dueDate.getTime())) {
    throw createError("Invalid due date.", 400);
  }

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const daysRemaining = Math.floor(diffMs / 86400000);

  const urgency = diffMs <= 0
    ? "Critical"
    : diffMs <= 7 * 86400000
      ? "Critical"
      : diffMs <= 14 * 86400000
        ? "High"
        : diffMs <= 30 * 86400000
          ? "Medium"
          : "Low";

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
  };

  const sortedActive = [...(context.active || []), newDeadline].sort(
    (a, b) => new Date(a.exactDate) - new Date(b.exactDate)
  );

  const deadlineContext = {
    active: sortedActive,
    expired: context.expired || [],
    approaching: context.approaching || [],
    notes: context.notes || "",
    completedAt: new Date().toISOString()
  };

  await updateContext(sessionId, userId, "deadlines", deadlineContext);

  await appendToTimeline(sessionId, userId, {
    type: "custom_deadline_created",
    title: "Custom deadline added",
    description: `${newDeadline.name} was added for ${dueDate.toLocaleDateString()}`
  });

  return newDeadline;
};
