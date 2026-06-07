# Firebase Hosting Deployment Guide for Lex

## Pre-Deployment Checklist

- [ ] Backend is deployed and running (Railway)
- [ ] All environment variables are configured in `.env`
- [ ] Backend CORS is updated to include Firebase Hosting URL
- [ ] Frontend is tested locally (`npm run dev`)
- [ ] No build errors when running `npm run build`

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window to authenticate with your Firebase account.

## Step 3: Initialize Firebase Hosting in Frontend

Navigate to your lex-frontend directory:

```bash
cd lex-frontend
```

If you haven't already initialized Firebase in this folder:

```bash
firebase init hosting
```

Answer the prompts:
- **Select project**: Choose your Firebase project (e.g., `lex-app`)
- **What do you want to use as your public directory?**: Enter `dist`
- **Configure as a single-page app?**: Answer `Yes`
- **Set up automatic builds and deploys?**: Answer `No` (for now)

## Step 4: Update firebase.json (if needed)

Your `firebase.json` should look like this:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

The `rewrites` rule ensures that all routes are served to `index.html` (required for React Router to work).

## Step 5: Set Firebase Project

```bash
firebase use lex-app
```

Or list available projects:
```bash
firebase projects:list
```

## Step 6: Build the Frontend

```bash
npm run build
```

This creates a `dist` folder with optimized production-ready files.

## Step 7: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

The command will:
1. Upload your `dist` folder to Firebase
2. Provide a hosting URL (typically `https://lex-app.web.app`)

## Step 8: Update Backend CORS

Once deployment is complete, your frontend will be live at a URL like:
- `https://lex-app.web.app`
- `https://lex-app.firebaseapp.com`

Update your backend's CORS configuration in `server.js`:

```javascript
const cors = require('cors')

app.use(cors({
  origin: [
    "http://localhost:5173",           // Local dev
    "https://lex-app.web.app",         // Firebase Hosting
    "https://lex-app.firebaseapp.com"  // Firebase alternate URL
  ],
  credentials: true
}))
```

Then redeploy the backend to Railway:

```bash
# In lex-backend directory
git add .
git commit -m "Update CORS for Firebase Hosting"
git push
```

## Step 9: Update Frontend Environment Variables

If your `.env` file uses `http://localhost:5000`, update it to production backend:

```env
VITE_BACKEND_URL=https://your-backend-production-url.com
```

Then rebuild and redeploy:

```bash
npm run build
firebase deploy --only hosting
```

## Step 10: Verify Deployment

1. Visit your hosting URL: `https://lex-app.web.app`
2. Test the complete flow:
   - Sign up with a test account
   - Create a new situation
   - Upload a document
   - Identify rights
   - Calculate deadlines
   - Use Lex Counsel
   - Generate Signal Letter
   - Check timeline
   - Prepare for court
   - Take health check
   - Visit alerts

## Troubleshooting

### Issue: "Cannot GET /"

**Solution**: Ensure `firebase.json` has the rewrites rule for SPA routing.

### Issue: 404 on API calls

**Solution**: 
1. Verify backend is running and accessible
2. Check backend CORS includes your Firebase URL
3. Verify `VITE_BACKEND_URL` is correct in `.env`

### Issue: "Permission denied" during deploy

**Solution**: 
```bash
firebase logout
firebase login
firebase use lex-app
```

### Issue: Build fails with "Module not found"

**Solution**:
```bash
npm install
npm run build
```

## Production Best Practices

- [ ] Enable Firebase security rules (Firestore + Storage)
- [ ] Set up monitoring in Firebase Console
- [ ] Configure custom domain (if desired)
- [ ] Enable HTTPS (automatic with Firebase)
- [ ] Set up analytics in Firebase Console
- [ ] Create backup database exports regularly
- [ ] Monitor Firebase billing

## Rollback (if needed)

View deployment history:
```bash
firebase hosting:channel:list
```

To rollback to a previous version:
```bash
firebase hosting:disable
# Then redeploy the previous build
firebase deploy --only hosting
```

## Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Connect domain"
3. Follow domain verification steps
4. Update DNS records as instructed

## Continuous Deployment (Optional)

To enable auto-deploy on git push:

```bash
firebase hosting:channel:deploy preview-branch \
  --expires 7d \
  --branch preview
```

---

**Deployed URL**: https://lex-app.web.app  
**Project ID**: lex-app  
**Deployment Status**: Live
