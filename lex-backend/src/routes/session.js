// src/routes/session.js
import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateCreateSession,
         validateSessionIdParam }
  from "../middleware/validateInput.js";
import {
  createNewSession,
  getSession,
  getAllSessions,
  closeSession,
  ensureUserProfile
} from "../services/sessionService.js";

const router = Router();

// All session routes require authentication
router.use(verifyToken);


// POST /api/session/create
// Creates a new legal session
router.post("/create", validateCreateSession, async (req, res, next) => {
  try {
    const { jurisdiction } = req.body;
    const { uid, email } = req.user;

    // Ensure user profile exists in Firestore
    await ensureUserProfile(uid, email, jurisdiction);

    const session = await createNewSession(uid, jurisdiction);

    res.status(201).json({
      success: true,
      data: session
    });

  } catch (err) {
    next(err);
  }
});


// GET /api/session/all
// Returns all sessions for the authenticated user
router.get("/all", async (req, res, next) => {
  try {
    const sessions = await getAllSessions(req.user.uid);

    res.status(200).json({
      success: true,
      data: sessions
    });

  } catch (err) {
    next(err);
  }
});


// GET /api/session/:sessionId
// Returns a single session with full context
router.get("/:sessionId",
  validateSessionIdParam,
  async (req, res, next) => {
    try {
      const session = await getSession(
        req.params.sessionId,
        req.user.uid
      );

      res.status(200).json({
        success: true,
        data: session
      });

    } catch (err) {
      next(err);
    }
  }
);


// PUT /api/session/:sessionId/close
// Marks a session as resolved
router.put("/:sessionId/close",
  validateSessionIdParam,
  async (req, res, next) => {
    try {
      const result = await closeSession(
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
