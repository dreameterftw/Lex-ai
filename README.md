# LEX — Legal Clarity for Everyone

> The law protects everyone equally — but only if you know it exists.

LEX is a web-based legal intelligence platform that helps ordinary people in India understand their legal situation, know their rights, and act before it's too late — without needing a lawyer.

**Live:** [lex-ai-gg.web.app](https://lex-ai-gg.web.app)
 
---

## What LEX Does
 
Most people encounter legal problems — a landlord dispute, an unpaid salary, a police encounter, a consumer complaint — and have no idea what their rights are or what to do next. LEX closes that gap.

You describe your situation in plain English. LEX identifies the legal category, your rights, relevant deadlines, and generates formal correspondence — all specific to your state and jurisdiction in India.

---

## Features

### AI-Powered Legal Tools
| Feature | What it does |
|---|---|
| **Situation Finder** | Describe your problem, get instant legal classification and urgency assessment |
| **Document X-Ray** | Upload a contract or agreement, get flagged clauses and missing protections |
| **Rights Navigator** | Identify the specific legal rights that apply to your situation |
| **Deadline Tracker** | Never miss a legal deadline — statutes of limitation, notice periods, filing windows |
| **LEX Counsel** | Chat with AI about your case using your full session context |
| **Signal Letter** | Generate a formal rights assertion or demand letter, ready to send |
| **Case Timeline** | Auto-populate key events and milestones in your case |
| **Court Prep Brief** | Prepare for a hearing with a customised Q&A |
| **Legal Health Check** | Score your overall legal readiness across active situations |
| **Plain Law Alerts** | Get notified of relevant legal updates |
| **Outcome Tracker** | Record what happened after your case resolved |

### Legal Library
A plain-English knowledge base covering Indian law — jurisdiction-aware and built for people with no legal background.

- **Articles** — plain-English explanations of tenant rights, employment law, police rights, consumer protection, and the court system
- **Landmark Cases** — key Supreme Court judgments explained in plain English (D.K. Basu, Vishaka, Puttaswamy, Lalita Kumari, Maneka Gandhi)
- **India vs World** — honest comparisons of where Indian law leads globally and where it falls short
- **Know Your Laws** — quick-reference panel showing national laws and state-specific rules for Maharashtra, Delhi, Karnataka, and Tamil Nadu
- **Search + shortcuts** — search any legal topic or use shortcut chips for common queries (FIR, tenant rights, salary, arrest rights)
- **Filter by state and type** — surface articles most relevant to your location and content type

---

## Architecture

LEX runs entirely serverless — no backend to maintain.

```
User → Firebase Auth → React SPA (Firebase Hosting)
                              ↓
                     Firestore (user data, library)
                              ↓
                   Cloudflare Worker (AI proxy)
                              ↓
                         Groq API (Llama 3.3 70B / 3.1 8B)
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Framer Motion, Lucide Icons |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| AI | Groq — Llama 3.3 70B (complex) + Llama 3.1 8B (fast) |
| AI Proxy | Cloudflare Worker (keeps API key out of the browser) |
| Email | Resend API (via Cloudflare Worker) |
| Hosting | Firebase Hosting |

---

## Project Structure

```
lex/
├── lex-frontend/          React + Vite SPA
│   ├── src/
│   │   ├── pages/         One file per feature page
│   │   ├── api/           Thin wrappers over services
│   │   ├── services/      Firestore queries and business logic
│   │   ├── components/    Layout and reusable UI
│   │   ├── firebase/      Firebase init
│   │   └── context/       Auth context
│   └── scripts/           Firestore seed scripts
│       └── content/       Library article content files
├── cloudflare-worker/     AI + email proxy
└── firestore.rules        Security rules
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Firebase project with Firestore and Authentication enabled
- Groq API key
- Resend API key (for email features)
- Cloudflare account (for the AI proxy worker)

### 1. Clone

```bash
git clone https://github.com/dreameterftw/Lex-ai.git
cd Lex-ai
```

### 2. Frontend

```bash
cd lex-frontend
cp .env.example .env
# Fill in your Firebase config and worker URL
npm install
npm run dev
```

Runs at `http://localhost:5173`

### 3. Cloudflare Worker

```bash
cd cloudflare-worker
wrangler secret put GROQ_API_KEY
wrangler secret put RESEND_API_KEY
wrangler deploy
```

Copy the deployed worker URL into `VITE_WORKER_URL` in your frontend `.env`.

### 4. Seed the Legal Library (optional)

The library content is pre-seeded on the live site. To seed your own Firestore:

1. Temporarily open library write rules in Firestore console
2. From `lex-frontend/`:
   ```bash
   node --use-system-ca --env-file=.env scripts/seedLibrary.js
   ```
3. Lock write rules back down (`allow write: if false`)

Use `--clear` flag to wipe and re-seed: `scripts/seedLibrary.js --clear`

---

## Environment Variables

### Frontend (`lex-frontend/.env`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

### Cloudflare Worker secrets

```bash
wrangler secret put GROQ_API_KEY
wrangler secret put RESEND_API_KEY
```

---

## Deployment

### Frontend → Firebase Hosting

```bash
cd lex-frontend
npm run build
firebase deploy --only hosting
```

### Worker → Cloudflare

```bash
cd cloudflare-worker
wrangler deploy
```

### Firestore rules

```bash
firebase deploy --only firestore:rules
```

---

## Security

- `.env` files excluded from git via `.gitignore`
- No API keys in source code — Groq and Resend keys live only in Cloudflare Worker secrets
- Firebase security rules enforce per-user data ownership
- Library collection is read-public, write-denied to all client SDK calls (seeding requires Admin SDK or temporary rule unlock)
- Input validation on all user-facing endpoints
- CORS configured for production domain only

---

## Legal Library Content

The library ships with 20 seeded documents covering:

**Articles (12):** tenant rights, landlord utilities, security deposit recovery, wage theft, probation termination, POSH/workplace harassment, FIR refusal, arrest rights, Indian court system, Lok Adalat, Fundamental Rights, free legal aid

**Landmark Cases (5):** D.K. Basu v. West Bengal, Vishaka v. Rajasthan, Puttaswamy v. Union of India, Lalita Kumari v. UP, Maneka Gandhi v. Union of India

**India vs World (3):** where India leads globally, where it falls short, consumer rights comparison

To add more content, edit files in `lex-frontend/scripts/content/` and re-run the seed script.

---

## Status

**Production** · [lex-ai-gg.web.app](https://lex-ai-gg.web.app)

Built for legal clarity — because the law only works for people who know it exists.
