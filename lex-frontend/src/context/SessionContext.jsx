import { useState, useCallback } from "react"
import { getSession } from "../api/sessionApi.js"
import { SessionContext } from "./SessionContextValue.js"

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState(null)

  const loadSession = useCallback(async (sessionId) => {
    setSessionLoading(true)
    setSessionError(null)
    try {
      const data = await getSession(sessionId)
      setSession(data)
    } catch (err) {
      setSessionError(err.message)
    } finally {
      setSessionLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    if (!session?.sessionId) return
    await loadSession(session.sessionId)
  }, [session, loadSession])

  const clearSession = useCallback(() => {
    setSession(null)
    setSessionError(null)
  }, [])

  return (
    <SessionContext.Provider value={{
      session,
      sessionLoading,
      sessionError,
      loadSession,
      refreshSession,
      clearSession
    }}>
      {children}
    </SessionContext.Provider>
  )
}
