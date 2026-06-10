import { collection, doc, getDocs, orderBy, query, setDoc, limit } from "firebase/firestore"
import { db } from "../firebase/firebase.js"
import CONSTANTS from "./ai/constants.js"

export const getHealthCheckQuestions = () => {
  return [
    {
      id: "housing",
      question: "Do you currently rent your primary residence?",
      type: "boolean"
    },
    {
      id: "employment",
      question: "Are you employed full-time, part-time, or as a contractor?",
      type: "choice",
      options: ["Full-time", "Part-time", "Contractor", "Unemployed/Other"]
    },
    {
      id: "debt",
      question: "Do you have any outstanding debts in collection?",
      type: "boolean"
    },
    {
      id: "family",
      question: "Are you married, or do you have any dependents?",
      type: "boolean"
    },
    {
      id: "business",
      question: "Do you own a small business or operate as a sole proprietor?",
      type: "boolean"
    }
  ]
}

export const saveHealthCheckResult = async (userId, result) => {
  const checkId = `hc_${Date.now()}`
  // Use a subcollection for health checks
  const docRef = doc(db, CONSTANTS.COLLECTIONS.USERS, userId, "healthChecks", checkId)
  
  const healthCheckData = {
    ...result,
    createdAt: new Date().toISOString()
  }

  await setDoc(docRef, healthCheckData)
  return healthCheckData
}

export const getLastHealthCheck = async (userId) => {
  const hcQuery = query(
    collection(db, CONSTANTS.COLLECTIONS.USERS, userId, "healthChecks"),
    orderBy("createdAt", "desc"),
    limit(1)
  )
  
  const snapshot = await getDocs(hcQuery)
  if (snapshot.empty) return null
  
  return snapshot.docs[0].data()
}
