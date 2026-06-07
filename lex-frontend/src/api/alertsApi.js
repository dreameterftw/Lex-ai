import client from "./client.js"

export const getAlerts = () =>
  client.get("/api/alerts")

export const getUnreadCount = () =>
  client.get("/api/alerts/unread")

export const markAlertRead = (alertId) =>
  client.put(`/api/alerts/${alertId}/read`)

export const markAllAlertsRead = () =>
  client.put("/api/alerts/read-all")
