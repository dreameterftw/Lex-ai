import client from "./client.js"

export const recordOutcome = (sessionId, outcome, decidingFactor) =>
  client.post("/api/outcome/record", { sessionId, outcome, decidingFactor })

export const getOutcome = (sessionId) =>
  client.get(`/api/outcome/${sessionId}`)
