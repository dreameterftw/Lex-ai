import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  FileSearch,
  HeartPulse,
  LogOut,
  Plus,
  Scale,
} from "lucide-react"
import { logout } from "../firebase/auth.js"
import { createSession, getAllSessions } from "../api/sessionApi.js"
import { getUnreadCount } from "../api/alertsApi.js"
import { useAuthContext } from "../context/useAuthContext.js"
import { INDIAN_JURISDICTIONS } from "../utils/indiaJurisdictions.js"

const URGENCY_COLOR = {
  Critical: "border-red-200 bg-red-50 text-red-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
  Low: "border-green-200 bg-green-50 text-green-700",
}

const STATUS_COLOR = {
  active: "bg-brass/10 text-brass",
  resolved: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
}

const getPayload = (response, fallback) => response?.data ?? fallback

function formatDate(value) {
  if (!value) return "Not updated yet"
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function SessionCard({ session }) {
  const hasDeadlines = session.summary?.activeDeadlines > 0
  const hasDocument = session.summary?.hasDocument
  const situationName = session.summary?.situationCategory || "New situation"
  const severity = session.summary?.severity

  return (
    <Link
      to={`/situation/${session.sessionId}`}
      className="group flex items-center gap-5 rounded-lg border border-border bg-card px-5 py-4 transition-all hover:border-brass/40 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-muted transition-colors group-hover:bg-brass/10">
        <FileSearch className="h-5 w-5 text-brass" strokeWidth={1.4} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{situationName}</p>
          {severity && (
            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${URGENCY_COLOR[severity] || URGENCY_COLOR.Low}`}>
              {severity}
            </span>
          )}
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLOR[session.status] || STATUS_COLOR.active}`}>
            {session.status || "active"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{session.jurisdiction}</span>
          <span>Updated {formatDate(session.updatedAt || session.createdAt)}</span>
          {hasDocument && (
            <span className="flex items-center gap-1">
              <FileSearch className="h-3 w-3" />
              Document
            </span>
          )}
          {hasDeadlines && (
            <span className="flex items-center gap-1 text-orange-600">
              <Clock className="h-3 w-3" />
              {session.summary.activeDeadlines} deadline{session.summary.activeDeadlines !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
    </Link>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [sessions, setSessions] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [creating, setCreating] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [jurisdiction, setJurisdiction] = useState("")
  const [formError, setFormError] = useState("")

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status === "active"),
    [sessions]
  )
  const resolvedSessions = useMemo(
    () => sessions.filter((session) => session.status !== "active"),
    [sessions]
  )

  useEffect(() => {
    document.title = "Dashboard - LEX"

    const loadData = async () => {
      setLoading(true)
      setLoadError("")

      try {
        const [sessionsResponse, alertsResponse] = await Promise.all([
          getAllSessions(),
          getUnreadCount(),
        ])
        setSessions(getPayload(sessionsResponse, []))
        setUnread(getPayload(alertsResponse, { unreadCount: 0 })?.unreadCount || 0)
      } catch (err) {
        setLoadError(err.message || "Failed to load your dashboard.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleNewSession = async (event) => {
    event.preventDefault()
    if (!jurisdiction.trim()) {
      setFormError("Please select a jurisdiction.")
      return
    }

    setCreating(true)
    setFormError("")

    try {
      const response = await createSession(jurisdiction)
      const session = getPayload(response, null)
      navigate(`/situation/${session.sessionId}`)
    } catch (err) {
      setFormError(err.message || "Failed to create session.")
    } finally {
      setCreating(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Scale className="h-4 w-4" strokeWidth={1.5} />
              <span className="font-display text-lg tracking-tight">LEX</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="relative p-1.5 text-muted-foreground" title={`${unread} unread alert${unread === 1 ? "" : "s"}`}>
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brass text-[8px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>

              <Link to="/library" className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex">
                <BookOpen className="h-3.5 w-3.5" />
                Library
              </Link>

              <Link to="/health-check" className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex">
                <HeartPulse className="h-3.5 w-3.5" />
                Health Check
              </Link>

              <div className="flex items-center gap-3 border-l border-border pl-4">
                <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:block">
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
              Your sessions.
            </p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">Legal Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Each session tracks one legal situation: its documents, rights, deadlines, and correspondence.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewForm((current) => !current)}
            className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New situation
          </button>
        </div>

        {showNewForm && (
          <section className="mt-6 rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-lg">Start a new legal session</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Each session is tied to a jurisdiction so LEX can keep guidance location-specific.
            </p>
            <form onSubmit={handleNewSession} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
              <select
                value={jurisdiction}
                onChange={(event) => setJurisdiction(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brass"
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
              <button
                type="submit"
                disabled={creating}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Begin"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
            {formError && <p className="mt-3 text-xs text-destructive">{formError}</p>}
          </section>
        )}

        {loadError && (
          <div className="mt-6 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="mt-20 flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brass border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <section className="mt-20 text-center">
            <Scale className="mx-auto h-10 w-10 text-muted-foreground/30" strokeWidth={1.2} />
            <h2 className="mt-4 font-display text-xl">No legal sessions yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Start your first session to describe your situation and let LEX identify your rights and deadlines.
            </p>
            <button
              type="button"
              onClick={() => setShowNewForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground"
            >
              <Plus className="h-4 w-4" />
              Start your first session
            </button>
          </section>
        ) : (
          <div className="mt-10 space-y-10">
            {activeSessions.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active</h2>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">{activeSessions.length}</span>
                </div>
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <SessionCard key={session.sessionId} session={session} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tools</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {[
                  { icon: HeartPulse, title: "Legal Health Check", desc: "Audit your current legal exposure", to: "/health-check" },
                  { icon: BookOpen, title: "Legal Library", desc: "Read plain-English law guides", to: "/library" },
                  { icon: Bell, title: "Alerts", desc: `${unread} unread notification${unread !== 1 ? "s" : ""}`, to: "/dashboard" },
                ].map((action) => (
                  <Link
                    key={action.title}
                    to={action.to}
                    className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-brass/40 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-muted transition-colors group-hover:bg-brass/10">
                      <action.icon className="h-5 w-5 text-brass" strokeWidth={1.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{action.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>

            {resolvedSessions.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resolved</h2>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">{resolvedSessions.length}</span>
                </div>
                <div className="space-y-3">
                  {resolvedSessions.map((session) => (
                    <SessionCard key={session.sessionId} session={session} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
