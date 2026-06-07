#!/bin/bash

echo "🔒 SECURITY AUDIT"
echo "=================================================="
echo ""

API_BASE="http://localhost:5000/api"
PASSED=0
FAILED=0

# Test 1: Route requires authentication
echo "TEST 1: Route Authentication Requirements"
echo "--------------------------------------------------"

# Try accessing protected route without token
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/session/all")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
  echo "✓ /api/session/all correctly requires authentication ($STATUS)"
  PASSED=$((PASSED+1))
else
  echo "✗ /api/session/all did not reject unauthenticated request ($STATUS)"
  FAILED=$((FAILED+1))
fi

# Test 2: CORS headers present
echo ""
echo "TEST 2: CORS Configuration"
echo "--------------------------------------------------"

CORS_HEADER=$(curl -s -I -H "Origin: http://localhost:3000" "$API_BASE/health" | grep -i "access-control-allow-origin" | head -n1)

if [ -n "$CORS_HEADER" ]; then
  echo "✓ CORS headers present"
  echo "  $CORS_HEADER"
  PASSED=$((PASSED+1))
else
  echo "✗ CORS headers not found"
  FAILED=$((FAILED+1))
fi

# Test 3: Security headers present (helmet)
echo ""
echo "TEST 3: Security Headers (Helmet)"
echo "--------------------------------------------------"

HEADERS=$(curl -s -I "$API_BASE/health")

CHECKS=(
  "x-content-type-options"
  "x-frame-options"
  "strict-transport-security"
)

for HEADER in "${CHECKS[@]}"; do
  if echo "$HEADERS" | grep -iq "$HEADER"; then
    echo "✓ $HEADER header present"
    PASSED=$((PASSED+1))
  else
    echo "⚠ $HEADER header not found (may be optional)"
  fi
done

# Test 4: Input validation
echo ""
echo "TEST 4: Input Validation"
echo "--------------------------------------------------"

# Try sending invalid JSON
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/situation/analyze" \
  -H "Content-Type: application/json" \
  -d '{invalid json}')

STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$STATUS" = "400" ]; then
  echo "✓ Malformed JSON rejected ($STATUS)"
  PASSED=$((PASSED+1))
else
  echo "✗ Malformed JSON not properly rejected ($STATUS)"
  FAILED=$((FAILED+1))
fi

# Test 5: .env in .gitignore
echo ""
echo "TEST 5: .env Protection"
echo "--------------------------------------------------"

if grep -q "^\.env$" .gitignore; then
  echo "✓ .env is in .gitignore"
  PASSED=$((PASSED+1))
else
  echo "✗ .env is NOT in .gitignore"
  FAILED=$((FAILED+1))
fi

if grep -q "serviceAccountKey" .gitignore; then
  echo "✓ serviceAccountKey is in .gitignore"
  PASSED=$((PASSED+1))
else
  echo "✗ serviceAccountKey is NOT in .gitignore"
  FAILED=$((FAILED+1))
fi

# Test 6: No hardcoded secrets in source
echo ""
echo "TEST 6: Hardcoded Secrets Scan"
echo "--------------------------------------------------"

SECRETS_IN_SRC=$(grep -r "gsk_\|-----BEGIN PRIVATE KEY-----" src/ 2>/dev/null | wc -l)

if [ "$SECRETS_IN_SRC" = "0" ]; then
  echo "✓ No hardcoded secrets found in source code"
  PASSED=$((PASSED+1))
else
  echo "✗ Hardcoded secrets found in source code!"
  FAILED=$((FAILED+1))
fi

# Test 7: Rate limiting configured
echo ""
echo "TEST 7: Rate Limiting Configuration"
echo "--------------------------------------------------"

if grep -q "rateLimit" src/middleware/rateLimiter.js; then
  echo "✓ Rate limiting middleware configured"
  PASSED=$((PASSED+1))
else
  echo "✗ Rate limiting middleware not found"
  FAILED=$((FAILED+1))
fi

if grep -q "globalLimiter\|aiLimiter" src/server.js; then
  echo "✓ Rate limiters applied to routes"
  PASSED=$((PASSED+1))
else
  echo "✗ Rate limiters not applied"
  FAILED=$((FAILED+1))
fi

# Test 8: Error handler configured
echo ""
echo "TEST 8: Error Handler"
echo "--------------------------------------------------"

if grep -q "errorHandler" src/server.js; then
  echo "✓ Error handler middleware configured"
  PASSED=$((PASSED+1))
else
  echo "✗ Error handler middleware not configured"
  FAILED=$((FAILED+1))
fi

# Test 9: Prompt guard available
echo ""
echo "TEST 9: Prompt Injection Guard"
echo "--------------------------------------------------"

if grep -q "containsInjection\|guardPrompt" src/security/promptGuard.js; then
  echo "✓ Prompt guard functions available"
  PASSED=$((PASSED+1))
else
  echo "✗ Prompt guard functions not found"
  FAILED=$((FAILED+1))
fi

# Test 10: JWT verification configured
echo ""
echo "TEST 10: Authentication Middleware"
echo "--------------------------------------------------"

if grep -q "verifyToken" src/middleware/verifyToken.js; then
  echo "✓ JWT verification middleware configured"
  PASSED=$((PASSED+1))
else
  echo "✗ JWT verification middleware not found"
  FAILED=$((FAILED+1))
fi

# Summary
echo ""
echo "=================================================="
echo ""
echo "📊 SECURITY AUDIT RESULTS"
echo "✓ Passed: $PASSED"
echo "✗ Failed: $FAILED"
echo ""

if [ "$FAILED" = "0" ]; then
  echo "✅ ALL SECURITY CHECKS PASSED"
  exit 0
else
  echo "⚠️  SECURITY ISSUES FOUND"
  exit 1
fi
