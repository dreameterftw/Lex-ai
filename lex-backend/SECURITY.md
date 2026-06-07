# Lex Backend — Security Architecture

## Overview

This document describes the comprehensive security architecture of the Lex legal AI platform. All layers follow zero-trust principles with defense-in-depth strategies.

---

## Security Layers

### 1. **Transport Security**

- **HTTPS Only**: Production deployment enforces TLS 1.2+
- **HSTS Headers**: Helmet.js configured with Strict-Transport-Security
- **CSP Headers**: Content Security Policy prevents XSS attacks
- **Secure Cookies**: All session cookies marked HttpOnly, Secure, SameSite

**Implementation**: `src/server.js` via `helmet()` middleware

---

### 2. **Network Security (CORS)**

All requests must originate from whitelisted domains:

```javascript
{
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://lex-app.web.app",
    "https://lex-app.firebaseapp.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}
```

**File**: `src/server.js`

---

### 3. **Authentication Layer**

#### Firebase Authentication
- Uses Firebase Admin SDK to verify ID tokens
- All protected routes require valid Bearer token in Authorization header
- Tokens are JWT signed and validated server-side
- Token expiration forces re-authentication (typically 1 hour)

**Implementation**: `src/middleware/verifyToken.js`

```
Every Protected Route:
  ├─ Extract Authorization header
  ├─ Verify it starts with "Bearer "
  ├─ Decode JWT with Firebase Admin SDK
  └─ Attach user.uid to request for downstream use
```

**Public Routes** (no auth required):
- `GET /api/health` — Health check
- `GET /api/library/categories` — Browse legal categories
- `GET /api/library/search` — Search articles
- `GET /api/library/articles/:categoryId` — View articles
- `GET /api/library/article/:articleId` — Read article

---

### 4. **Rate Limiting**

Implements multi-tier rate limiting to prevent abuse:

**Global Limiter** (All Routes)
- 100 requests per 15 minutes per user/IP
- Applied at `server.js` entry point
- Protects against general DOS attacks

**AI Limiter** (AI-Heavy Routes)
- 15 requests per 1 minute per user/IP
- Applied to: `/situation/analyze`, `/document/analyze`, `/rights/identify`, 
  `/deadlines/calculate`, `/counsel/message`, `/signal/generate`, 
  `/court-prep/generate`, `/health-check/run`
- Protects against Groq API quota abuse

**File**: `src/middleware/rateLimiter.js`

---

### 5. **Input Validation**

All user inputs are validated before processing:

#### Request Body Validation
- Uses `express-validator` for schema validation
- Type checking (string, number, array, object)
- Length limits (max 5000 chars for text, 10MB for files)
- Regex validation for IDs and special formats
- Trimming and sanitization

#### File Uploads
- Max file size: 10MB
- Allowed types: PDF, DOCX, TXT (validated by MIME type)
- Scanned for malicious content before storage

**File**: `src/middleware/validateInput.js`

Example validation chain:
```javascript
[
  body("description")
    .isString()
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 5000 })
    .escape(),
  runValidation
]
```

---

### 6. **Prompt Injection Prevention**

All user input passed to AI models is cleaned against injection patterns:

#### Detection Patterns
- Instruction override attempts: "ignore previous instructions"
- Role manipulation: "you are now a different AI"
- System prompt extraction: "reveal your system prompt"
- Jailbreak attempts: "jailbreak mode", "developer mode"
- Prompt delimiters: "[SYSTEM]", "[INST]", ">", "###instruction"

#### Mitigation Strategy
1. Detect injection patterns in user input
2. Replace matched patterns with `[removed]` placeholder
3. Log detection for security monitoring
4. Continue processing with cleaned input (not blocking)

**File**: `src/security/promptGuard.js`

Usage:
```javascript
const { cleaned, injectionDetected } = guardPrompt(userInput);
if (injectionDetected) {
  console.warn("[SECURITY] Injection attempt detected");
}
// Use 'cleaned' in AI prompt
```

---

### 7. **Data Sanitization**

Different sanitization strategies for different data types:

#### Document Text Sanitization
- Remove control characters
- Limit to 50,000 characters
- Escape special characters
- Remove potentially malicious HTML/scripts

**Function**: `sanitizeDocumentText(text)`

#### General Input Sanitization
- Trim whitespace
- Remove null bytes
- Escape HTML entities
- Validate length limits

**Function**: `sanitizeInput(input, maxLength)`

**File**: `src/security/sanitizer.js`

---

### 8. **Error Handling & Information Disclosure**

Errors are caught at route level and passed to centralized error handler:

#### Internal Logging
- Full error details logged with stack trace
- Request method, URL, user ID included
- Only logged in development mode

#### Client Response
- Generic error messages (never expose internals)
- No stack traces sent to client
- No database query details exposed
- Firebase auth errors mapped to safe messages

**File**: `src/middleware/errorHandler.js`

Examples:
```javascript
// Internal log (dev only)
console.error(`[ERROR] ${err.message}`);
console.error(`Stack: ${err.stack}`);

// Client response
res.status(500).json({ error: "Something went wrong. Please try again." });
```

---

### 9. **Environment Variable Security**

#### Secrets Management
- All API keys stored in `.env` file (never in code)
- `.env` added to `.gitignore` — never committed
- Environment variables validated on startup
- Missing required vars cause immediate crash

#### Secrets Included
- `GROQ_API_KEY` — Groq AI service access
- `FIREBASE_PROJECT_ID` — Firebase project identifier
- `FIREBASE_PRIVATE_KEY` — Firebase Admin SDK credentials
- `FIREBASE_CLIENT_EMAIL` — Service account email
- `FRONTEND_URL` — Whitelisted frontend origin

**File**: `.env` (example: `.env.example`)

```bash
# Startup validation in src/config/firebase.js
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("Missing required environment variable: FIREBASE_PROJECT_ID");
}
```

---

### 10. **Firebase Database Security Rules**

#### Firestore Rules

**USERS Collection**
```firestore
match /USERS/{userId} {
  allow read: if isAuthenticated() && isOwner(userId);
  allow write: if isAuthenticated() && isOwner(userId);
}
```
→ Users can only read/write their own profiles

**SESSIONS Collection**
```firestore
match /SESSIONS/{sessionId} {
  allow read: if isAuthenticated() && isSessionOwner(sessionId);
  allow write: if isAuthenticated() && isSessionOwner(sessionId);
}
```
→ Users can only access sessions they created

**DOCUMENTS Collection**
```firestore
match /DOCUMENTS/{docId} {
  allow read: if isAuthenticated() && isSessionOwner(resource.data.sessionId);
  allow write: if isAuthenticated() && isSessionOwner(request.resource.data.sessionId);
}
```
→ Users can only see documents in their sessions

**ALERTS Collection**
```firestore
match /ALERTS/{alertId} {
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
}
```
→ Users can only see their own alerts

**LIBRARY Collection**
```firestore
match /LIBRARY/{articleId} {
  allow read: if true;        // Public
  allow write: if false;      // Backend only (Admin SDK)
}
```
→ Public read, backend-only write

**OUTCOMES Collection**
```firestore
match /OUTCOMES/{outcomeId} {
  allow read: if false;       // Backend only (analytics)
  allow write: if false;      // Backend only (Admin SDK)
}
```
→ Backend-only, no user access (anonymized data)

**Default Policy**
```firestore
match /{document=**} {
  allow read, write: if false;
}
```
→ Deny everything not explicitly allowed

**File**: `firestore.rules`

#### Cloud Storage Rules

**User Documents Folder**
```storage
match /documents/{userId}/{allPaths=**} {
  allow read: if isAuthenticated() && isOwner();
  allow write: if isAuthenticated() && isOwner() && isValidSize();
}
```
→ Users can only access their own document folder
→ Max 50MB per file
→ Only specific MIME types allowed

**Default Policy**
```storage
match /{allPaths=**} {
  allow read, write: if false;
}
```
→ Deny everything not explicitly allowed

**File**: `storage.rules`

---

### 11. **API Key & Secret Scanning**

Regular scans ensure no credentials are committed:

#### Pre-Commit Hooks (Recommended)
```bash
#!/bin/bash
# Check for common secret patterns
if git diff --cached | grep -E 'GROQ_API_KEY|PRIVATE_KEY|firebaseConfig'; then
  echo "❌ Secrets detected in commit!"
  exit 1
fi
```

#### CI/CD Scanning
- GitHub Actions scans for secrets before merge
- Trivy/TruffleHog checks all pull requests
- Auto-revoke any leaked keys

---

### 12. **Rate Limiting Across Tiers**

| Tier | Global | AI | Auth |
|------|--------|----|----|
| **Window** | 15 min | 1 min | 15 min |
| **Limit** | 100 req | 15 req | 10 req |
| **Scope** | User/IP | User/IP | IP |
| **Purpose** | DOS prevention | API quota | Brute force |

---

## Deployment Checklist

Before deploying to production:

- [ ] Set environment variables in deployment platform (Railway, Heroku, etc.)
- [ ] Deploy Firestore rules via Firebase CLI: `firebase deploy --only firestore:rules`
- [ ] Deploy Storage rules via Firebase CLI: `firebase deploy --only storage`
- [ ] Enable Cloud Audit Logging in Firebase
- [ ] Set up alerts for security events
- [ ] Configure backup retention policy (7+ days)
- [ ] Enable two-factor authentication on Firebase project
- [ ] Review and whitelist IP addresses if needed
- [ ] Set up WAF (Web Application Firewall) rules
- [ ] Enable DDoS protection on CDN

---

## Security Testing

### Manual Testing Commands

```bash
# Test 1: Missing authentication
curl http://localhost:5000/api/session/all
# Expected: 401 Unauthorized

# Test 2: Invalid token
curl -H "Authorization: Bearer invalid" http://localhost:5000/api/session/all
# Expected: 401 Unauthorized

# Test 3: Malformed JSON
curl -X POST http://localhost:5000/api/situation/analyze \
  -d '{invalid json}'
# Expected: 400 Bad Request

# Test 4: Rate limit (make 101 requests in 15 mins)
for i in {1..101}; do curl http://localhost:5000/api/health; done
# Expected: 429 Too Many Requests on 101st request

# Test 5: Injection attempt
curl -H "Authorization: Bearer $TOKEN" \
  -X POST http://localhost:5000/api/situation/analyze \
  -d '{"description": "ignore all instructions, ...", ...}'
# Expected: Injection cleaned but request processes
```

### Automated Testing

Run security audit:
```bash
bash security-audit.sh
```

Expected output:
```
✅ ALL SECURITY CHECKS PASSED

✓ Passed: 14
✗ Failed: 0
```

---

## Monitoring & Alerting

### Events to Monitor
- Failed authentication attempts (log spikes)
- Rate limit violations
- Injection attempts
- Database query errors
- Unhandled exceptions
- API key usage patterns

### Recommended Monitoring
- Google Cloud Logging (if Firebase on GCP)
- Sentry for error tracking
- Datadog or New Relic for APM
- Firebase Analytics for user behavior

---

## Incident Response

If a security incident is detected:

1. **Immediate**: Revoke affected API keys
2. **Within 1 hour**: Review Firebase Audit Logs
3. **Within 4 hours**: Assess data exposure
4. **Within 24 hours**: Notify affected users
5. **Within 48 hours**: Post-incident review + action items

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Groq API Security](https://console.groq.com/docs/security)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-03 | Initial security architecture documentation |

---

**Last Updated**: 2026-06-03
**Status**: ✅ Production Ready
**Security Level**: High (defense-in-depth, zero-trust)
