# LEX — Legal Clarity for Everyone

> The law protects everyone equally — but only if you know it exists.

LEX is a web-based legal intelligence platform that helps ordinary people understand their legal situation, know their rights, and act before it's too late — without needing a lawyer.

## Project Structure

```
lex/
├── lex-backend/    Node.js + Express API
└── lex-frontend/   React + Vite SPA
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TanStack Router, Tailwind CSS, Lucide Icons |
| Backend | Node.js ESM, Express.js |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI | Groq (Llama 3.3 70B + Llama 3.1 8B) |
| Hosting | Firebase Hosting (frontend) + Railway (backend) |

## Features

✨ **Core AI Features:**
- 🏠 **Situation Finder** - Describe your legal situation, get instant analysis
- 📄 **Document X-Ray** - Upload contracts/agreements, get clause flagging
- ⚖️ **Rights Navigator** - Identify your legal rights in seconds
- ⏰ **Deadline Tracker** - Never miss a legal deadline
- 💬 **Lex Counsel** - Chat with AI about your case
- ✍️ **Signal Letter** - Generate formal rights assertion letters
- 📊 **Case Timeline** - Auto-populate case events and milestones
- 🎓 **Court Prep Brief** - Prepare for hearings with Q&A
- 💚 **Legal Health Check** - Assess your legal readiness
- 🔔 **Plain Law Alerts** - Get notified of legal updates
- 📚 **Legal Library** - Search jurisdiction-specific law
- 📋 **Outcome Tracker** - Record case results

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (with Firestore)
- Groq API key

### Backend Setup

```bash
cd lex-backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd lex-frontend
cp .env.example .env
# Edit .env with your Firebase config
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
GROQ_API_KEY=your-groq-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_BACKEND_URL=http://localhost:5000
```

## Deployment

### Frontend (Firebase Hosting)
```bash
cd lex-frontend
npm run build
firebase deploy --only hosting
```

### Backend (Railway)
```bash
cd lex-backend
git push  # Railway auto-deploys
```

## Security

- ✅ `.env` files protected by `.gitignore`
- ✅ No hardcoded API keys in source
- ✅ Firebase security rules enforce data ownership
- ✅ Rate limiting on all AI endpoints
- ✅ Input validation on all user routes
- ✅ CORS configured for production

See `SECURITY_AUDIT_REPORT.md` for full security audit.

## Documentation

- `DEPLOYMENT_RUNBOOK.md` — Step-by-step deployment guide
- `SECURITY_AUDIT_REPORT.md` — Complete security audit
- `PRE_DEPLOY_CHECKLIST.md` — Local testing checklist

## Support

For issues, check the docs first, then create a GitHub issue with:
- What you were trying to do
- Error message (if any)
- Steps to reproduce

---

**Built with ❤️ for legal clarity**
