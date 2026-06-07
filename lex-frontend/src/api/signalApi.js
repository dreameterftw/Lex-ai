import client from "./client.js"

export const generateSignal = (sessionId) =>
  client.post("/api/signal/generate", { sessionId })

export const markLetterSent = (sessionId) =>
  client.put(`/api/signal/${sessionId}/sent`)
