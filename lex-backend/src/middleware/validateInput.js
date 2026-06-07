// src/middleware/validateInput.js
import { body, param, validationResult } from "express-validator";
import CONSTANTS from "../config/constants.js";

// ─── Reusable validation runner ───────────────────────────────────
// Add this at the end of every validation chain in routes
export const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Invalid input.",
      details: errors.array().map(e => ({
        field: e.path,
        message: e.msg
      }))
    });
  }
  next();
};

// ─── Session validators ───────────────────────────────────────────
export const validateCreateSession = [
  body("jurisdiction")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Jurisdiction is required")
    .isLength({ max: 100 })
    .withMessage("Jurisdiction too long"),

  runValidation
];

// ─── Situation validators ─────────────────────────────────────────
export const validateSituation = [
  body("sessionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Session ID is required"),

  body("description")
    .isString()
    .trim()
    .isLength({ min: CONSTANTS.INPUT.SITUATION_MIN })
    .withMessage(`Description must be at least ${CONSTANTS.INPUT.SITUATION_MIN} characters`)
    .isLength({ max: CONSTANTS.INPUT.SITUATION_MAX })
    .withMessage(`Description must be under ${CONSTANTS.INPUT.SITUATION_MAX} characters`),

  body("jurisdiction")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Jurisdiction is required"),

  runValidation
];

// ─── Document validators ──────────────────────────────────────────
export const validateDocument = [
  body("sessionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Session ID is required"),

  body("rawText")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Document text is required")
    .isLength({ max: CONSTANTS.INPUT.DOCUMENT_MAX_CHARS })
    .withMessage("Document is too large to process"),

  body("fileName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("File name is required")
    .isLength({ max: 255 })
    .withMessage("File name too long"),

  runValidation
];

// ─── Rights validators ────────────────────────────────────────────
export const validateRights = [
  body("sessionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Session ID is required"),

  runValidation
];

// ─── Counsel validators ───────────────────────────────────────────
export const validateCounsel = [
  body("sessionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Session ID is required"),

  body("message")
    .isString()
    .trim()
    .isLength({ min: CONSTANTS.INPUT.COUNSEL_MIN })
    .withMessage("Message too short")
    .isLength({ max: CONSTANTS.INPUT.COUNSEL_MAX })
    .withMessage(`Message must be under ${CONSTANTS.INPUT.COUNSEL_MAX} characters`),

  runValidation
];

// ─── Signal validators ───────────────────────────────────────────
export const validateSignal = [
  body("sessionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Session ID is required"),

  runValidation
];

// ─── Custom deadline validators ────────────────────────────────────
export const validateDeadlineTask = [
  body("sessionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Session ID is required"),

  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Deadline title is required")
    .isLength({ max: 120 })
    .withMessage("Deadline title is too long"),

  body("exactDate")
    .isISO8601()
    .withMessage("A valid due date is required"),

  body("actionRequired")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Action description is too long"),

  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description is too long"),

  runValidation
];

// ─── Outcome validators ───────────────────────────────────────────
export const validateOutcome = [
  body("sessionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Session ID is required"),

  body("outcome")
    .isString()
    .trim()
    .isIn([
      "resolved_in_my_favour",
      "resolved_against_me",
      "ongoing",
      "escalated_to_court",
      "abandoned"
    ])
    .withMessage("Invalid outcome value"),

  body("decidingFactor")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Deciding factor too long"),

  runValidation
];

// ─── Session ID param validator ───────────────────────────────────
// Used on GET routes that take :sessionId as a URL param
export const validateSessionIdParam = [
  param("sessionId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Session ID is required"),

  runValidation
];

// ─── User ID param validator ──────────────────────────────────────
export const validateUserIdParam = [
  param("userId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("User ID is required"),

  runValidation
];
