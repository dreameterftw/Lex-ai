import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Check, Eye, EyeOff, Scale } from "lucide-react"
import { signup } from "../firebase/auth.js"
import { createSession } from "../api/sessionApi.js"
import { INDIAN_JURISDICTIONS } from "../utils/indiaJurisdictions.js"

const BENEFITS = [
  "Understand legal documents in minutes",
  "Know which rights apply to your situation",
  "Track deadlines before they become problems",
  "Generate formal letters when you need to act",
]

const getSignupError = (code, fallback) => {
  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists."
  }
  if (code === "auth/invalid-email") {
    return "Enter a valid email address."
  }
  if (code === "auth/weak-password") {
    return "Password must be at least 6 characters."
  }
  return fallback || "Something went wrong. Please try again."
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordStrong = password.length >= 8
  const passwordMatch = password === confirmPassword && confirmPassword.length > 0
  const canSubmit = passwordStrong && passwordMatch && jurisdiction && !loading

  useEffect(() => {
    document.title = "Create Account - LEX"
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!passwordStrong) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (!passwordMatch) {
      setError("Passwords do not match.")
      return
    }
    if (!jurisdiction) {
      setError("Please select your jurisdiction.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const credential = await signup(email.trim(), password)
      await credential.user.getIdToken(true)
      await createSession(jurisdiction)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(getSignupError(err?.code, err?.message))
    } finally {
      setLoading(false)
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
            Everything the legal system
            <br />
            <span className="text-brass-soft italic">forgot to tell you.</span>
          </p>
          <div className="mt-8 space-y-4">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brass/20">
                  <Check className="h-2.5 w-2.5 text-brass-soft" />
                </span>
                <p className="text-sm text-white/70">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-white/40">
          <span>Free to start</span>
          <span aria-hidden="true">/</span>
          <span>No credit card</span>
          <span aria-hidden="true">/</span>
          <span>No legal jargon</span>
        </div>
      </section>

      <section className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-12 sm:px-12 lg:px-20">
        <Link to="/" className="mb-12 flex items-center gap-2 lg:hidden">
          <Scale className="h-5 w-5" strokeWidth={1.5} />
          <span className="font-display text-xl tracking-tight">LEX</span>
        </Link>

        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
            Get started.
          </p>
          <h1 className="mt-3 font-display text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-2 transition-colors hover:text-brass">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
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
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your state or union territory</span>
              <select
                required
                value={jurisdiction}
                onChange={(event) => setJurisdiction(event.target.value)}
                className="mt-2 w-full cursor-pointer border-b border-border bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-brass"
              >
                <option value="" disabled>
                  Select your state or union territory
                </option>
                {INDIAN_JURISDICTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Min. 8 characters"
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
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className={`h-0.5 flex-1 rounded-full ${passwordStrong ? "bg-brass" : "bg-destructive/40"}`} />
                  <span className={`text-[10px] ${passwordStrong ? "text-brass" : "text-muted-foreground"}`}>
                    {passwordStrong ? "Strong" : "Too short"}
                  </span>
                </div>
              )}
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Confirm password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  className="mt-2 w-full border-b border-border bg-transparent py-2 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-brass"
                />
                {confirmPassword.length > 0 && (
                  <span className={`absolute right-0 top-1/2 -translate-y-1/4 ${passwordMatch ? "text-brass" : "text-destructive"}`}>
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="group inline-flex w-full items-center justify-between gap-4 rounded-md bg-ink px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account - it is free"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <p className="text-xs leading-relaxed text-muted-foreground">
              LEX provides legal clarity, not legal advice. For complex matters, consult a qualified lawyer.
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
