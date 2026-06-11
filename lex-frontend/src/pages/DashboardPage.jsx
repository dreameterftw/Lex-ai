import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  FileSearch,
  Filter,
  HeartPulse,
  Lightbulb,
  LogOut,
  Plus,
  Scale,
  Search,
  SlidersHorizontal,
  Sparkles,
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

const URGENCY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3, undefined: 4 }

const STATUS_COLOR = {
  active: "bg-brass/10 text-brass",
  resolved: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
}

const URGENCY_FILTERS = ["All", "Critical", "High", "Medium", "Low"]

const RIGHTS_TIPS = [
  { title: "You can ask for a copy of any FIR", body: "Once an FIR is filed, you're entitled to a free copy. Police cannot refuse this — Section 154(2) CrPC." },
  { title: "Tenant deposits must be refunded with interest in many states", body: "Check your state Rent Control Act. Most require a refund within 30–60 days of vacating, often with interest." },
  { title: "Consumer complaints under ₹50 lakh stay in the district forum", body: "You can file yourself, without a lawyer, and the fee is minimal. Carry the bill, warranty, and written complaints." },
  { title: "A 'show cause' notice is not a verdict", body: "It's an invitation to respond. Reply in writing within the stated period — silence is taken as admission." },
  { title: "Workplace termination usually requires notice or pay-in-lieu", body: "Most full-time roles entitle you to 30+ days notice or equivalent severance. Check your appointment letter." },
]

const getPayload = (response, fallback) => response?.data ?? fallback

function formatDate(value) {
  if (!value) return "Not updated yet"
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

function daysUntil(value) {
  if (!value) return null
  const diff = new Date(value).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function deadlineLabel(days) {
  if (days === null || Number.isNaN(days)) return null
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: "text-red-700 bg-red-50 border-red-200" }
  if (days === 0) return { text: "Due today", tone: "text-red-700 bg-red-50 border-red-200" }
  if (days <= 3) return { text: `in ${days}d`, tone: "text-red-700 bg-red-50 border-red-200" }
  if (days <= 7) return { text: `in ${days}d`, tone: "text-orange-700 bg-orange-50 border-orange-200" }
  if (days <= 30) return { text: `in ${days}d`, tone: "text-yellow-700 bg-yellow-50 border-yellow-200" }
  return { text: `in ${days}d`, tone: "text-muted-foreground bg-muted border-border" }
}

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0)
  const startRef = useRef(null)
  useEffect(() => {
    startRef.current = null
    let raf
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts
      const t = Math.min(1, (ts - startRef.current) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function StatTile({ icon: Icon, label, value, accent, hint }) {
  const display = useCountUp(value)
  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-brass/40 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} strokeWidth={1.5} />
      </div>
      <p className="mt-3 font-display text-3xl tabular-nums">{display}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-5 rounded-lg border border-border bg-card px-5 py-4">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-sm bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted/70" />
      </div>
    </div>
  )
}

function SessionCard({ session, expanded, onToggle }) {
  const hasDeadlines = session.summary?.activeDeadlines > 0
  const hasDocument = session.summary?.hasDocument
  const situationName = session.summary?.situationCategory || "New situation"
  const severity = session.summary?.severity
  const nextDeadlineDays = daysUntil(session.summary?.nextDeadlineAt)
  const deadline = deadlineLabel(nextDeadlineDays)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-brass/40 hover:shadow-sm">
      <div className="flex items-center gap-5 px-5 py-4">
        <Link
          to={`/situation/${session.sessionId}`}
          className="group flex flex-1 items-center gap-5"
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
              {deadline && (
                <span className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${deadline.tone}`}>
                  <Clock className="h-3 w-3" />
                  {deadline.text}
                </span>
              )}
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
        </Link>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse details" : "Expand details"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border bg-background/50 px-5 py-4">
            <div className="grid gap-4 text-xs text-muted-foreground sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Jurisdiction</p>
                <p className="mt-1 text-foreground">{session.jurisdiction || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Document</p>
                <p className="mt-1 text-foreground">{hasDocument ? "On file" : "Not uploaded"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Next deadline</p>
                <p className="mt-1 text-foreground">{deadline?.text || "None"}</p>
              </div>
            </div>
            <Link
              to={`/situation/${session.sessionId}`}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brass hover:underline"
            >
              Open situation
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
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
  const [query, setQuery] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState("All")
  const [sortMode, setSortMode] = useState("recent") // "recent" | "urgency"
  const [expandedId, setExpandedId] = useState(null)
  const [tipIndex, setTipIndex] = useState(0)

  // Rotate the tip on a daily seed so it feels intentional, not random per render
  useEffect(() => {
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
    setTipIndex(day % RIGHTS_TIPS.length)
  }, [])

  // Keyboard shortcut: N to open the new-situation form
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return
      if (e.key === "n" || e.key === "N") {
        e.preventDefault()
        setShowNewForm((s) => !s)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const activeSessions = useMemo(() => sessions.filter((s) => s.status === "active"), [sessions])
  const resolvedSessions = useMemo(() => sessions.filter((s) => s.status !== "active"), [sessions])

  const filterAndSort = (list) => {
    const q = query.trim().toLowerCase()
    let out = list.filter((s) => {
      const name = (s.summary?.situationCategory || "").toLowerCase()
      const jur = (s.jurisdiction || "").toLowerCase()
      const matchesText = !q || name.includes(q) || jur.includes(q)
      const matchesUrgency = urgencyFilter === "All" || s.summary?.severity === urgencyFilter
      return matchesText && matchesUrgency
    })
    if (sortMode === "urgency") {
      out = [...out].sort((a, b) => (URGENCY_RANK[a.summary?.severity] ?? 4) - (URGENCY_RANK[b.summary?.severity] ?? 4))
    } else {
      out = [...out].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    }
    return out
  }

  const visibleActive = useMemo(() => filterAndSort(activeSessions), [activeSessions, query, urgencyFilter, sortMode])
  const visibleResolved = useMemo(() => filterAndSort(resolvedSessions), [resolvedSessions, query, urgencyFilter, sortMode])

  // Stats
  const totalDeadlines = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.summary?.activeDeadlines || 0), 0),
    [sessions]
  )
  const loomingDeadlines = useMemo(
    () =>
      sessions.filter((s) => {
        const d = daysUntil(s.summary?.nextDeadlineAt)
        return d !== null && d <= 7
      }).length,
    [sessions]
  )
  const docCount = useMemo(() => sessions.filter((s) => s.summary?.hasDocument).length, [sessions])

  useEffect(() => {
    document.title = "Dashboard - LEX"
    const loadData = async () => {
      setLoading(true)
      setLoadError("")
      try {
        const [sessionsResponse, alertsResponse] = await Promise.all([getAllSessions(), getUnreadCount()])
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

  const tip = RIGHTS_TIPS[tipIndex]
  const rotateTip = () => setTipIndex((i) => (i + 1) % RIGHTS_TIPS.length)

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
              <Link
                to="/alerts"
                className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title={`${unread} unread alert${unread === 1 ? "" : "s"}`}
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 animate-pulse items-center justify-center rounded-full bg-brass text-[8px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              <Link to="/library" className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex">
                <BookOpen className="h-3.5 w-3.5" />
                Library
              </Link>

              <Link to="/health-check" className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex">
                <HeartPulse className="h-3.5 w-3.5" />
                Health Check
              </Link>

              <div className="flex items-center gap-3 border-l border-border pl-4">
                <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:block">{user?.email}</span>
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
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
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
            onClick={() => setShowNewForm((c) => !c)}
            className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-xs font-medium text-background transition-all hover:bg-foreground active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            New situation
            <kbd className="ml-1 hidden rounded border border-white/20 px-1.5 py-0.5 text-[9px] font-mono text-background/70 sm:inline">N</kbd>
          </button>
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={Scale} label="Active matters" value={activeSessions.length} accent="text-brass" hint="Open sessions" />
          <StatTile icon={Clock} label="Due this week" value={loomingDeadlines} accent="text-orange-500" hint="Within 7 days" />
          <StatTile icon={Bell} label="Unread alerts" value={unread} accent="text-red-500" hint={unread === 0 ? "All caught up" : "Tap bell to view"} />
          <StatTile icon={FileSearch} label="Documents" value={docCount} accent="text-muted-foreground" hint="Across sessions" />
        </div>

        {/* Rights tip */}
        <section className="mt-6 grid items-start gap-3 rounded-lg border border-brass/30 bg-brass/5 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brass/15">
            <Lightbulb className="h-4 w-4 text-brass" strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">Know your rights</p>
            <p className="mt-1 text-sm font-medium">{tip.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{tip.body}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={rotateTip}
              className="inline-flex items-center gap-1.5 rounded-md border border-brass/30 bg-background px-2.5 py-1.5 text-[11px] font-medium text-brass transition-colors hover:bg-brass/10"
            >
              <Sparkles className="h-3 w-3" />
              Another
            </button>
            <Link
              to="/library"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brass hover:underline"
            >
              Library
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* New session form */}
        {showNewForm && (
          <section className="mt-6 rounded-lg border border-border bg-card p-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <h2 className="font-display text-lg">Start a new legal session</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Each session is tied to a jurisdiction so LEX can keep guidance location-specific.
            </p>
            <form onSubmit={handleNewSession} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brass"
              >
                <option value="" disabled>Select your state or union territory</option>
                {INDIAN_JURISDICTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={creating}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Search + filter bar (only when there's data) */}
        {!loading && sessions.length > 0 && (
          <div className="mt-8 grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by situation or jurisdiction"
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-brass"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-border bg-background p-1">
              <Filter className="ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {URGENCY_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setUrgencyFilter(f)}
                  className={`shrink-0 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    urgencyFilter === f ? "bg-ink text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSortMode((m) => (m === "recent" ? "urgency" : "recent"))}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              title="Toggle sort order"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {sortMode === "recent" ? "Recent" : "Urgency"}
            </button>
          </div>
        )}

        {/* Body */}
        {loading ? (
          <div className="mt-8 space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : sessions.length === 0 ? (
          <section className="mt-16 rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/10">
              <Scale className="h-7 w-7 text-brass" strokeWidth={1.2} />
            </div>
            <h2 className="mt-4 font-display text-xl">No legal sessions yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Start your first session to describe your situation and let LEX identify your rights and deadlines.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground"
              >
                <Plus className="h-4 w-4" />
                Start your first session
              </button>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                <BookOpen className="h-4 w-4" />
                Or browse the library
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-8 space-y-10">
            {visibleActive.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active</h2>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">{visibleActive.length}</span>
                </div>
                <div className="space-y-3">
                  {visibleActive.map((session) => (
                    <SessionCard
                      key={session.sessionId}
                      session={session}
                      expanded={expandedId === session.sessionId}
                      onToggle={() => setExpandedId((id) => (id === session.sessionId ? null : session.sessionId))}
                    />
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
                  { icon: Bell, title: "Alerts", desc: `${unread} unread notification${unread !== 1 ? "s" : ""}`, to: "/alerts" },
                ].map((action) => (
                  <Link
                    key={action.title}
                    to={action.to}
                    className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-muted transition-colors group-hover:bg-brass/10">
                      <action.icon className="h-5 w-5 text-brass" strokeWidth={1.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{action.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>

            {visibleResolved.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resolved</h2>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">{visibleResolved.length}</span>
                </div>
                <div className="space-y-3">
                  {visibleResolved.map((session) => (
                    <SessionCard
                      key={session.sessionId}
                      session={session}
                      expanded={expandedId === session.sessionId}
                      onToggle={() => setExpandedId((id) => (id === session.sessionId ? null : session.sessionId))}
                    />
                  ))}
                </div>
              </section>
            )}

            {visibleActive.length === 0 && visibleResolved.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                No sessions match your search or filter.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
