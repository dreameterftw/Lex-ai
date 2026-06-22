/**
 * LEX Library Seed Script
 *
 * Populates the Firestore "library" collection with articles, landmark cases,
 * and India vs World comparisons.
 *
 * Usage:
 *   node --env-file=.env scripts/seedLibrary.js
 *   node --env-file=.env scripts/seedLibrary.js --clear   (wipe first, then seed)
 *
 * Requirements:
 *   Node 20+ (for --env-file flag)
 *   Firebase project credentials in .env (VITE_FIREBASE_* vars)
 */

import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore"

import { rentingHousingArticles } from "./content/rentingHousing.js"
import { workEmploymentArticles }  from "./content/workEmployment.js"
import { policeRightsArticles }    from "./content/policeRights.js"
import { legalSystemArticles }     from "./content/legalSystem.js"
import { landmarkCases }           from "./content/landmarkCases.js"
import { indiaVsWorldArticles }    from "./content/indiaVsWorld.js"
import { situationArticles }       from "./content/situations.js"
import { realCases }               from "./content/realCases.js"
import { rentingHousingExtendedArticles } from "./content/rentingHousingExtended.js"
import { workEmploymentExtendedArticles } from "./content/workEmploymentExtended.js"
import { consumerRightsArticles }  from "./content/consumerRights.js"
import { familyLawArticles }       from "./content/familyLaw.js"
import { policeCriminalArticles }  from "./content/policeCriminal.js"

// ── Firebase config (reads VITE_ vars from .env via --env-file) ───────────────
const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID
}

// Validate config before connecting
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missingKeys.length > 0) {
  console.error("\n❌ Missing Firebase config keys:")
  missingKeys.forEach((k) => console.error(`   - ${k}`))
  console.error(
    "\nMake sure your .env file is in lex-frontend/ and contains all VITE_FIREBASE_* variables."
  )
  console.error("Run from inside lex-frontend/:\n   node --env-file=.env scripts/seedLibrary.js\n")
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

const COLLECTION = "library"

// ── All content ───────────────────────────────────────────────────────────────
const ALL_CONTENT = [
  ...rentingHousingArticles,
  ...workEmploymentArticles,
  ...policeRightsArticles,
  ...legalSystemArticles,
  ...landmarkCases,
  ...indiaVsWorldArticles,
  ...situationArticles,
  ...realCases,
  ...rentingHousingExtendedArticles,
  ...workEmploymentExtendedArticles,
  ...consumerRightsArticles,
  ...familyLawArticles,
  ...policeCriminalArticles
]

// ── Type icons for nicer console output ───────────────────────────────────────
const TYPE_ICON = {
  "article":       "📄",
  "landmark-case": "⚖️ ",
  "comparison":    "🌍"
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seedLibrary() {
  const args = process.argv.slice(2)

  console.log("\n📚 LEX Library Seed Script")
  console.log("────────────────────────────────────")
  console.log(`   Firebase project: ${firebaseConfig.projectId}`)
  console.log(`   Collection:       ${COLLECTION}`)
  console.log(`   Documents:        ${ALL_CONTENT.length}`)
  console.log("────────────────────────────────────\n")

  // Optional --clear flag wipes the collection before seeding
  if (args.includes("--clear")) {
    console.log("🗑  --clear flag detected. Clearing existing library documents...\n")
    try {
      const existing = await getDocs(collection(db, COLLECTION))
      if (existing.empty) {
        console.log("   Collection is already empty.\n")
      } else {
        for (const d of existing.docs) {
          await deleteDoc(doc(db, COLLECTION, d.id))
        }
        console.log(`   ✓ Cleared ${existing.size} existing documents.\n`)
      }
    } catch (err) {
      console.error("   ✗ Failed to clear collection:", err.message)
      process.exit(1)
    }
  }

  // Seed all content
  let seeded  = 0
  let failed  = 0

  for (const item of ALL_CONTENT) {
    const icon  = TYPE_ICON[item.type] || "📄"
    const label = item.title.length > 60
      ? item.title.slice(0, 57) + "..."
      : item.title

    try {
      const ref = await addDoc(collection(db, COLLECTION), item)
      console.log(`${icon} ${label}`)
      console.log(`   → ${ref.id}`)
      seeded++
    } catch (err) {
      console.error(`✗  FAILED: ${label}`)
      console.error(`   Error: ${err.message}`)
      failed++
    }
  }

  // Summary
  console.log("\n────────────────────────────────────")
  console.log(`✅ Seeded:  ${seeded} documents`)
  if (failed > 0) {
    console.log(`❌ Failed:  ${failed} documents`)
  }

  // Breakdown by type
  const byType = ALL_CONTENT.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})
  console.log("\nBreakdown:")
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${TYPE_ICON[type] || "📄"} ${type}: ${count}`)
  })

  console.log("\nLibrary seed complete.")
  console.log("The library page reads from Firestore automatically — nothing else to do.\n")

  process.exit(failed > 0 ? 1 : 0)
}

seedLibrary().catch((err) => {
  console.error("\n❌ Seed script crashed:", err.message)
  process.exit(1)
})
