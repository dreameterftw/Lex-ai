import { useState } from "react"
import { login, signup, logout, resetPassword } from "../firebase/auth.js"

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      return true
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : err.message
      )
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      await signup(email, password)
      return true
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists"
          : err.message
      )
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleResetPassword = async (email) => {
    setLoading(true)
    setError(null)
    try {
      await resetPassword(email)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    handleLogin,
    handleSignup,
    handleLogout,
    handleResetPassword,
    loading,
    error,
    clearError: () => setError(null)
  }
}
