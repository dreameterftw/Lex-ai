// src/middleware/verifyToken.js
import { auth } from "../config/firebase.js";
import { createError } from "./errorHandler.js";

export const verifyToken = async (req, res, next) => {

  try {
    // Check Authorization header exists
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(
        "No authentication token provided.",
        401
      ));
    }

    // Extract token from "Bearer "
    const token = authHeader.split("Bearer ")[1];

    if (!token || token.trim() === "") {
      return next(createError(
        "Authentication token is empty.",
        401
      ));
    }

    // Verify token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request for use in routes
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();

  } catch (err) {
    // Pass Firebase auth errors to error handler
    next(err);
  }
};
