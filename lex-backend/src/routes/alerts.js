// src/routes/alerts.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { param } from "express-validator";
import { runValidation } from "../middleware/validateInput.js";
import {
  getUserAlerts,
  getUnreadCount,
  markAlertRead,
  markAllAlertsRead
} from "../services/alertsService.js";

const router = Router();

router.use(verifyToken);


// GET /api/alerts
// Returns all alerts for the authenticated user
router.get("/", async (req, res, next) => {
  try {
    const alerts = await getUserAlerts(req.user.uid);

    res.status(200).json({
      success: true,
      data: alerts
    });

  } catch (err) {
    next(err);
  }
});


// GET /api/alerts/unread
// Returns count of unread alerts
// Must come BEFORE /:alertId route to avoid conflict
router.get("/unread", async (req, res, next) => {
  try {
    const result = await getUnreadCount(req.user.uid);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
});


// PUT /api/alerts/read-all
// Marks all alerts as read
// Must come BEFORE /:alertId route to avoid conflict
router.put("/read-all", async (req, res, next) => {
  try {
    const result = await markAllAlertsRead(req.user.uid);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
});


// PUT /api/alerts/:alertId/read
// Marks a single alert as read
router.put("/:alertId/read",
  [
    param("alertId")
      .isString()
      .notEmpty()
      .withMessage("Alert ID is required"),
    runValidation
  ],
  async (req, res, next) => {
    try {
      const result = await markAlertRead(
        req.params.alertId,
        req.user.uid
      );

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (err) {
      next(err);
    }
  }
);

export default router;
