import { useContext } from "react"
import { AuthContext } from "./AuthContextValue.js"

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider")
  }
  return context
}
