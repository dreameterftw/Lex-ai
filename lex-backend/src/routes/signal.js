// src/routes/signal.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validateSignal,
         validateSessionIdParam }
  from "../middleware/validateInput.js";
import {
  generateSignalLetter,
  markLetterSent
} from "../services/signalService.js";

const router = Router();

router.use(verifyToken);


// POST /api/signal/generate
router.post("/generate",
  aiLimiter,
  validateSignal,
  async (req, res, next) => {
    try {
      const result = await generateSignalLetter(
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


// PUT /api/signal/:sessionId/sent
router.put("/:sessionId/sent",
  validateSessionIdParam,
  async (req, res, next) => {
    try {
      const result = await markLetterSent(
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

export default router;
