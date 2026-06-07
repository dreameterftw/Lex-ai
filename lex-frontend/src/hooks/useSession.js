import { useState } from "react"
import { createSession } from "../api/sessionApi.js"
import { useSessionContext } from "../context/useSessionContext.js"

export const useSession = () => {
  const { session, loadSession, refreshSession, clearSession } = useSessionContext()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const startNewSession = async (jurisdiction) => {
    setCreating(true)
    setError(null)
    try {
      const data = await createSession(jurisdiction)
      await loadSession(data.sessionId)
      return data.sessionId
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setCreating(false)
    }
  }

  return {
    session,
    creating,
    error,
    startNewSession,
    loadSession,
    refreshSession,
    clearSession
  }
}
