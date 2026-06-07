// src/config/groq.js
import Groq from "groq-sdk";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

// Validate API key exists before initialising
if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing required environment variable: GROQ_API_KEY");
}

// Initialise Groq client with custom fetch for SSL handling in dev
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  fetch: process.env.NODE_ENV !== "production" && process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0"
    ? (url, init) => {
        return fetch(url, {
          ...init,
          agent: new https.Agent({ rejectUnauthorized: false })
        });
      }
    : undefined
});

export default groq;
