// src/ai/models.js
import CONSTANTS from "../config/constants.js";

const { FAST, POWERFUL } = CONSTANTS.MODELS;

// Maps each feature to its model and token limit
// POWERFUL = llama-3.3-70b-versatile  (complex legal analysis)
// FAST     = llama-3.1-8b-instant     (simple classification)

const MODELS = {

  situationFinder: {
    model: FAST,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true,
    description: "Classifies legal situation type and severity"
  },

  documentXRay: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true,
    description: "Analyzes legal document clauses"
  },

  rightsNavigator: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true,
    description: "Identifies applicable legal rights"
  },

  deadlineTracker: {
    model: FAST,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true,
    description: "Calculates legal deadlines"
  },

  signalLetter: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS_LETTER,
    jsonMode: true,
    description: "Generates formal rights assertion letter"
  },

  lexCounsel: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS_COUNSEL,
    jsonMode: false,
    description: "Contextual legal conversation"
  },

  courtPrep: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true,
    description: "Generates court preparation brief"
  },

  healthCheck: {
    model: FAST,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true,
    description: "Audits user legal exposure"
  },

  librarySearch: {
    model: FAST,
    maxTokens: 512,
    jsonMode: true,
    description: "Matches library articles to query"
  }

};

export default MODELS;
