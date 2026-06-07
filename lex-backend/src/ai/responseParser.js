// src/ai/responseParser.js
import { createError } from "../middleware/errorHandler.js";

// ─── Generic validator ────────────────────────────────────────────
// Checks required fields exist in an AI response
const validateFields = (response, requiredFields, featureName) => {
  const missing = requiredFields.filter(field => {
    const keys = field.split(".");
    let current = response;
    for (const key of keys) {
      if (current === undefined || current === null) return true;
      current = current[key];
    }
    return current === undefined || current === null;
  });

  if (missing.length > 0) {
    console.error(
      `[PARSER] ${featureName} missing fields:`,
      missing
    );
    throw createError(
      `AI response incomplete for ${featureName}.`,
      500
    );
  }
};


// ─── Situation Finder parser ──────────────────────────────────────
export const parseSituationResponse = (response) => {
  validateFields(response, [
    "legalCategory",
    "subcategory",
    "severity",
    "timeIsSensitive",
    "reasoning",
    "suggestedNextStep"
  ], "Situation Finder");

  return {
    legalCategory: String(response.legalCategory),
    subcategory: String(response.subcategory),
    severity: ["High", "Medium", "Low"].includes(response.severity)
      ? response.severity : "Medium",
    timeIsSensitive: Boolean(response.timeIsSensitive),
    reasoning: String(response.reasoning),
    suggestedNextStep: String(response.suggestedNextStep),
    needsLawyer: Boolean(response.needsLawyer),
    needsLawyerReason: response.needsLawyerReason || null
  };
};


// ─── Document X-Ray parser ──────────────────────────────────────
export const parseDocumentResponse = (response) => {
  validateFields(response, [
    "documentType",
    "flaggedClauses",
    "overallRisk",
    "summary"
  ], "Document X-Ray");

  return {
    documentType: String(response.documentType),
    flaggedClauses: Array.isArray(response.flaggedClauses)
      ? response.flaggedClauses.map(clause => ({
          clauseId: String(clause.clauseId || "Unknown"),
          originalText: String(clause.originalText || ""),
          plainEnglish: String(clause.plainEnglish || ""),
          issue: String(clause.issue || ""),
          severity: ["High", "Medium", "Low"]
            .includes(clause.severity) ? clause.severity : "Medium",
          law: clause.law || null
        }))
      : [],
    missingProtections: Array.isArray(response.missingProtections)
      ? response.missingProtections.map(String) : [],
    userLeveragePoints: Array.isArray(response.userLeveragePoints)
      ? response.userLeveragePoints.map(String) : [],
    overallRisk: ["High", "Medium", "Low"]
      .includes(response.overallRisk) ? response.overallRisk : "Medium",
    summary: String(response.summary)
  };
};


// ─── Rights Navigator parser ──────────────────────────────────────
export const parseRightsResponse = (response) => {
  validateFields(response, [
    "identified",
    "violated",
    "evidenceToCollect",
    "immediateAction"
  ], "Rights Navigator");

  return {
    identified: Array.isArray(response.identified)
      ? response.identified.map(r => ({
          right: String(r.right || ""),
          law: String(r.law || ""),
          explanation: String(r.explanation || ""),
          applies: Boolean(r.applies)
        }))
      : [],
    violated: Array.isArray(response.violated)
      ? response.violated.map(r => ({
          right: String(r.right || ""),
          law: String(r.law || ""),
          violation: String(r.violation || ""),
          evidenceAvailable: String(r.evidenceAvailable || "")
        }))
      : [],
    evidenceToCollect: Array.isArray(response.evidenceToCollect)
      ? response.evidenceToCollect.map(String) : [],
    immediateAction: String(response.immediateAction || "")
  };
};


// ─── Deadline Tracker parser ──────────────────────────────────────
export const parseDeadlineResponse = (response) => {
  validateFields(response, ["active"], "Deadline Tracker");

  const validUrgency = ["Critical", "High", "Medium", "Low"];

  return {
    active: Array.isArray(response.active)
      ? response.active.map(d => ({
          name: String(d.name || ""),
          description: String(d.description || ""),
          daysRemaining: Number(d.daysRemaining) || 0,
          exactDate: String(d.exactDate || ""),
          urgency: validUrgency.includes(d.urgency)
            ? d.urgency : "Medium",
          consequence: String(d.consequence || ""),
          actionRequired: String(d.actionRequired || ""),
          law: d.law || null
        }))
      : [],
    approaching: Array.isArray(response.approaching)
      ? response.approaching.map(String) : [],
    notes: String(response.notes || "")
  };
};


// ─── Signal Letter parser ─────────────────────────────────────────
export const parseSignalResponse = (response) => {
  validateFields(response, [
    "letterType",
    "recipient",
    "subject",
    "body",
    "requestedAction"
  ], "Signal Letter");

  return {
    letterType: String(response.letterType),
    recipient: String(response.recipient),
    subject: String(response.subject),
    body: String(response.body),
    legalCitations: Array.isArray(response.legalCitations)
      ? response.legalCitations.map(String) : [],
    requestedAction: String(response.requestedAction),
    responseDeadline: String(response.responseDeadline || "14 days"),
    disclaimer: String(response.disclaimer || "")
  };
};


// ─── Court Prep parser ──────────────────────────────────────────
export const parseCourtPrepResponse = (response) => {
  validateFields(response, [
    "courtType",
    "whatToBring",
    "openingStatement",
    "keyArguments"
  ], "Court Prep");

  return {
    courtType: String(response.courtType),
    whatToBring: Array.isArray(response.whatToBring)
      ? response.whatToBring.map(String) : [],
    openingStatement: String(response.openingStatement),
    keyArguments: Array.isArray(response.keyArguments)
      ? response.keyArguments.map(String) : [],
    likelyQuestions: Array.isArray(response.likelyQuestions)
      ? response.likelyQuestions.map(q => ({
          question: String(q.question || ""),
          suggestedAnswer: String(q.suggestedAnswer || "")
        }))
      : [],
    opposingArguments: Array.isArray(response.opposingArguments)
      ? response.opposingArguments.map(String) : [],
    counterArguments: Array.isArray(response.counterArguments)
      ? response.counterArguments.map(String) : [],
    whatNotToSay: Array.isArray(response.whatNotToSay)
      ? response.whatNotToSay.map(String) : [],
    finalTip: String(response.finalTip || "")
  };
};


// ─── Health Check parser ──────────────────────────────────────────
export const parseHealthCheckResponse = (response) => {
  validateFields(response, [
    "exposures",
    "recommendations",
    "overallHealthScore"
  ], "Health Check");

  return {
    exposures: Array.isArray(response.exposures)
      ? response.exposures.map(e => ({
          area: String(e.area || ""),
          risk: String(e.risk || ""),
          severity: ["High", "Medium", "Low"]
            .includes(e.severity) ? e.severity : "Medium",
          action: String(e.action || "")
        }))
      : [],
    recommendations: Array.isArray(response.recommendations)
      ? response.recommendations.map(String) : [],
    areasToReview: Array.isArray(response.areasToReview)
      ? response.areasToReview.map(String) : [],
    overallHealthScore: ["Good", "Fair", "Needs Attention" ]
      .includes(response.overallHealthScore)
      ? response.overallHealthScore : "Fair",
    summary: String(response.summary || "")
  };
};
