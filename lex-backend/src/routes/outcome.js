// src/routes/outcome.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateOutcome,
         validateSessionIdParam }
  from "../middleware/validateInput.js";
import {
  recordOutcome,
  getOutcome
} from "../services/outcomeService.js";

const router = Router();

router.use(verifyToken);


// POST /api/outcome/record
router.post("/record",
  validateOutcome,
  async (req, res, next) => {
    try {
      const { sessionId, outcome, decidingFactor } = req.body;

      const result = await recordOutcome(
        sessionId,
        req.user.uid,
        outcome,
        decidingFactor || null
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


// GET /api/outcome/:sessionId
router.get("/:sessionId",
  validateSessionIdParam,
  async (req, res, next) => {
    try {
      const result = await getOutcome(
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
