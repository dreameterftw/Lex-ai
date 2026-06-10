const CONSTANTS = {
  COLLECTIONS: {
    USERS: "users",
    SESSIONS: "sessions",
    DOCUMENTS: "documents",
    ALERTS: "alerts",
    LIBRARY: "library"
  },
  MODELS: {
    FAST: "llama-3.1-8b-instant",
    POWERFUL: "llama-3.3-70b-versatile"
  },
  AI: {
    TEMPERATURE: 0.3,
    MAX_TOKENS: 2048,
    MAX_TOKENS_COUNSEL: 1024,
    MAX_TOKENS_LETTER: 3072
  },
  INPUT: {
    SITUATION_MIN: 10,
    SITUATION_MAX: 2000,
    COUNSEL_MIN: 2,
    COUNSEL_MAX: 1000,
    DOCUMENT_MAX_CHARS: 50000
  },
  SESSION_STATUS: {
    ACTIVE: "active",
    RESOLVED: "resolved",
    ARCHIVED: "archived"
  },
  ALERT_TYPES: {
    DEADLINE: "deadline",
    LAW_CHANGE: "law_change",
    HEALTH_CHECK: "health_check"
  }
}

export default CONSTANTS
