/**
 * LEX Library Dedup Script
 * Reads all documents in the library collection, keeps the first occurrence
 * of each title (by Firestore document ID order), and deletes all duplicates.
 */
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore"

const app = initializeApp({
  apiKey:    process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  process.env.VITE_FIREBASE_PROJECT_ID,
})
const db = getFirestore(app)

console.log("\n🔍 LEX Library Dedup Script")
console.log("────────────────────────────────────")

const snap = await getDocs(collection(db, "library"))
const docs = snap.docs.map(d => ({ id: d.id, title: d.data().title, publishedAt: d.data().publishedAt }))

console.log(`   Total documents: ${docs.length}`)

// Keep the first occurrence per title, collect duplicates
const seen = {}
const toDelete = []

// Sort by publishedAt so we keep the earliest/original version
const sorted = [...docs].sort((a, b) => {
  const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
  const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
  return ta - tb
})

sorted.forEach(d => {
  const key = d.title?.trim().toLowerCase()
  if (!key) return
  if (seen[key]) {
    toDelete.push(d)
  } else {
    seen[key] = d.id
  }
})

console.log(`   Unique titles:   ${Object.keys(seen).length}`)
console.log(`   Duplicates:      ${toDelete.length}`)
console.log("────────────────────────────────────\n")

if (toDelete.length === 0) {
  console.log("✅ No duplicates found. Collection is clean.")
  process.exit(0)
}

console.log("🗑  Deleting duplicates...\n")
let deleted = 0
let failed  = 0

for (const d of toDelete) {
  try {
    await deleteDoc(doc(db, "library", d.id))
    console.log(`   ✓ Deleted: ${d.id} | ${d.title?.slice(0, 60)}`)
    deleted++
  } catch (err) {
    console.error(`   ✗ Failed:  ${d.id} | ${err.message}`)
    failed++
  }
}

console.log("\n────────────────────────────────────")
console.log(`✅ Deleted: ${deleted} duplicates`)
if (failed > 0) console.log(`❌ Failed:  ${failed}`)
console.log(`📚 Remaining documents: ${docs.length - deleted}`)
console.log("\nDone.\n")
process.exit(failed > 0 ? 1 : 0)
