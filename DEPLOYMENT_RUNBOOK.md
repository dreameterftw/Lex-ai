# 🚀 Lex Production Deployment Runbook

## ✅ Pre-Deployment Complete

Your app is ready for deployment. Here's the exact sequence to follow.

---

## Phase 1: Local Testing (Do This First)

### Run Pre-Deploy Test Script

**Windows:**
```bash
pre-deploy-test.bat
```

**Mac/Linux:**
```bash
bash pre-deploy-test.sh
```

Or manually:

**Terminal 1 — Backend:**
```bash
cd lex-backend
npm run dev
# Should show:
#   Lex backend running
#   Port     : 5000
#   Mode     : development
```

**Terminal 2 — Frontend:**
```bash
cd lex-frontend
npm run dev
# Should show:
#   ➜  Local:   http://localhost:5173
```

### Test Critical Path

Visit http://localhost:5173 and test this exact flow:

```
□ Landing page loads
□ Sign up with new email (e.g., test@example.com)
□ Dashboard appears (no console errors)
□ Create new situation
□ Type description → Analyse → Get result
□ Upload document → Analyse → See flagged clauses
□ Identify rights → See violations
□ Calculate deadlines → See countdown cards
□ Ask Lex Counsel a question → Get response
□ Generate Signal Letter → See preview
□ View Timeline → See events
```

**If anything fails:**
- Check browser console for errors (F12)
- Check Network tab for 401/403/500 responses
- Check backend terminal for error logs
- Fix locally before proceeding

**If all tests pass:** ✅ Ready to deploy

---

## Phase 2: Pre-Production Setup

### 1. Get Your Railway Backend URL

Go to your Railway dashboard:
- Select your backend project
- Click "Deployments"
- Find the latest successful deployment
- Copy the URL (looks like: `https://lex-backend-production.up.railway.app`)

### 2. Update Environment Variables

**Frontend `.env`:**
```env
VITE_FIREBASE_API_KEY=AIzaSyBZId0wYyrDimMbUZXu6Rja51eyi8RbPZY
VITE_FIREBASE_AUTH_DOMAIN=lex-ai-gg.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lex-ai-gg
VITE_FIREBASE_STORAGE_BUCKET=lex-ai-gg.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=986934488252
VITE_FIREBASE_APP_ID=1:986934488252:web:909e63c98605bbf9a1b4b9
VITE_FIREBASE_MEASUREMENT_ID=G-Q58667D505
VITE_BACKEND_URL=https://lex-backend-production.up.railway.app
```

**Backend `.env` (in Railway Dashboard):**
Set these variables in Railway console:
```
FIREBASE_PROJECT_ID=lex-ai-gg
FIREBASE_PRIVATE_KEY=<your firebase private key>
FIREBASE_CLIENT_EMAIL=<your service account email>
GROQ_API_KEY=<your groq api key from console.groq.com>
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://lex-app.web.app
```

### 3. Push Backend Changes to Railway

```bash
cd lex-backend
git add .
git commit -m "Production deployment: Update CORS + env"
git push
# Railway auto-deploys after git push
# Check Railway dashboard for successful deployment
```

Wait 2-3 minutes for Railway to redeploy, then verify:
```bash
curl https://lex-backend-production.up.railway.app/api/health
# Should return: {"status":"healthy"}
```

---

## Phase 3: Firebase Hosting Deployment

### 1. Install Firebase CLI (if not done)

```bash
npm install -g firebase-tools
firebase --version
# Should show: x.x.x
```

### 2. Login to Firebase

```bash
firebase login
# Opens browser to authenticate
```

### 3. Navigate to Frontend

```bash
cd lex-frontend
```

### 4. Initialize Firebase Hosting

```bash
firebase init hosting
```

Answer the prompts exactly:
```
? Select project → lex-app
? Public directory → dist
? Single-page app (SPA)? → Yes
? Overwrite dist/index.html? → No
? GitHub auto-deploy? → No
```

This creates:
- `firebase.json`
- `.firebaserc`

### 5. Verify firebase.json

Open `firebase.json`. Should have:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

The `rewrites` rule is critical for React Router.

### 6. Build Frontend

```bash
npm run build
# Output should show:
# dist/index.html
# dist/assets/index-*.css
# dist/assets/index-*.js
# ✓ built in X.XXs
```

### 7. Deploy to Firebase

```bash
firebase deploy --only hosting
```

Expected output:
```
=== Deploying to 'lex-app'...

i  hosting: beginning deploy...
i  hosting: found 12 files in dist
✔  hosting: file upload complete

✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/lex-ai-gg
Hosting URL: https://lex-app.web.app
```

---

## Phase 4: Post-Deployment Verification

### 1. Open Live App

Visit: **https://lex-app.web.app**

Check:
```
□ Landing page loads
□ Sign up works
□ Dashboard loads
□ No CORS errors in console
□ No 401 errors in network tab
```

### 2. Add Domain to Firebase Auth

Go to Firebase Console:
1. Select project: `lex-ai-gg`
2. Authentication → Settings
3. Authorized domains
4. Add:
   - `lex-app.web.app`
   - `lex-app.firebaseapp.com`

### 3. Test Live Critical Path

On **https://lex-app.web.app**:

```
□ Sign up with new test email
□ Dashboard loads
□ Create situation
□ Upload document
□ Identify rights
□ Calculate deadlines
□ Ask Lex Counsel question
□ Generate Signal Letter
□ View Timeline
```

### 4. Check Backend Logs

Go to Railway Dashboard:
- Select backend project
- Logs tab
- Should see:
  ```
  Lex backend running
  Port     : 5000
  Mode     : production
  ```

### 5. Test on Mobile

Open https://lex-app.web.app on your phone:
```
□ Landing page readable
□ Login form works
□ Dashboard scrolls properly
□ Counsel chat input visible above keyboard
```

---

## Phase 5: Post-Deploy Maintenance

### Seed Legal Library (Optional but Recommended)

The library articles should auto-seed, but you can manually seed if needed:

```bash
# Get your Firebase token (in browser console on the live site):
firebase.auth().currentUser.getIdToken().then(token => console.log(token))

# Then run:
curl -X POST https://lex-backend-production.up.railway.app/api/library/seed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Monitor Production

- **Firebase Console** → Overview (check usage)
- **Railway Dashboard** → Logs (check for errors)
- **Browser console** on live site (check for client-side errors)

### Enable Firebase Security Rules

Go to Firebase Console → Firestore → Rules.

Confirm these are published (not in draft):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    // ... etc
  }
}
```

---

## 🎯 Your Live URLs

```
🌐 Frontend    https://lex-app.web.app
🔧 Backend     https://lex-backend-production.up.railway.app
❤️ Health      https://lex-backend-production.up.railway.app/api/health
📊 Console     https://console.firebase.google.com/project/lex-ai-gg
```

---

## ⚠️ Troubleshooting

### 404 on page refresh

**Problem:** Page like `/dashboard` returns 404 after refresh  
**Fix:** Check `firebase.json` has `rewrites` rule pointing all routes to `/index.html`

### CORS errors in browser

**Problem:** "Access to XMLHttpRequest blocked by CORS policy"  
**Fix:**
1. Check `FRONTEND_URL` in Railway backend is set to `https://lex-app.web.app`
2. Redeploy backend: `git push` in lex-backend
3. Clear browser cache and hard reload

### 401 Unauthorized on all requests

**Problem:** Every API call returns 401  
**Fix:**
1. Check `VITE_BACKEND_URL` in frontend `.env` is correct Railway URL
2. Check Firebase config keys are correct
3. Rebuild: `npm run build && firebase deploy`

### Slow initial load

**Problem:** First visit takes 10-15 seconds  
**Fix:** This is normal on Railway cold start. Subsequent loads are fast.

### AI timeouts

**Problem:** "Groq API timeout" on Signal Letter / Health Check  
**Fix:**
1. First request can be slow (Groq is free tier)
2. Retry after 10 seconds
3. Check GROQ_API_KEY is set in Railway

---

## 📝 Deployment Checklist

- [x] Frontend build succeeds
- [x] Backend running on Railway
- [x] CORS includes Firebase Hosting URLs
- [x] TokenDebug component removed
- [x] .env files updated with production URLs
- [ ] Local critical path tests pass
- [ ] Firebase CLI logged in
- [ ] firebase.json has rewrites rule
- [ ] Firebase deploy succeeds
- [ ] Live app opens and loads
- [ ] Domains added to Firebase Auth
- [ ] Live critical path tests pass
- [ ] Mobile tested
- [ ] Backend logs show no errors

---

## 🎉 Success!

Your Lex app is now live at: **https://lex-app.web.app**

**Share it with judges!**

---

*Last updated: 2026-06-07*  
*Deployment version: 1.0 — All 9 features complete*
