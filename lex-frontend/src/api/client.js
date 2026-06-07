import axios from "axios"
import { getIdToken } from "../firebase/auth.js"
import { auth } from "../firebase/firebase.js"

const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 60000
})

client.interceptors.request.use(
  async (config) => {
    try {
      const token = await getIdToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.warn("[API] No Firebase token available for request:", config.url)
      }
    } catch (err) {
      console.error("[API] Failed to get token:", err)
    }

    return config
  },
  (error) => Promise.reject(error)
)

client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true

      try {
        if (auth.currentUser) {
          const freshToken = await auth.currentUser.getIdToken(true)
          originalRequest.headers.Authorization = `Bearer ${freshToken}`
          return client(originalRequest)
        }
      } catch {
        window.dispatchEvent(new CustomEvent("auth:expired"))
      }
    }

    const message = error.response?.data?.error || error.message || "Something went wrong"
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:expired"))
    }

    return Promise.reject(new Error(message))
  }
)

export default client
