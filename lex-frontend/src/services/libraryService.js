import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
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
  },
  {
    id: "legal-system",
    title: "How the Legal System Works",
    description: "Courts, free legal aid, Lok Adalat, your constitutional rights"
  }
]

export const getCategories = () => LIBRARY_CATEGORIES

// ── Article list queries ──────────────────────────────────────────────────────

export const getArticlesByCategory = async (categoryId) => {
  try {
    // Query only by category — client-side sort avoids needing a composite Firestore index
    const articlesQuery = query(
      collection(db, CONSTANTS.COLLECTIONS.LIBRARY),
      where("category", "==", categoryId)
    )
    const snapshot = await getDocs(articlesQuery)

    const results = snapshot.docs.map((articleDoc) => {
      const data = articleDoc.data()
      return {
        articleId: articleDoc.id,
        type:        data.type,
        category:    data.category,
        title:       data.title,
        subtitle:    data.subtitle,
        summary:     data.summary,
        readingTime: data.readingTime,
        difficulty:  data.difficulty,
        tags:        data.tags,
        featured:    data.featured,
        publishedAt: data.publishedAt,
        // Landmark-case extras
        year:        data.year,
        court:       data.court
      }
    })

    // Sort client-side: featured first, then by publishedAt descending
    return results.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      const ta = a.publishedAt ? Date.parse(a.publishedAt) || 0 : 0
      const tb = b.publishedAt ? Date.parse(b.publishedAt) || 0 : 0
      return tb - ta
    })
  } catch (err) {
    console.error("Failed to fetch articles by category:", err)
    return []
  }
}

// Returns featured articles across all categories (for a homepage highlight strip)
export const getFeaturedArticles = async (maxItems = 6) => {
  try {
    const q = query(
      collection(db, CONSTANTS.COLLECTIONS.LIBRARY),
      where("featured", "==", true),
      limit(maxItems)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => {
      const data = d.data()
      return {
        articleId:   d.id,
        type:        data.type,
        category:    data.category,
        title:       data.title,
        subtitle:    data.subtitle,
        summary:     data.summary,
        readingTime: data.readingTime,
        difficulty:  data.difficulty,
        tags:        data.tags,
        publishedAt: data.publishedAt
      }
    })
  } catch (err) {
    console.error("Failed to fetch featured articles:", err)
    return []
  }
}

// Returns all landmark-case documents
export const getLandmarkCases = async () => {
  try {
    const q = query(
      collection(db, CONSTANTS.COLLECTIONS.LIBRARY),
      where("type", "==", "landmark-case")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => {
      const data = d.data()
      return {
        articleId:   d.id,
        type:        data.type,
        category:    data.category,
        title:       data.title,
        subtitle:    data.subtitle,
        summary:     data.summary,
        readingTime: data.readingTime,
        tags:        data.tags,
        featured:    data.featured,
        year:        data.year,
        court:       data.court,
        publishedAt: data.publishedAt
      }
    })
  } catch (err) {
    console.error("Failed to fetch landmark cases:", err)
    return []
  }
}

// Returns all India vs World comparison documents
export const getComparisonArticles = async () => {
  try {
    const q = query(
      collection(db, CONSTANTS.COLLECTIONS.LIBRARY),
      where("type", "==", "comparison")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => {
      const data = d.data()
      return {
        articleId:   d.id,
        type:        data.type,
        category:    data.category,
        title:       data.title,
        subtitle:    data.subtitle,
        summary:     data.summary,
        readingTime: data.readingTime,
        tags:        data.tags,
        publishedAt: data.publishedAt
      }
    })
  } catch (err) {
    console.error("Failed to fetch comparison articles:", err)
    return []
  }
}

// ── Single article ────────────────────────────────────────────────────────────

export const getArticle = async (articleId) => {
  const articleDoc = await getDoc(doc(db, CONSTANTS.COLLECTIONS.LIBRARY, articleId))
  if (!articleDoc.exists()) throw new Error("Article not found.")
  return { articleId: articleDoc.id, ...articleDoc.data() }
}

// ── Search ────────────────────────────────────────────────────────────────────

export const searchArticles = async (searchQuery) => {
  if (!searchQuery || searchQuery.trim().length < 2) {
    throw new Error("Search query too short.")
  }

  const cleanQuery = searchQuery.toLowerCase().trim()

  // Primary: exact tag match (fast, indexed)
  const tagQuery = query(
    collection(db, CONSTANTS.COLLECTIONS.LIBRARY),
    where("tags", "array-contains", cleanQuery),
    limit(10)
  )
  const tagSnapshot = await getDocs(tagQuery)

  if (!tagSnapshot.empty) {
    return tagSnapshot.docs.map((d) => {
      const data = d.data()
      return {
        articleId:   d.id,
        type:        data.type,
        category:    data.category,
        title:       data.title,
        subtitle:    data.subtitle,
        summary:     data.summary,
        readingTime: data.readingTime,
        tags:        data.tags
      }
    })
  }

  // Fallback: client-side title/summary substring match across all docs
  const allSnapshot = await getDocs(collection(db, CONSTANTS.COLLECTIONS.LIBRARY))
  return allSnapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter(
      (item) =>
        item.title?.toLowerCase().includes(cleanQuery) ||
        item.summary?.toLowerCase().includes(cleanQuery)
    )
    .slice(0, 10)
    .map((item) => ({
      articleId:   item.id,
      type:        item.type,
      category:    item.category,
      title:       item.title,
      subtitle:    item.subtitle,
      summary:     item.summary,
      readingTime: item.readingTime,
      tags:        item.tags
    }))
}
