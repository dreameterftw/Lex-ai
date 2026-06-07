import { useEffect, useState } from "react"
import { onAuthChange } from "../firebase/auth.js"
import { AuthContext } from "./AuthContextValue.js"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    const handleExpiry = () => {
      setUser(null)
    }
    window.addEventListener("auth:expired", handleExpiry)

    return () => {
      unsubscribe()
      window.removeEventListener("auth:expired", handleExpiry)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
