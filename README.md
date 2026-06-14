# LEX — Legal Clarity for Everyone

> The law protects everyone equally — but only if you know it exists.

LEX is a web-based legal intelligence platform that helps ordinary people understand their legal situation, know their rights, and act before it's too late — without needing a lawyer.

## Project Structure

lex/
├── lex-backend/ Node.js + Express API
└── lex-frontend/ React + Vite SPA


## Tech Stack 

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Framer Motion, Tailwind CSS, Lucide Icons |
| Backend | Node.js ESM, Express.js |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI | Groq (Llama 3.3 70B + Llama 3.1 8B) |
| Email | Resend API |
| Hosting | Firebase Hosting (frontend) + Render (backend) |

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
- 📧 **Contact Form** - Reach out with questions (responses stored securely)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (with Firestore)
- Groq API key
- Resend API key (for email features)

### Worker Setup

cd cloudflare-worker
wrangler secret put GROQ_API_KEY
wrangler secret put RESEND_API_KEY
wrangler deploy

### Frontend Setup

cd lex-frontend
cp .env.example .env
# Edit .env with your Firebase config
npm install
npm run dev

Frontend runs on http://localhost:5173

### Environment Variables
Worker secrets

GROQ_API_KEY=your-groq-key
RESEND_API_KEY=your-resend-key

Frontend (.env)

VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_WORKER_URL=https://lex-proxy-worker.YOUR-SUBDOMAIN.workers.dev

### Deployment

Frontend (Firebase Hosting)

cd lex-frontend
npm run build
firebase deploy --only hosting

Visit: https://lex-ai-gg.web.app

Worker (Cloudflare)

cd cloudflare-worker
wrangler deploy

Worker: https://lex-proxy-worker.YOUR-SUBDOMAIN.workers.dev

### Worker Endpoints

POST /api/chat - Proxies full Groq chat completion bodies and injects GROQ_API_KEY.
POST /api/email - Proxies Resend email payloads and injects RESEND_API_KEY.

Frontend data operations use the Firebase client SDK directly against Firestore.

### Security

✅ .env files protected by .gitignore
✅ No hardcoded API keys in source
✅ API keys stored securely in backend .env
✅ Firebase security rules enforce data ownership
✅ Rate limiting on all routes
✅ Input validation on all user endpoints
✅ CORS configured for production domains
✅ Contact form submissions stored in Firestore
✅ Email API key never exposed to frontend
See SECURITY_AUDIT_REPORT.md for full security audit.

### Documentation

DEPLOYMENT_RUNBOOK.md — Step-by-step deployment guide
DEPLOYMENT_FIREBASE.md — Firebase-specific deployment
DEPLOYMENT_RENDER.md — Render backend deployment
SECURITY_AUDIT_REPORT.md — Complete security audit
PRE_DEPLOY_CHECKLIST.md — Local testing checklist

### Recent Updates

Latest (v1.0.0)
✅ Added secure contact form routed through the Cloudflare Worker
✅ Integrated Resend API for email confirmations
✅ Contact submissions stored in Firestore for data persistence
✅ Fixed all ESLint errors and linting issues
✅ Standardized section heading font sizes
✅ Added visual section divider between capabilities and supporting suite
✅ Repositioned contact form above footer

### Support

For issues, check the docs first, then create a GitHub issue with:

What you were trying to do
Error message (if any)
Steps to reproduce
Built with ❤️ for legal clarity
Status: Production • Frontend: https://lex-ai-gg.web.app • AI Proxy: Cloudflare Worker

## lex-backend

The Express backend has been retired. All data operations now run directly against Firestore from the frontend. AI calls are proxied through a Cloudflare Worker. This folder is kept for reference only.
