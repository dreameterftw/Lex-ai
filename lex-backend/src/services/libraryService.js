// src/services/libraryService.js
import { db } from "../config/firebase.js";
import CONSTANTS from "../config/constants.js";
import { createError } from "../middleware/errorHandler.js";

// ─── Library categories ───────────────────────────────────────────
export const LIBRARY_CATEGORIES = [
  {
    id: "renting-housing",
    title: "Renting & Housing",
    description: "Tenant rights, lease agreements, eviction protection"
  },
  {
    id: "work-employment",
    title: "Work & Employment",
    description: "Worker rights, wrongful termination, wage theft"
  },
  {
    id: "debt-consumer",
    title: "Debt & Consumer Rights",
    description: "Debt collectors, consumer protection, refunds"
  },
  {
    id: "family-relationships",
    title: "Family & Relationships",
    description: "Divorce, child custody, domestic protection orders"
  },
  {
    id: "accidents-liability",
    title: "Accidents & Liability",
    description: "Personal injury, property damage, insurance claims"
  },
  {
    id: "immigration",
    title: "Immigration Basics",
    description: "Visas, rights regardless of status, documentation"
  },
  {
    id: "small-business",
    title: "Small Business & Contracts",
    description: "Business contracts, liability, intellectual property"
  },
  {
    id: "traffic-road-safety",
    title: "Traffic & Road Safety",
    description: "Accidents, challans, insurance and road rule basics"
  },
  {
    id: "police-rights",
    title: "Police & Your Rights",
    description: "Know your rights during police encounters"
  }
];


// ─── Get all categories ───────────────────────────────────────────
export const getCategories = () => {
  return LIBRARY_CATEGORIES;
};


// ─── Get articles by category ─────────────────────────────────────
export const getArticlesByCategory = async (categoryId) => {
  try {
    const snapshot = await db
      .collection(CONSTANTS.COLLECTIONS.LIBRARY)
      .where("category", "==", categoryId)
      .orderBy("publishedAt", "desc")
      .get();

    const articles = [];
    snapshot.forEach(doc => {
      // Return summary only, not full content
      const data = doc.data();
      articles.push({
        articleId: doc.id,
        category: data.category,
        title: data.title,
        summary: data.summary,
        readingTime: data.readingTime,
        tags: data.tags,
        publishedAt: data.publishedAt
      });
    });

    return articles;

  } catch (err) {
    throw createError("Failed to retrieve articles.", 500);
  }
};


// ─── Get single article ───────────────────────────────────────────
export const getArticle = async (articleId) => {
  try {
    const doc = await db
      .collection(CONSTANTS.COLLECTIONS.LIBRARY)
      .doc(articleId)
      .get();

    if (!doc.exists) {
      throw createError("Article not found.", 404);
    }

    return {
      articleId: doc.id,
      ...doc.data()
    };

  } catch (err) {
    if (err.status) throw err;
    throw createError("Failed to retrieve article.", 500);
  }
};


// ─── Search articles ──────────────────────────────────────────────
export const searchArticles = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      throw createError("Search query too short.", 400);
    }

    const cleanQuery = query.toLowerCase().trim();

    // Firestore doesn't support full-text search natively
    // Search by tags array for now
    // In production this would use Algolia or similar
    const snapshot = await db
      .collection(CONSTANTS.COLLECTIONS.LIBRARY)
      .where("tags", "array-contains", cleanQuery)
      .limit(10)
      .get();

    const articles = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      articles.push({
        articleId: doc.id,
        category: data.category,
        title: data.title,
        summary: data.summary,
        readingTime: data.readingTime,
        tags: data.tags
      });
    });

    return articles;

  } catch (err) {
    if (err.status) throw err;
    throw createError("Search failed.", 500);
  }
};


// ─── Seed initial library articles ───────────────────────────────
// Run once to populate the library collection
export const seedLibrary = async () => {
  const articles = [
    {
      category: "renting-housing",
      title: "What your landlord is legally required to fix",
      summary: "Landlords must maintain heating, plumbing, and structural safety — always, regardless of what your lease says.",
      content: `
# What Your Landlord Is Legally Required to Fix

## The One-Line Answer
Your landlord must keep your home habitable. This is called the implied warranty of habitability and it exists in almost every US state.

## What This Means in Plain English
Regardless of what your lease says, your landlord must maintain:
- Heating and hot water
- Plumbing and electrical systems
- Structural safety (roof, walls, floors)
- Protection from weather
- Freedom from pest infestations
- Working locks and security

## What the Law Says
Most states codify this under their civil or property codes. In California, it is Civil Code Section 1941. In New York, it is Multiple Dwelling Law Section 78. The specific code varies by state but the principle is universal.

## What You Can Do If This Is Violated
1. Document everything — photograph the issue with timestamps
2. Send a written repair request to your landlord
3. Give a reasonable deadline (usually 30 days for non-emergency, 24 hours for emergencies)
4. If unresolved, you may have the right to repair and deduct, withhold rent, or break the lease depending on your state

## What Lex Can Help You Do
Use Document X-Ray to check if your lease contains any clauses that try to waive these rights — most such clauses are unenforceable.
      `.trim(),
      readingTime: "4 min",
      tags: [
        "landlord", "tenant", "repairs", "habitability",
        "heating", "plumbing", "renting"
      ],
      jurisdiction: "all",
      publishedAt: new Date().toISOString()
    },
    {
      category: "work-employment",
      title: "When being fired is actually illegal",
      summary: "Not every termination is legal. Learn what wrongful termination actually means and how to recognise it.",
      content: `
# When Being Fired Is Actually Illegal

## The One-Line Answer
Firing someone for discriminatory reasons, in retaliation for exercising their rights, or in violation of a contract is illegal — regardless of whether your state is at-will.

## What This Means in Plain English
While most US states allow employers to fire employees for almost any reason (at-will employment), there are important exceptions that protect workers.

## Illegal Reasons to Fire Someone
- Race, gender, age, religion, national origin, or disability
- Reporting illegal activity (whistleblowing)
- Filing a workers compensation claim
- Taking legally protected leave (FMLA)
- Participating in a union or organising activity
- Reporting workplace harassment or discrimination

## What the Law Says
Title VII of the Civil Rights Act prohibits discrimination. The Age Discrimination in Employment Act protects workers over 40. The Americans with Disabilities Act protects disabled workers. State laws often add additional protections.

## What You Can Do
1. Document everything — emails, messages, performance reviews
2. Note the timing — retaliation often happens shortly after a protected action
3. File a charge with the EEOC within 180 days (or 300 in some states)
4. Consult an employment attorney — many work on contingency

## What Lex Can Help You Do
Use Rights Navigator to identify which specific protections apply to your situation and Deadline Tracker to make sure you do not miss the EEOC filing window.
      `.trim(),
      readingTime: "6 min",
      tags: [
        "fired", "termination", "wrongful termination",
        "employment", "discrimination", "retaliation", "eeoc"
      ],
      jurisdiction: "all",
      publishedAt: new Date().toISOString()
    },
    {
      category: "debt-consumer",
      title: "What debt collectors are never allowed to do",
      summary: "The Fair Debt Collection Practices Act gives you powerful rights against abusive debt collectors.",
      content: `
# What Debt Collectors Are Never Allowed to Do

## The One-Line Answer
The Fair Debt Collection Practices Act (FDCPA) prohibits debt collectors from harassing, deceiving, or abusing you — and gives you the right to make them stop contacting you entirely.

## What Debt Collectors Cannot Do
- Call before 8am or after 9pm
- Call your workplace if you have told them not to
- Use abusive or threatening language
- Lie about the amount you owe
- Threaten legal action they do not intend to take
- Contact you after you have sent a written cease communication request
- Discuss your debt with anyone except you, your spouse, or your attorney

## Your Most Powerful Right
You can send a written cease communication letter. Once received, the collector must stop contacting you except to confirm they are stopping or to notify you of a specific legal action.

## What the Law Says
The FDCPA (15 U.S.C. 1692) applies to third-party debt collectors. Many states have additional laws that also cover original creditors.

## What You Can Do
1. Document every call — date, time, what was said
2. Send a cease communication letter via certified mail
3. File a complaint with the CFPB and your state attorney general
4. Sue for violations — the FDCPA allows you to sue for up to $1000 per violation

## What Lex Can Help You Do
Use Signal to generate a formal cease communication letter that cites the FDCPA specifically.
      `.trim(),
      readingTime: "5 min",
      tags: [
        "debt", "debt collector", "fdcpa", "harassment",
        "collection", "consumer rights"
      ],
      jurisdiction: "all",
      publishedAt: new Date().toISOString()
    },
    {
      category: "traffic-road-safety",
      title: "What to do after a road accident in the city",
      summary: "A quick guide to challans, insurance claims, and the FIR process after an accident.",
      content: `
# What to Do After a Road Accident in the City

## The One-Line Answer
If you are hurt or damage occurs, document the scene, file a police report, and notify your insurer quickly.

## What This Means in Plain English
In busy city traffic, the first priority is safety and proof. Take photos, collect witness names, and make sure the police register the complaint.

## What the Law Says
In India, an accident involving injury or death must be reported to the police immediately. The Motor Vehicles Act also requires you to inform your insurer for any claim.

## What You Can Do
- Stop safely and move vehicles only if necessary.
- Take pictures of damage and the registration numbers.
- Ask the traffic police to record the accident and issue a challan if applicable.
- Report to your insurer within 24 hours.

## What Lex Can Help You Do
Use Lex to understand which documents to save, how to describe the accident clearly, and how to preserve evidence for a claim.
      `.trim(),
      readingTime: "4 min",
      tags: [
        "accident", "road safety", "insurance", "traffic", "FIR",
        "Mumbai", "Pune", "Delhi"
      ],
      jurisdiction: "India",
      publishedAt: new Date().toISOString()
    },
    {
      category: "renting-housing",
      title: "How to handle a rent dispute with your landlord",
      summary: "Know your rights when your landlord refuses repairs, delays deposit refunds, or serves an unfair eviction notice.",
      content: `
# How to Handle a Rent Dispute With Your Landlord

## The One-Line Answer
Your landlord cannot illegally evict you or avoid repairs; document the issue and use written notice before taking the next step.

## What This Means in Plain English
You have the right to a safe home, a fair notice period, and a return of your security deposit unless there are valid deductions.

## What the Law Says
Most states in India expect landlords to keep rented premises in a habitable condition and give proper notice before eviction. Local rent control and municipal rules may also apply.

## What You Can Do
- Send a written repair request and keep a copy.
- Keep rent receipts and an agreement copy.
- Ask for a written explanation for deposit deductions.
- If the landlord tries to force eviction, seek help from a local rent tribunal or tenant rights group.

## What Lex Can Help You Do
Lex can help you identify unfair clauses, draft a repair or notice response, and understand the deadlines for your state.
      `.trim(),
      readingTime: "5 min",
      tags: [
        "landlord", "tenant", "rent", "deposit", "eviction",
        "Maharashtra", "Pune", "Mumbai"
      ],
      jurisdiction: "India",
      publishedAt: new Date().toISOString()
    }
  ];

  const batch = db.batch();
  articles.forEach(article => {
    const ref = db.collection(CONSTANTS.COLLECTIONS.LIBRARY).doc();
    batch.set(ref, article);
  });

  await batch.commit();
  console.log(`✓ Seeded ${articles.length} library articles`);
};
