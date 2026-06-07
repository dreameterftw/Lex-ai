import client from "./client.js"

export const identifyRights = (sessionId) =>
  client.post("/api/rights/identify", { sessionId })
