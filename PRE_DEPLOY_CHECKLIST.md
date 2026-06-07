# Lex Pre-Deployment Checklist

## ✅ Pre-Deploy Verification (Do This First)

### 1. Environment Variables
- [x] Frontend `.env` has all Firebase keys
- [x] Frontend `VITE_BACKEND_URL=http://localhost:5000` (for local testing)
- [x] Backend `.env` has Firebase keys + GROQ_API_KEY set
- [ ] Will update Frontend `VITE_BACKEND_URL` to Railway URL before deploy
- [ ] Will update Backend `FRONTEND_URL` to Firebase Hosting URL before deploy

### 2. CORS Configuration
- [x] Backend CORS includes localhost origins
- [x] Backend CORS includes `https://lex-app.web.app`
- [x] Backend CORS includes `https://lex-app.firebaseapp.com`
- [x] Backend CORS includes `process.env.FRONTEND_URL`

### 3. Production SSL
- [x] Backend `package.json` start script has no NODE_TLS_REJECT_UNAUTHORIZED
- [x] Backend dev script correctly sets NODE_TLS_REJECT_UNAUTHORIZED=0
- [x] Backend validates production mode in server.js

### 4. Debug Components
- [x] Removed TokenDebug component from DashboardPage.jsx
- [x] No other debug utilities found
- [x] Console.log statements are informational, not exposing secrets

### 5. Build Verification
- [ ] Run `npm run build` in frontend and confirm success
- [ ] Verify `dist` folder has index.html and assets

---

## 🧪 Local Critical Path Test

Run this BEFORE deploying. If any step fails, fix it locally first.

**Terminal 1 — Start Backend:**
```bash
cd lex-backend
npm run dev
# Should see: Lex backend running on port 5000
```

**Terminal 2 — Start Frontend:**
```bash
cd lex-frontend
npm run dev
# Should see: Local: http://localhost:5173
```

**Then Test This Exact Flow:**

1. **[] Landing Page**
   - Open http://localhost:5173
   - See hero image + "Lex" logo
   - No console errors

2. **[] Sign Up**
   - Click "Sign up"
   - Enter email, password, jurisdiction
   - Submit
   - Check browser console for any errors
   - Should redirect to dashboard

3. **[] Dashboard Loads**
   - See "Welcome back" + session cards
   - Network tab shows no 401/403 errors
   - No red errors in console

4. **[] Create New Session**
   - Click "New situation"
   - See step counter "Step 1 of 8"
   - Select jurisdiction from dropdown

5. **[] Situation Finder**
   - Type a description: "My landlord hasn't fixed my heating"
   - Click "Analyse situation"
   - Wait for AI response
   - Check Network tab: POST /api/situation should be 200
   - Result shows "Legal Category" like "Landlord-Tenant"

6. **[] Document Upload**
   - Click "Next: Document X-Ray"
   - Create a dummy PDF or use one from downloads
   - Upload it
   - Click "Analyse documents"
   - Wait for analysis
   - Should see 2-3 flagged clauses

7. **[] Rights Identification**
   - Click "Identify my rights"
   - Wait for AI analysis
   - Should see 2-3 rights identified
   - Should see violations flagged

8. **[] Deadline Calculation**
   - Click "Calculate deadlines"
   - Should see 2+ deadline cards with countdown timers
   - Check urgency colors (red/orange/yellow/green)

9. **[] Lex Counsel Chat**
   - Type: "What are my strongest rights here?"
   - Click Send
   - Wait 3-5 seconds for response
   - Should see bot message with contextual answer
   - Check Network: no 401 errors

10. **[] Signal Letter**
    - Click "Generate letter"
    - Should see formal letter preview
    - Check Network: POST /api/signal is 200

11. **[] Timeline Page**
    - Click "Case Timeline"
    - Should see auto-populated events
    - Timeline shows situation identified, rights identified, etc.

---

## ⚠️ If Anything Fails

### Network Error / 401 Unauthorized
- Check Firebase token is being sent in headers
- Backend logs should show the error
- Verify `VITE_BACKEND_URL` is http://localhost:5000

### CORS Error
- "Access to XMLHttpRequest blocked by CORS policy"
- Check backend CORS includes localhost:5173
- Restart backend after editing CORS

### AI Timeout
- "Request failed: timeout"
- First request can be slow (10-15 seconds)
- Groq API might be rate limiting — try again

### PDF Parse Error
- "Failed to extract text from PDF"
- Try a simpler PDF or text-based PDF
- Some image PDFs won't work

### Firebase Auth Error
- "Firebase not initialized"
- Check VITE_FIREBASE_API_KEY is correct
- Check VITE_FIREBASE_PROJECT_ID matches backend

---

## 📋 Before Clicking Deploy

- [x] Removed TokenDebug from frontend
- [ ] Tested full critical path locally
- [ ] Backend logs show no errors
- [ ] Browser console shows no red errors
- [ ] Network tab shows no 4xx/5xx responses
- [ ] Document upload works
- [ ] AI responses arrive within 10 seconds
- [ ] Sign up / login flow works

---

## When Ready to Deploy

1. Update Frontend `.env`: `VITE_BACKEND_URL=https://lex-backend-production.up.railway.app`
2. Update Backend `.env`: `FRONTEND_URL=https://lex-app.web.app`
3. Push backend changes to Railway
4. Run: `npm run build`
5. Run: `firebase deploy --only hosting`
6. Add `lex-app.web.app` to Firebase Console → Authentication → Authorized domains

---

**Current Status: Ready for local testing**
