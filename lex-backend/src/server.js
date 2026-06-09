// src/server.js

// Disable SSL verification in development
// NEVER use this in production
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Config
import "./config/firebase.js";  // initialise Firebase on startup
import CONSTANTS from "./config/constants.js";

// Middleware
import { globalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import sessionRoutes from "./routes/session.js";
import situationRoutes from "./routes/situation.js";
import documentRoutes from "./routes/document.js";
import rightsRoutes from "./routes/rights.js";
import deadlinesRoutes from "./routes/deadlines.js";
import counselRoutes from "./routes/counsel.js";
import signalRoutes from "./routes/signal.js";
import timelineRoutes from "./routes/timeline.js";
import courtPrepRoutes from "./routes/courtPrep.js";
import healthCheckRoutes from "./routes/healthCheck.js";
import alertsRoutes from "./routes/alerts.js";
import outcomeRoutes from "./routes/outcome.js";
import libraryRoutes from "./routes/library.js";
import contactRoutes from "./routes/contact.js";

dotenv.config();

// Production safety check — ensure SSL is never disabled in production
if (process.env.NODE_ENV === "production" && process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
  throw new Error("NODE_TLS_REJECT_UNAUTHORIZED cannot be 0 in production");
}

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ───────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — only allow our frontend
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.FRONTEND_URL,
      "https://lex-app.web.app",
      "https://lex-app.firebaseapp.com",
      "https://lex-ai-gg.web.app",
      "https://lex-ai-gg.firebaseapp.com"
    ].filter(Boolean);

    const isLocalVite = /^http:\/\/(localhost|127\.0\.0\.1):517\d$/.test(origin || "");

    if (!origin || allowedOrigins.includes(origin) || isLocalVite) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Global rate limiter — applied to all routes
app.use(globalLimiter);

// ─── Health Check ────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Lex backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ─── Feature Routes ──────────────────────────────────────────────

app.use("/api/session", sessionRoutes);
app.use("/api/situation", situationRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/rights", rightsRoutes);
app.use("/api/deadlines", deadlinesRoutes);
app.use("/api/counsel", counselRoutes);
app.use("/api/signal", signalRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/court-prep", courtPrepRoutes);
app.use("/api/health-check", healthCheckRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/outcome", outcomeRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/contact", contactRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

// ─── Global Error Handler ────────────────────────────────────────

app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n Lex backend running`);
  console.log(` Port     : ${PORT}`);
  console.log(` Mode     : ${process.env.NODE_ENV}`);
  console.log(` Health   : http://localhost:${PORT}/api/health\n`);
});

export default app;
