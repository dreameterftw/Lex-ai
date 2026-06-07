import client from "./client.js"

export const analyzeDocument = (sessionId, rawText, fileName) =>
  client.post("/api/document/analyze", { sessionId, rawText, fileName })
