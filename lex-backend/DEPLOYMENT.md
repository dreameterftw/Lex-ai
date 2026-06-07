# Railway Deployment Checklist & Guide

## Pre-Deployment (Local Testing Complete ✅)

- [x] All 12 features implemented and tested
- [x] Integration test passing (test-complete.js)
- [x] Security audit passing (14/14 checks)
- [x] Firestore rules created
- [x] Storage rules created
- [x] Environment variables configured locally
- [x] Error handling tested
- [x] Rate limiting tested
- [x] CORS configured

## Step 1: Deploy Firestore & Storage Rules

Before deploying the backend, push the database security rules:

```bash
# Navigate to backend directory
cd lex-backend

# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Select the correct Firebase project
firebase use lex-ai-gg

# Deploy both Firestore and Storage rules
firebase deploy --only firestore:rules,storage
```

**Verify**: Rules deployed in Firebase Console under Firestore Rules & Storage Rules tabs.

---

## Step 2: Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Deploy from GitHub repo

---

## Step 3: Connect GitHub Repository

1. In Railway dashboard: "Deploy from GitHub"
2. Authorize Railway to access your GitHub account
3. Select repository: `lex-ai-gg/lex-backend` (or your repo name)
4. Select branch: `main` or `master`
5. Railway will auto-detect Node.js and create the service

---

## Step 4: Set Environment Variables

In Railway dashboard, go to Variables tab and set:

```
FIREBASE_PROJECT_ID=lex-ai-gg
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@lex-ai-gg.iam.gserviceaccount.com
GROQ_API_KEY=gsk_your_actual_key_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

**Important**: 
- Copy the exact values from your `.env` file
- For `FIREBASE_PRIVATE_KEY`, keep the literal `\n` characters (don't convert to actual newlines)
- Do NOT commit `.env` to GitHub — Railway reads from dashboard variables

---

## Step 5: Configure Build & Start Commands

Railway should auto-detect, but verify in the Deploy tab:

- **Build Command**: (leave empty, or `npm install`)
- **Start Command**: `node src/server.js`

---

## Step 6: Deploy

Once environment variables are set:

1. Railway auto-deploys on push to main branch
2. Or manually trigger deployment from dashboard
3. Watch the deployment logs in real-time
4. Deployment complete when you see: "Lex backend running on Port 5000"

---

## Step 7: Get the Live URL

After successful deployment:

1. In Railway dashboard, click on the Node service
2. Go to "Settings" → "Copy Domain"
3. URL format: `https://your-service-randomname.up.railway.app`

**Example**: `https://lex-backend-prod-x7y2z.up.railway.app`

---

## Step 8: Test the Live Backend

```bash
# Health check
curl https://your-service.up.railway.app/api/health

# Expected response:
{
  "status": "ok",
  "message": "Lex backend is running",
  "environment": "production"
}
```

---

## Step 9: Update Frontend Configuration

Update your frontend `.env` to point to the live backend:

```
REACT_APP_API_URL=https://your-service-randomname.up.railway.app/api
REACT_APP_FIREBASE_API_KEY=your_firebase_web_key
REACT_APP_FIREBASE_AUTH_DOMAIN=lex-ai-gg.firebaseapp.com
```

---

## Step 10: Run E2E Tests Against Live Backend

```javascript
// test-live.js
const API_BASE = "https://your-service.up.railway.app/api";

// Test all features with live backend
// Verify context updates in Firestore
// Confirm AI responses are working
```

---

## Monitoring & Logs

### View Logs in Railway

1. Dashboard → Your Node service → Logs tab
2. Real-time streaming of stdout/stderr
3. Search by keyword or filter by date

### Common Issues & Solutions

#### Deployment Failed
- Check build logs for syntax errors
- Verify environment variables are set
- Ensure package.json has all dependencies

#### 503 Service Unavailable
- Check logs for "ENOENT" (missing file)
- Verify NODE_ENV=production
- Check Firebase credentials are valid

#### 401 Unauthorized (AI calls failing)
- Verify GROQ_API_KEY is set correctly
- Check key hasn't been regenerated
- Confirm rate limits not exceeded

#### Firestore Permission Denied
- Deploy firestore.rules with `firebase deploy`
- Verify FIREBASE_PRIVATE_KEY is set (with literal `\n`)
- Check Firestore security rules in Firebase Console

---

## Production Deployment Recommendations

### 1. Enable Auto-Deploy
- Railway → Settings → Auto-deploy on push: ✓ Enabled

### 2. Set Up Custom Domain
- Railway → Settings → Custom Domain
- Point your domain (e.g., `api.lexapp.com`) to Railway
- Enable automatic HTTPS/SSL

### 3. Configure Backups
- Firebase → Backup and Restore → Set retention to 30 days

### 4. Set Up Monitoring & Alerts
- Railway → Alerts tab
- Alert on: High memory usage, High CPU, Deployment failed

### 5. Enable CORS for Multiple Domains
Update `src/server.js` for production:

```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    "https://lex-app.web.app",
    "https://lex-app.firebaseapp.com",
    "https://api.lexapp.com",    // Your custom domain
    "https://www.lexapp.com"       // Your main domain
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
```

Then redeploy.

---

## Post-Deployment Checklist

- [ ] Live backend URL obtained from Railway
- [ ] Health check endpoint returns 200 OK
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] All 12 features tested against live backend
- [ ] Error handling working (no stack traces exposed)
- [ ] Rate limiting working
- [ ] CORS properly configured
- [ ] Environment variables verified in production
- [ ] Monitoring/logging set up
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Frontend updated to use live API URL

---

## Rollback Procedure

If deployment goes wrong:

1. **In Railway dashboard**: Go to Deployments tab
2. Click on previous stable deployment
3. Select "Redeploy"
4. Railway will rollback to that version automatically

---

## Debugging Production Issues

```bash
# SSH into Railway container (if needed)
railway run bash

# View environment variables
railway run env

# Check Node version
railway run node --version

# Test Firestore connection
railway run node -e "require('./src/config/firebase.js'); console.log('Firebase connected')"
```

---

## Cost Estimation (Railway)

- **Starter**: $5-7/month (up to 10GB RAM, perfect for MVP)
- **Standard**: $20+/month (more compute)
- **Enterprise**: Custom pricing

Lex backend runs comfortably on Starter tier.

---

## Support & Resources

- Railway docs: https://docs.railway.app
- Firebase deployment: https://firebase.google.com/docs/cli
- Node.js on Railway: https://docs.railway.app/deploy/nodejs
- Troubleshooting: https://docs.railway.app/reference/error-messages

---

**Ready to Deploy?** Run Step 12:

```bash
# 1. Deploy Firebase rules
firebase deploy --only firestore:rules,storage

# 2. Connect GitHub repo to Railway
# (Follow Step 2-3 above)

# 3. Set environment variables in Railway dashboard
# (Follow Step 4 above)

# 4. Deploy and test
# (Follow Step 5-10 above)
```
