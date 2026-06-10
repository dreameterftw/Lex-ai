import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore"
import { db } from "../firebase/firebase.js"
import CONSTANTS from "./ai/constants.js"

export const getUserAlerts = async (userId) => {
  const alertsQuery = query(
    collection(db, CONSTANTS.COLLECTIONS.ALERTS),
    where("userId", "==", userId)
  )
  const snapshot = await getDocs(alertsQuery)

  return snapshot.docs
    .map((alertDoc) => ({ alertId: alertDoc.id, ...alertDoc.data() }))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 50)
}

export const getUnreadCount = async (userId) => {
  const unreadQuery = query(
    collection(db, CONSTANTS.COLLECTIONS.ALERTS),
    where("userId", "==", userId),
    where("read", "==", false)
  )
  const snapshot = await getDocs(unreadQuery)
  return { unreadCount: snapshot.size }
}

export const markAlertRead = async (alertId, userId) => {
  const alertRef = doc(db, CONSTANTS.COLLECTIONS.ALERTS, alertId)
  const alertDoc = await getDoc(alertRef)
  if (!alertDoc.exists()) throw new Error("Alert not found.")
  if (alertDoc.data().userId !== userId) throw new Error("Unauthorised access to alert.")

  await updateDoc(alertRef, {
    read: true,
    readAt: new Date().toISOString()
  })

  return { success: true }
}

export const markAllAlertsRead = async (userId) => {
  const unreadQuery = query(
    collection(db, CONSTANTS.COLLECTIONS.ALERTS),
    where("userId", "==", userId),
    where("read", "==", false)
  )
  const snapshot = await getDocs(unreadQuery)
  const batch = writeBatch(db)
  const readAt = new Date().toISOString()

  snapshot.forEach((alertDoc) => {
    batch.update(alertDoc.ref, { read: true, readAt })
  })

  await batch.commit()
  return { success: true, markedRead: snapshot.size }
}
