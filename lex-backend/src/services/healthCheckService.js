// src/services/healthCheckService.js
import { callAI } from "../ai/groqService.js";
import { buildHealthCheckPrompts } from "../ai/promptBuilder.js";
import { parseHealthCheckResponse } from "../ai/responseParser.js";
import MODELS from "../ai/models.js";
import { db } from "../config/firebase.js";
import CONSTANTS from "../config/constants.js";
import { createError } from "../middleware/errorHandler.js";

// ─── Health check questions ───────────────────────────────────────
// These are shown to the user in the frontend
export const HEALTH_CHECK_QUESTIONS = [
  {
    id: "housing",
    question: "Are you currently renting or have you recently signed a lease?",
    type: "boolean"
  },
  {
    id: "employment",
    question: "Are you currently employed and have you signed an employment contract?",
    type: "boolean"
  },
  {
    id: "debt",
    question: "Do you have any outstanding debts, loans, or accounts in collections?",
    type: "boolean"
  },
  {
    id: "disputes",
    question: "Do you have any ongoing disputes with a landlord, employer, or business?",
    type: "boolean"
  },
  {
    id: "recent_documents",
    question: "Have you signed any contracts or legal documents in the last 6 months?",
    type: "boolean"
  },
  {
    id: "government_letters",
    question: "Have you received any letters from courts, government agencies, or debt collectors recently?",
    type: "boolean"
  },
  {
    id: "small_business",
    question: "Do you own or operate a small business?",
    type: "boolean"
  }
];


// ─── Run health check ─────────────────────────────────────────────
export const runHealthCheck = async (userId, jurisdiction, answers) => {

  if (!answers || Object.keys(answers).length === 0) {
    throw createError("Health check answers are required.", 400);
  }

  // Get user profile
  const userDoc = await db
    .collection(CONSTANTS.COLLECTIONS.USERS)
    .doc(userId)
    .get();

  const userProfile = {
    jurisdiction: jurisdiction ||
      userDoc.data()?.jurisdiction ||
      "Unknown",
    userId
  };

  const { systemPrompt, userPrompt } =
    buildHealthCheckPrompts(userProfile, answers);

  const raw = await callAI({
    systemPrompt,
    userPrompt,
    model: MODELS.healthCheck.model,
    maxTokens: MODELS.healthCheck.maxTokens,
    jsonMode: true
  });

  const parsed = parseHealthCheckResponse(raw);

  // Save health check result to user profile
  const healthCheckResult = {
    lastCheckDate: new Date().toISOString(),
    exposures: parsed.exposures,
    recommendations: parsed.recommendations,
    areasToReview: parsed.areasToReview,
    overallHealthScore: parsed.overallHealthScore,
    summary: parsed.summary,
    jurisdiction: userProfile.jurisdiction
  };

  await db
    .collection(CONSTANTS.COLLECTIONS.USERS)
    .doc(userId)
    .update({
      lastHealthCheck: healthCheckResult,
      updatedAt: new Date().toISOString()
    });

  // Create alerts for high severity exposures
  const highExposures = parsed.exposures
    .filter(e => e.severity === "High");

  for (const exposure of highExposures) {
    await db.collection(CONSTANTS.COLLECTIONS.ALERTS).add({
      userId,
      type: CONSTANTS.ALERT_TYPES.HEALTH_CHECK,
      content: {
        title: `Legal exposure identified: ${exposure.area}`,
        message: exposure.risk,
        action: exposure.action,
        severity: exposure.severity
      },
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  return healthCheckResult;
};


// ─── Get health check questions ───────────────────────────────────
export const getHealthCheckQuestions = () => {
  return HEALTH_CHECK_QUESTIONS;
};


// ─── Get last health check result ────────────────────────────────
export const getLastHealthCheck = async (userId) => {
  const userDoc = await db
    .collection(CONSTANTS.COLLECTIONS.USERS)
    .doc(userId)
    .get();

  if (!userDoc.exists || !userDoc.data()?.lastHealthCheck) {
    return null;
  }

  return userDoc.data().lastHealthCheck;
};
