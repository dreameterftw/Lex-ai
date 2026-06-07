// src/routes/courtPrep.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validateSignal,
         validateSessionIdParam }
  from "../middleware/validateInput.js";
import {
  generateCourtPrep,
  getCourtPrep
} from "../services/courtPrepService.js";

const router = Router();

router.use(verifyToken);


// POST /api/court-prep/generate
router.post("/generate",
  aiLimiter,
  validateSignal,
  async (req, res, next) => {
    try {
      const result = await generateCourtPrep(
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


// GET /api/court-prep/:sessionId
router.get("/:sessionId",
  validateSessionIdParam,
  async (req, res, next) => {
    try {
      const result = await getCourtPrep(
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
