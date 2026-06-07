import { useContext } from "react"
import { SessionContext } from "./SessionContextValue.js"

export const useSessionContext = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSessionContext must be used inside SessionProvider")
  }
  return context
}
