import CONSTANTS from "./constants.js"

const { FAST, POWERFUL } = CONSTANTS.MODELS

const MODELS = {
  situationFinder: {
    model: FAST,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true
  },
  documentXRay: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true
  },
  rightsNavigator: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true
  },
  deadlineTracker: {
    model: FAST,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true
  },
  signalLetter: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS_LETTER,
    jsonMode: true
  },
  lexCounsel: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS_COUNSEL,
    jsonMode: false
  },
  courtPrep: {
    model: POWERFUL,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true
  },
  healthCheck: {
    model: FAST,
    maxTokens: CONSTANTS.AI.MAX_TOKENS,
    jsonMode: true
  }
}

export default MODELS
