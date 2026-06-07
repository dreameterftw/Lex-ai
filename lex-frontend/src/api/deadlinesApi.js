import client from "./client.js"

export const calculateDeadlines = (sessionId) =>
  client.post("/api/deadlines/calculate", { sessionId })

export const getDeadlines = (sessionId) =>
  client.get(`/api/deadlines/${sessionId}`)

export const createDeadline = (sessionId, name, exactDate, actionRequired, description) =>
  client.post("/api/deadlines/custom", { sessionId, name, exactDate, actionRequired, description })
