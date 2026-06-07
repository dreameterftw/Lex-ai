import { useEffect, useState } from "react"
import { db } from "../firebase/firebase.js"
import { doc, onSnapshot } from "firebase/firestore"

export const useDeadlines = (sessionId) => {
  const [deadlines, setDeadlines] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    const unsubscribe = onSnapshot(
      doc(db, "sessions", sessionId),
      (snap) => {
        if (snap.exists()) {
          setDeadlines(snap.data()?.context?.deadlines || null)
        }
        setLoading(false)
      },
      (err) => {
        console.error("Deadline listener error:", err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [sessionId])

  return { deadlines, loading }
}
