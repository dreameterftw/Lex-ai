import client from "./client.js"

export const sendMessage = (sessionId, message) =>
  client.post("/api/counsel/message", { sessionId, message })

export const getCounselHistory = (sessionId) =>
  client.get(`/api/counsel/history/${sessionId}`)
