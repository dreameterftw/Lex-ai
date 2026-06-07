// src/routes/rights.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validateRights } from "../middleware/validateInput.js";
import { identifyRights } from "../services/rightsService.js";

const router = Router();

router.use(verifyToken);


// POST /api/rights/identify
router.post("/identify",
  aiLimiter,
  validateRights,
  async (req, res, next) => {
    try {
      const { sessionId } = req.body;

      const result = await identifyRights(sessionId, req.user.uid);

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
