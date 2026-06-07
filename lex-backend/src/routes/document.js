// src/routes/document.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validateDocument } from "../middleware/validateInput.js";
import { analyzeDocument } from "../services/documentService.js";

const router = Router();

router.use(verifyToken);


// POST /api/document/analyze
// Receives extracted text from frontend PDF.js parser
router.post("/analyze",
  aiLimiter,
  validateDocument,
  async (req, res, next) => {
    try {
      const { sessionId, rawText, fileName } = req.body;

      const result = await analyzeDocument(
        sessionId,
        req.user.uid,
        rawText,
        fileName
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
