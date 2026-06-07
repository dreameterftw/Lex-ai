// src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";
import CONSTANTS from "../config/constants.js";

// Custom IP key generator (replaces the deprecated export)
const ipKeyGenerator = (ip) => ip || "unknown";

// ─── Global Limiter ───────────────────────────────────────────────
// Applied to all routes in server.js
export const globalLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMITS.GLOBAL_WINDOW_MS,
  max: CONSTANTS.RATE_LIMITS.GLOBAL_MAX,
  message: {
    error: "Too many requests. Please wait a moment and try again."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.uid || ipKeyGenerator(req.ip);
  }
});

// ─── AI Limiter ───────────────────────────────────────────────────
// Applied specifically to AI-heavy routes
// Prevents Groq free tier abuse
export const aiLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMITS.AI_WINDOW_MS,
  max: CONSTANTS.RATE_LIMITS.AI_MAX,
  message: {
    error: "Too many AI requests. Please wait a moment and try again."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.uid || ipKeyGenerator(req.ip);
  }
});

// ─── Auth Limiter ─────────────────────────────────────────────────
// Applied to login and signup routes
// Prevents brute force attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // 10 auth attempts per window
  message: {
    error: "Too many login attempts. Please wait 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});
