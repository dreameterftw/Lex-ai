import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronRight, Scale } from "lucide-react"
import { logout } from "../../firebase/auth.js"
import { SESSION_FEATURES } from "./sessionFeatures.js"

export function AppLayout({
  children,
  sessionId,
  currentFeature,
  backTo = "/dashboard",
  backLabel = "Dashboard",
}) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <div className="relative flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to={backTo} className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" />
                {backLabel}
              </Link>

              {sessionId && currentFeature && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <span className="text-xs font-medium capitalize">{currentFeature}</span>
                </>
              )}
            </div>

            <Link to="/dashboard" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <Scale className="h-4 w-4" strokeWidth={1.5} />
              <span className="font-display text-lg tracking-tight">LEX</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {sessionId && (
        <div className="overflow-x-auto border-b border-border bg-background">
          <div className="mx-auto max-w-6xl px-5 md:px-10">
            <div className="flex items-center">
              {SESSION_FEATURES.map((feature) => (
                <Link
                  key={feature.key}
                  to={`/${feature.path}/${sessionId}`}
                  className={`relative shrink-0 px-4 py-3 text-xs font-medium transition-colors ${
                    currentFeature === feature.key
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {feature.label}
                  {currentFeature === feature.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-12">
        {children}
      </main>
    </div>
  )
}
