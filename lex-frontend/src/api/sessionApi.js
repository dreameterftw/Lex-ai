import client from "./client.js"

export const createSession = (jurisdiction) =>
  client.post("/api/session/create", { jurisdiction })

export const getSession = (sessionId) =>
  client.get(`/api/session/${sessionId}`)

export const getAllSessions = () =>
  client.get("/api/session/all")

export const closeSession = (sessionId) =>
  client.put(`/api/session/${sessionId}/close`)
