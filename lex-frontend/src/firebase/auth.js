import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth"
import { auth } from "./firebase.js"

export const signup = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const logout = () => signOut(auth)

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email)

export const getIdToken = () => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      auth.currentUser.getIdToken(false)
        .then(resolve)
        .catch(() => resolve(null))
      return
    }

    let unsubscribe = () => {}
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      if (!user) {
        resolve(null)
        return
      }

      try {
        const token = await user.getIdToken(false)
        resolve(token)
      } catch {
        resolve(null)
      }
    })
  })
}

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback)
