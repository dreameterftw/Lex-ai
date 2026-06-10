import {
  getUnreadCount as getUnreadCountService,
  getUserAlerts,
  markAlertRead as markAlertReadService,
  markAllAlertsRead as markAllAlertsReadService
} from "../services/alertsService.js"
import { apiResult, requireUser } from "../services/firestoreService.js"

export const getAlerts = async () => {
  const user = requireUser()
  return apiResult(await getUserAlerts(user.uid))
}

export const getUnreadCount = async () => {
  const user = requireUser()
  return apiResult(await getUnreadCountService(user.uid))
}

export const markAlertRead = async (alertId) => {
  const user = requireUser()
  return apiResult(await markAlertReadService(alertId, user.uid))
}

export const markAllAlertsRead = async () => {
  const user = requireUser()
  return apiResult(await markAllAlertsReadService(user.uid))
}
