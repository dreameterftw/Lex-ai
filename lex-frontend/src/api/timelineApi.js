import { apiResult, appendToTimeline, getSession, requireUser } from "../services/firestoreService.js"

export const getTimeline = async (sessionId) => {
  const user = requireUser()
  const session = await getSession(sessionId, user.uid)
  return apiResult(session.context.timeline?.events || [])
}

export const addTimelineEvent = async (sessionId, title, description) => {
  const user = requireUser()
  const event = await appendToTimeline(sessionId, user.uid, {
    type: "manual",
    title,
    description,
    addedBy: "user"
  })
  return apiResult(event)
}
