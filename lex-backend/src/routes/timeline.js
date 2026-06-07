// src/routes/timeline.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateSessionIdParam } from "../middleware/validateInput.js";
import { body } from "express-validator";
import { runValidation } from "../middleware/validateInput.js";
import {
  getTimeline,
  addManualEvent
} from "../services/timelineService.js";

const router = Router();

router.use(verifyToken);


// GET /api/timeline/:sessionId
router.get("/:sessionId",
  validateSessionIdParam,
  async (req, res, next) => {
    try {
      const events = await getTimeline(
        req.params.sessionId,
        req.user.uid
      );

      res.status(200).json({
        success: true,
        data: events
      });

    } catch (err) {
      next(err);
    }
  }
);


// POST /api/timeline/event
// Add a manual event to the timeline
router.post("/event",
  [
    body("sessionId").isString().notEmpty(),
    body("title").isString().trim().isLength({ min: 2, max: 200 }),
    body("description").isString().trim().isLength({ min: 2, max: 500 }),
    runValidation
  ],
  async (req, res, next) => {
    try {
      const { sessionId, title, description } = req.body;

      const event = await addManualEvent(
        sessionId,
        req.user.uid,
        title,
        description
      );

      res.status(201).json({
        success: true,
        data: event
      });

    } catch (err) {
      next(err);
    }
  }
);

export default router;
