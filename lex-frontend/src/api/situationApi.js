import client from "./client.js"

export const analyzeSituation = (sessionId, description, jurisdiction) =>
  client.post("/api/situation/analyze", { sessionId, description, jurisdiction })
