// src/routes/deadlines.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validateRights,
         validateSessionIdParam,
         validateDeadlineTask }
  from "../middleware/validateInput.js";
import {
  calculateDeadlines,
  getDeadlines,
  addCustomDeadline
} from "../services/deadlineService.js";

const router = Router();

router.use(verifyToken);


// POST /api/deadlines/calculate
router.post("/calculate",
  aiLimiter,
  validateRights,
  async (req, res, next) => {
    try {
      const result = await calculateDeadlines(
        req.body.sessionId,
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


// GET /api/deadlines/:sessionId
router.get("/:sessionId",
  validateSessionIdParam,
  async (req, res, next) => {
    try {
      const result = await getDeadlines(
        req.params.sessionId,
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



// POST /api/deadlines/custom
router.post("/custom",
  validateDeadlineTask,
  async (req, res, next) => {
    try {
      const result = await addCustomDeadline(
        req.body.sessionId,
        req.user.uid,
        req.body.name,
        req.body.description,
        req.body.exactDate,
        req.body.actionRequired
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
