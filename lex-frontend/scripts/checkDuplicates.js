import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"

const app = initializeApp({
  apiKey:    process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  process.env.VITE_FIREBASE_PROJECT_ID,
})
const db = getFirestore(app)

const snap = await getDocs(collection(db, "library"))
const docs = snap.docs.map(d => ({ id: d.id, title: d.data().title }))

const seen = {}
const dupes = []
docs.forEach(d => {
  if (seen[d.title]) dupes.push({ id: d.id, title: d.title })
  else seen[d.title] = d.id
})

console.log("Total docs:", docs.length)
console.log("Duplicates to remove:", dupes.length)
dupes.forEach(d => console.log(" -", d.id, "|", d.title?.slice(0, 70)))
process.exit(0)
