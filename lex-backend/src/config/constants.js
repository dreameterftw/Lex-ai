// src/config/constants.js

const CONSTANTS = {

  // Firestore collection names
  COLLECTIONS: {
    USERS: "users",
    SESSIONS: "sessions",
    DOCUMENTS: "documents",
    ALERTS: "alerts",
    LIBRARY: "library"
  },

  // Groq model names
  MODELS: {
    FAST: "llama-3.1-8b-instant",        // simple classification tasks
    POWERFUL: "llama-3.3-70b-versatile"  // complex legal analysis
  },

  // AI generation settings
  AI: {
    TEMPERATURE: 0.3,          // low = more precise, less creative
    MAX_TOKENS: 2048,          // enough for detailed legal analysis
    MAX_TOKENS_COUNSEL: 1024,  // shorter for conversational responses
    MAX_TOKENS_LETTER: 3072    // longer for formal letters
  },

  // Rate limiting
  RATE_LIMITS: {
    GLOBAL_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes
    GLOBAL_MAX: 100,                    // 100 requests per window
    AI_WINDOW_MS: 60 * 1000,           // 1 minute
    AI_MAX: 15                          // 15 AI calls per minute
  },

  // Input limits
  INPUT: {
    SITUATION_MIN: 10,
    SITUATION_MAX: 2000,
    COUNSEL_MIN: 2,
    COUNSEL_MAX: 1000,
    DOCUMENT_MAX_CHARS: 50000  // max chars extracted from PDF
  },

  // Session status values
  SESSION_STATUS: {
    ACTIVE: "active",
    RESOLVED: "resolved",
    ARCHIVED: "archived"
  },

  // Alert types
  ALERT_TYPES: {
    DEADLINE: "deadline",
    LAW_CHANGE: "law_change",
    HEALTH_CHECK: "health_check"
  },

  // Deadline urgency levels
  URGENCY: {
    CRITICAL: "Critical",   // under 7 days
    HIGH: "High",           // 7-14 days
    MEDIUM: "Medium",       // 14-30 days
    LOW: "Low"              // over 30 days
  },

  // Severity levels used across features
  SEVERITY: {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low"
  }

};

export default CONSTANTS;
