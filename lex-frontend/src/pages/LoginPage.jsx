import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Eye, EyeOff, Scale } from "lucide-react"
import { login, resetPassword } from "../firebase/auth.js"

const getLoginError = (code) => {
  if (
    code === "auth/invalid-credential" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password"
  ) {
    return "Invalid email or password."
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a moment before trying again."
  }
  if (code === "auth/invalid-email") {
    return "Enter a valid email address."
  }
  return "Something went wrong. Please try again."
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    document.title = "Sign In - LEX"
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setNotice("")

    try {
      await login(email.trim(), password)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(getLoginError(err?.code))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Enter your email address first, then request a reset link.")
      return
    }

    setResetting(true)
    setError("")
    setNotice("")

    try {
      await resetPassword(email.trim())
      setNotice("Password reset email sent. Check your inbox.")
    } catch (err) {
      setError(getLoginError(err?.code))
    } finally {
      setResetting(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <section className="hidden w-1/2 flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <Scale className="h-5 w-5" strokeWidth={1.5} />
          <span className="font-display text-xl tracking-tight">LEX</span>
        </Link>

        <div>
          <p className="font-display text-4xl leading-snug">
            The law protects everyone equally -
            <br />
            <span className="text-brass-soft italic">but only if you know it exists.</span>
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
            Sign in to access your legal sessions, active deadlines, and Lex Counsel exactly where you left them.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-white/40">
          <span>Jurisdiction-anchored</span>
          <span aria-hidden="true">/</span>
          <span>AI-assisted</span>
          <span aria-hidden="true">/</span>
          <span>Private by design</span>
        </div>
      </section>

      <section className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link to="/" className="mb-12 flex items-center gap-2 lg:hidden">
          <Scale className="h-5 w-5" strokeWidth={1.5} />
          <span className="font-display text-xl tracking-tight">LEX</span>
        </Link>

        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
            Welcome back.
          </p>
          <h1 className="mt-3 font-display text-3xl">Sign in to LEX</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-foreground underline underline-offset-2 transition-colors hover:text-brass">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {notice && (
              <div className="rounded-md border border-brass/30 bg-brass/10 px-4 py-3 text-sm text-foreground">
                {notice}
              </div>
            )}

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-brass"
              />
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="mt-2 w-full border-b border-border bg-transparent py-2 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-brass"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-0 top-1/2 -translate-y-1/4 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resetting ? "Sending reset..." : "Forgot password?"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-between gap-4 rounded-md bg-ink px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
