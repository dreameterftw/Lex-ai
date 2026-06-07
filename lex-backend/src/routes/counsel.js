// src/routes/counsel.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validateCounsel,
         validateSessionIdParam }
  from "../middleware/validateInput.js";
import {
  sendCounselMessage,
  getCounselHistory
} from "../services/counselService.js";

const router = Router();

router.use(verifyToken);


// POST /api/counsel/message
router.post("/message",
  aiLimiter,
  validateCounsel,
  async (req, res, next) => {
    try {
      const { sessionId, message } = req.body;

      const result = await sendCounselMessage(
        sessionId,
        req.user.uid,
        message
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


// GET /api/counsel/history/:sessionId
router.get("/history/:sessionId",
  validateSessionIdParam,
  async (req, res, next) => {
    try {
      const history = await getCounselHistory(
        req.params.sessionId,
        req.user.uid
      );

      res.status(200).json({
        success: true,
        data: history
      });

    } catch (err) {
      next(err);
    }
  }
);

export default router;
