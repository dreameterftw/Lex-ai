// src/services/alertsService.js
import { db } from "../config/firebase.js";
import CONSTANTS from "../config/constants.js";
import { createError } from "../middleware/errorHandler.js";

// ─── Get all alerts for a user ────────────────────────────────────
export const getUserAlerts = async (userId) => {
  try {
    const snapshot = await db
      .collection(CONSTANTS.COLLECTIONS.ALERTS)
      .where("userId", "==", userId)
      .limit(50)
      .get();

    const alerts = [];
    snapshot.forEach(doc => {
      alerts.push({
        alertId: doc.id,
        ...doc.data()
      });
    });

    // Sort by createdAt descending in-memory
    alerts.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return alerts;

  } catch (err) {
    console.error("[ALERTS] getUserAlerts error:", err.message);
    throw createError("Failed to retrieve alerts.", 500);
  }
};


// ─── Get unread alert count ───────────────────────────────────────
export const getUnreadCount = async (userId) => {
  try {
    const snapshot = await db
      .collection(CONSTANTS.COLLECTIONS.ALERTS)
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    return { unreadCount: snapshot.size };

  } catch (err) {
    throw createError("Failed to get unread count.", 500);
  }
};


// ─── Mark alert as read ───────────────────────────────────────────
export const markAlertRead = async (alertId, userId) => {
  try {
    const alertRef = db
      .collection(CONSTANTS.COLLECTIONS.ALERTS)
      .doc(alertId);

    const alertDoc = await alertRef.get();

    if (!alertDoc.exists) {
      throw createError("Alert not found.", 404);
    }

    // Security — verify alert belongs to user
    if (alertDoc.data().userId !== userId) {
      throw createError("Unauthorised access to alert.", 403);
    }

    await alertRef.update({
      read: true,
      readAt: new Date().toISOString()
    });

    return { success: true };

  } catch (err) {
    if (err.status) throw err;
    throw createError("Failed to mark alert as read.", 500);
  }
};


// ─── Mark all alerts as read ──────────────────────────────────────
export const markAllAlertsRead = async (userId) => {
  try {
    const snapshot = await db
      .collection(CONSTANTS.COLLECTIONS.ALERTS)
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    // Batch update for efficiency
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString()
      });
    });

    await batch.commit();

    return {
      success: true,
      markedRead: snapshot.size
    };

  } catch (err) {
    throw createError("Failed to mark alerts as read.", 500);
  }
};


// ─── Create a plain law alert ─────────────────────────────────────
// Called internally when a law change affects a user's jurisdiction
export const createLawAlert = async (
  userId,
  title,
  message,
  affectedArea,
  jurisdiction
) => {
  try {
    const alertRef = await db
      .collection(CONSTANTS.COLLECTIONS.ALERTS)
      .add({
        userId,
        type: CONSTANTS.ALERT_TYPES.LAW_CHANGE,
        content: {
          title,
          message,
          affectedArea,
          jurisdiction
        },
        read: false,
        createdAt: new Date().toISOString()
      });

    return { alertId: alertRef.id, success: true };

  } catch (err) {
    throw createError("Failed to create alert.", 500);
  }
};


// ─── Create a deadline alert ──────────────────────────────────────
// Called by deadline tracker for approaching deadlines
export const createDeadlineAlert = async (
  userId,
  sessionId,
  deadlineName,
  daysRemaining,
  consequence
) => {
  try {
    const alertRef = await db
      .collection(CONSTANTS.COLLECTIONS.ALERTS)
      .add({
        userId,
        sessionId,
        type: CONSTANTS.ALERT_TYPES.DEADLINE,
        content: {
          title: `Deadline approaching: ${deadlineName}`,
          message: `${daysRemaining} days remaining`,
          consequence,
          daysRemaining
        },
        read: false,
        createdAt: new Date().toISOString()
      });

    return { alertId: alertRef.id, success: true };

  } catch (err) {
    throw createError("Failed to create deadline alert.", 500);
  }
};
