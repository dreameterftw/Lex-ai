import client from "./client.js"

export const generateCourtPrep = (sessionId) =>
  client.post("/api/court-prep/generate", { sessionId })

export const getCourtPrep = (sessionId) =>
  client.get(`/api/court-prep/${sessionId}`)
