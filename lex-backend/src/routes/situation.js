// src/routes/situation.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validateSituation } from "../middleware/validateInput.js";
import { analyzeSituation } from "../services/situationService.js";

const router = Router();

router.use(verifyToken);


// POST /api/situation/analyze
router.post("/analyze",
  aiLimiter,
  validateSituation,
  async (req, res, next) => {
    try {
      const { sessionId, description, jurisdiction } = req.body;

      const result = await analyzeSituation(
        sessionId,
        req.user.uid,
        description,
        jurisdiction
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
