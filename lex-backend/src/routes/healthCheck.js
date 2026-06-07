// src/routes/healthCheck.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { body } from "express-validator";
import { runValidation } from "../middleware/validateInput.js";
import {
  runHealthCheck,
  getHealthCheckQuestions,
  getLastHealthCheck
} from "../services/healthCheckService.js";

const router = Router();

router.use(verifyToken);


// GET /api/health-check/questions
// Returns the list of questions to show the user
router.get("/questions", async (req, res, next) => {
  try {
    const questions = getHealthCheckQuestions();

    res.status(200).json({
      success: true,
      data: questions
    });

  } catch (err) {
    next(err);
  }
});


// GET /api/health-check/last
// Returns the user's most recent health check
router.get("/last", async (req, res, next) => {
  try {
    const result = await getLastHealthCheck(req.user.uid);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
});


// POST /api/health-check/run
router.post("/run",
  aiLimiter,
  [
    body("jurisdiction")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Jurisdiction is required"),
    body("answers")
      .isObject()
      .withMessage("Answers must be an object"),
    runValidation
  ],
  async (req, res, next) => {
    try {
      const { jurisdiction, answers } = req.body;

      const result = await runHealthCheck(
        req.user.uid,
        jurisdiction,
        answers
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
