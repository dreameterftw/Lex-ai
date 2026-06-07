import client from "./client.js"

export const getTimeline = (sessionId) =>
  client.get(`/api/timeline/${sessionId}`)

export const addTimelineEvent = (sessionId, title, description) =>
  client.post("/api/timeline/event", { sessionId, title, description })
