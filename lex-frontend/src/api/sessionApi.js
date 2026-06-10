import {
  apiResult,
  closeSession as closeSessionService,
  createSession as createSessionService,
  getAllSessions as getAllSessionsService,
  getSession as getSessionService,
  requireUser
} from "../services/firestoreService.js"

export const createSession = async (jurisdiction) => {
  const user = requireUser()
  return apiResult(await createSessionService(user.uid, jurisdiction))
}

export const getSession = async (sessionId) => {
  const user = requireUser()
  return apiResult(await getSessionService(sessionId, user.uid))
}

export const getAllSessions = async () => {
  const user = requireUser()
  return apiResult(await getAllSessionsService(user.uid))
}

export const closeSession = async (sessionId) => {
  const user = requireUser()
  return apiResult(await closeSessionService(sessionId, user.uid))
}
