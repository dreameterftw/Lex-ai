# 🚀 Lex Complete Deployment on Render

**Status:** Backend deployed ✅  
**Backend URL:** `https://lex-backend-er7l.onrender.com`

---

## Phase 1: Backend Verification ✅

Your backend is already deployed on Render. Verify it's working:

```bash
# Check backend health
curl https://lex-backend-er7l.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-06-07T...",
  "environment": "production"
}
```

---

## Phase 2: Frontend Deployment to Render

### Step 1: Create Frontend Service on Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your GitHub repo (lex)
5. Configure:
   - **Name:** `lex-frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`
   - **Plan:** Free or Starter (as needed)

### Step 2: Add Environment Variables

In your Render dashboard for lex-frontend:

1. Click **"Environment"** section
2. Add these variables:

```
VITE_BACKEND_URL=https://lex-backend-er7l.onrender.com
VITE_FIREBASE_API_KEY=AIzaSyBZId0wYyrDimMbUZXu6Rja51eyi8RbPZY
VITE_FIREBASE_AUTH_DOMAIN=lex-ai-gg.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lex-ai-gg
VITE_FIREBASE_STORAGE_BUCKET=lex-ai-gg.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=986934488252
VITE_FIREBASE_APP_ID=1:986934488252:web:909e63c98605bbf9a1b4b9
VITE_FIREBASE_MEASUREMENT_ID=G-Q58667D505
```

3. Click **"Save Changes"** → Render will auto-deploy

### Step 3: Wait for Deployment

Render will automatically:
- Pull latest code from GitHub
- Install dependencies
- Build the frontend
- Deploy to production

This typically takes 3-5 minutes. Check the deployment logs.

---

## Phase 3: Verify Backend Configuration

Make sure your backend `.env` on Render includes:

```
# Required
FIREBASE_PROJECT_ID=lex-ai-gg
FIREBASE_PRIVATE_KEY=<your firebase private key>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@lex-ai-gg.iam.gserviceaccount.com
GROQ_API_KEY=<your groq api key>
PORT=5000
NODE_ENV=production
FRONTEND_URL=<your frontend render url> # Add this once frontend is deployed
```

**To update backend environment variables:**

1. Go to Render Dashboard
2. Select `lex-backend` service
3. Click **"Environment"**
4. Update `FRONTEND_URL` with your frontend's Render URL (e.g., `https://lex-frontend-xxxx.onrender.com`)
5. Save → Render auto-redeploys

---

## Phase 4: Test End-to-End

Once frontend is deployed:

1. **Visit Frontend URL:**
   ```
   https://lex-frontend-xxxx.onrender.com
   ```

2. **Test Critical Path:**
   - [ ] Landing page loads
   - [ ] Sign up works
   - [ ] Dashboard loads
   - [ ] Create situation → Analyse → Get AI response
   - [ ] Upload document → Analyse
   - [ ] Check browser console (F12) for errors
   - [ ] Check Network tab for 200 responses

3. **If errors appear:**
   - Check frontend logs in Render dashboard
   - Check backend logs in Render dashboard
   - Verify backend `FRONTEND_URL` is set correctly (for CORS)
   - Verify all Firebase keys are correct

---

## Phase 5: Update Backend CORS (if needed)

If frontend requests are being blocked, update backend CORS:

**Backend file:** `lex-backend/src/server.js`

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',           // Local dev
    'http://localhost:3000',           // Local serve
    'https://lex-frontend-xxxx.onrender.com',  // Replace with your Render URL
    process.env.FRONTEND_URL,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

Push changes to GitHub → Render auto-redeploys

---

## Phase 6: Deploy Firebase Security Rules (One-Time)

Run locally (only once):

```bash
cd lex-backend

# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy Firestore + Storage rules
firebase deploy --only firestore:rules,storage
```

This secures your database at the Firebase level.

---

## Complete Checklist

- [ ] Backend deployed on Render (`https://lex-backend-er7l.onrender.com`)
- [ ] Backend health check working
- [ ] Frontend repository connected to Render
- [ ] Frontend environment variables added to Render
- [ ] Frontend deployment starts (check logs)
- [ ] Frontend health check: page loads, no 404s
- [ ] Backend `FRONTEND_URL` updated in Render env vars
- [ ] Backend CORS includes frontend URL
- [ ] End-to-end flow tested (sign up → dashboard → AI features)
- [ ] Firebase security rules deployed (`firebase deploy`)
- [ ] Both services connected to GitHub webhooks (auto-deploy on push)

---

## Troubleshooting

### Backend returns 404
- Verify backend is running: `https://lex-backend-er7l.onrender.com/api/health`
- Check backend logs in Render dashboard

### Frontend loads but API calls fail
- Check browser Network tab (F12) for response errors
- Look for 401 (auth) or 403 (CORS) errors
- Update backend `FRONTEND_URL` in Render env vars
- Verify Firebase keys in frontend `.env`

### CORS errors
- Add frontend URL to backend's CORS allowlist
- Push to GitHub → Render redeploys
- Wait 30 seconds → retry

### Firebase auth not working
- Verify `FIREBASE_PROJECT_ID` matches your Firebase project
- Check Firebase Console: Authentication tab enabled
- Verify service account keys are correct in backend `.env`

---

## Monitoring

**Check logs in Render:**
1. Go to Render dashboard
2. Select service (backend or frontend)
3. Click **"Logs"** → see real-time output
4. Look for errors or warnings

**To debug:**
- Add `console.log()` statements in code
- Push to GitHub
- Render auto-redeploys
- Check logs

---

## Auto-Redeployment

Both services are connected to GitHub. Every push triggers:
1. GitHub → Render webhook
2. Render pulls latest code
3. Render rebuilds & redeploys
4. Service restarts with new code

**To disable auto-deploy:** Go to Render service settings → uncheck "Auto-Deploy"

---

## Next: Scaling & Performance

Once everything works:
- Monitor logs for errors
- Use Render's **Metrics** tab to check CPU/Memory
- Upgrade to paid plan if free tier is too slow
- Consider caching/CDN for frontend

---

## Contact Firebase Support

If you hit Firebase issues:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project `lex-ai-gg`
3. Check **Project Settings** → Service Accounts
4. Verify keys match your backend `.env`
