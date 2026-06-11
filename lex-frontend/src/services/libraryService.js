import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from "firebase/firestore"
import { db } from "../firebase/firebase.js"
import CONSTANTS from "./ai/constants.js"

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
]

export const getCategories = () => LIBRARY_CATEGORIES

export const getArticlesByCategory = async (categoryId) => {
  try {
    // Query only by category to avoid requiring a composite index for orderBy
    const articlesQuery = query(
      collection(db, CONSTANTS.COLLECTIONS.LIBRARY),
      where("category", "==", categoryId)
    )
    const snapshot = await getDocs(articlesQuery)

    const results = snapshot.docs.map((articleDoc) => {
      const data = articleDoc.data()
      return {
        articleId: articleDoc.id,
        category: data.category,
        title: data.title,
        summary: data.summary,
        readingTime: data.readingTime,
        tags: data.tags,
        publishedAt: data.publishedAt
      }
    })

    // Sort client-side by publishedAt (descending). This avoids Firestore composite index requirements.
    return results.sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) || 0 : 0
      const tb = b.publishedAt ? Date.parse(b.publishedAt) || 0 : 0
      return tb - ta
    })
  } catch (err) {
    console.error("Failed to fetch articles by category:", err)
    return []
  }
}

export const getArticle = async (articleId) => {
  const articleDoc = await getDoc(doc(db, CONSTANTS.COLLECTIONS.LIBRARY, articleId))
  if (!articleDoc.exists()) throw new Error("Article not found.")
  return { articleId: articleDoc.id, ...articleDoc.data() }
}

export const searchArticles = async (searchQuery) => {
  if (!searchQuery || searchQuery.trim().length < 2) {
    throw new Error("Search query too short.")
  }

  const cleanQuery = searchQuery.toLowerCase().trim()
  const articlesQuery = query(
    collection(db, CONSTANTS.COLLECTIONS.LIBRARY),
    where("tags", "array-contains", cleanQuery),
    limit(10)
  )
  const snapshot = await getDocs(articlesQuery)

  return snapshot.docs.map((articleDoc) => {
    const data = articleDoc.data()
    return {
      articleId: articleDoc.id,
      category: data.category,
      title: data.title,
      summary: data.summary,
      readingTime: data.readingTime,
      tags: data.tags
    }
  })
}
