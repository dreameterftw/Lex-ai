// src/middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {

  // Log the full error internally
  console.error(`
[ERROR] ${new Date().toISOString()}`);
  console.error(`Route  : ${req.method} ${req.originalUrl}`);
  console.error(`Message: ${err.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(`Stack  : ${err.stack}`);
  }

  // Never expose internal error details to the client
  // Map known error types to clean responses

  // Firebase auth errors
  if (err.code === "auth/id-token-expired") {
    return res.status(401).json({
      error: "Session expired. Please log in again."
    });
  }

  if (err.code === "auth/invalid-id-token") {
    return res.status(401).json({
      error: "Invalid session. Please log in again."
    });
  }

  // Firestore errors
  if (err.code === "5") {
    return res.status(404).json({
      error: "Requested resource not found."
    });
  }

  // Groq rate limit
  if (err.status === 429) {
    return res.status(429).json({
      error: "AI service is busy. Please wait a moment and try again."
    });
  }

  // Groq service unavailable
  if (err.status === 503) {
    return res.status(503).json({
      error: "AI service temporarily unavailable. Please try again shortly."
    });
  }

  // Validation errors from express-validator
  if (err.type === "validation") {
    return res.status(400).json({
      error: "Invalid input.",
      details: err.details
    });
  }

  // JSON parse errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON in request body."
    });
  }

  // Default — never expose stack trace in production
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "development"
    ? err.message
    : "Something went wrong. Please try again.";

  res.status(statusCode).json({ error: message });
};

// Helper — create consistent error objects throughout the app
export const createError = (message, status = 500, extra = {}) => {
  const err = new Error(message);
  err.status = status;
  Object.assign(err, extra);
  return err;
};
