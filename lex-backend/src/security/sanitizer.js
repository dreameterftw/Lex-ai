// src/security/sanitizer.js

// ─── Strip dangerous characters ───────────────────────────────────
// Removes characters that could break JSON parsing or
// manipulate AI prompt structure
const stripDangerousCharacters = (input) => {
  return input
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove control characters except newlines and tabs
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalise multiple spaces
    .replace(/ {2,}/g, " ")
    // Normalise multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Trim whitespace
    .trim();
};

const stripHtml = (input) => {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
};

const stripScriptCalls = (input) => {
  return input
    .replace(/alert\s*\([^)]*\)/gi, "")
    .replace(/confirm\s*\([^)]*\)/gi, "")
    .replace(/prompt\s*\([^)]*\)/gi, "");
};

const truncate = (input, maxLength) => {
  if (typeof input !== "string") return "";
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength);
};

export const sanitizeInput = (input, maxLength = 2000) => {
  if (typeof input !== "string") return "";

  let cleaned = input;
  cleaned = stripHtml(cleaned);
  cleaned = stripScriptCalls(cleaned);
  cleaned = stripDangerousCharacters(cleaned);
  cleaned = truncate(cleaned, maxLength);

  return cleaned;
};

// ─── Sanitize an entire object's string values ────────────────────
// Useful for sanitizing req.body all at once
export const sanitizeObject = (obj, limits = {}) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      const maxLength = limits[key] || 2000;
      sanitized[key] = sanitizeInput(value, maxLength);
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === "string" ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// ─── Sanitize document text ───────────────────────────────────────
// Less aggressive — preserves legal document formatting
// but still removes dangerous characters
export const sanitizeDocumentText = (text, maxLength = 50000) => {
  if (typeof text !== "string") return "";

  return text
    .replace(/\0/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxLength);
};
