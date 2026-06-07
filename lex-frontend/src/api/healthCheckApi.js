import client from "./client.js"

export const getQuestions = () =>
  client.get("/api/health-check/questions")

export const runHealthCheck = (jurisdiction, answers) =>
  client.post("/api/health-check/run", { jurisdiction, answers })

export const getHealthCheckHistory = () =>
  client.get("/api/health-check/history")

export const getLastHealthCheck = () =>
  client.get("/api/health-check/last")
