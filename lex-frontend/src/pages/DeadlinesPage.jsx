import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Clock,
  CalendarDays,
  Zap,
  Bell,
  FileWarning,
  Plus,
  X,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { calculateDeadlines, createDeadline } from "../api/deadlinesApi.js"
import { getSession } from "../api/sessionApi.js"
import { useDeadlines } from "../hooks/useDeadlines.js"
import { getUrgencyColor, getUrgencyDot } from "../utils/deadlineHelpers.js"

const formatCountdown = (exactDate, now) => {
  if (!exactDate) return "Due soon"

  const target = new Date(exactDate)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) return "Due now"

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const formatDueDate = (exactDate) => {
  if (!exactDate) return "Unknown"
  return new Date(exactDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function DeadlineRow({ deadline, now }) {
  const urgencyClass = getUrgencyColor(deadline.urgency)
  const dotClass = getUrgencyDot(deadline.urgency)
  const countdown = formatCountdown(deadline.exactDate, now)

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {deadline.urgency} urgency
            </p>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-none text-foreground">
            {deadline.name}
          </h3>
          {deadline.description && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {deadline.description}
            </p>
          )}
        </div>

        <span className={`rounded-full border px-3 py-1 text-[10px] font-medium ${urgencyClass}`}>
          {deadline.urgency}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Countdown
          </p>
          <p className="mt-2 text-2xl font-semibold">{countdown}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Due date
            </p>
          </div>
          <p className="mt-2 text-sm font-medium">{formatDueDate(deadline.exactDate)}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Action required
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {deadline.actionRequired || "Review and act"}
          </p>
        </div>
      </div>

      {(deadline.law || deadline.consequence) && (
        <div className="mt-6 rounded-2xl border border-border bg-background p-4">
          {deadline.law && (
            <>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Relevant law
              </p>
              <p className="mt-2 text-sm text-brass font-mono">{deadline.law}</p>
            </>
          )}

          {deadline.consequence && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                What happens if you miss it
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {deadline.consequence}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DeadlinesPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { deadlines, loading: realtimeLoading } = useDeadlines(sessionId)

  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [deadlineContext, setDeadlineContext] = useState(null)
  const [situation, setSituation] = useState(null)
  const [error, setError] = useState(null)
  const [now, setNow] = useState(new Date())
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [customDate, setCustomDate] = useState("")
  const [customAction, setCustomAction] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [creatingDeadline, setCreatingDeadline] = useState(false)
  const [customError, setCustomError] = useState(null)
  const [customSuccess, setCustomSuccess] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId)
        setSituation(res.data?.context?.situation || null)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }

    load()
  }, [sessionId])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await calculateDeadlines(sessionId)
      setDeadlineContext(res.data)
    } catch (err) {
      setError(err?.message || "Failed to calculate deadlines.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDeadline = async () => {
    setCustomError(null)
    setCustomSuccess(null)

    if (!customTitle.trim() || !customDate) {
      setCustomError("Please provide both a title and a due date.")
      return
    }

    setCreatingDeadline(true)

    try {
      const res = await createDeadline(
        sessionId,
        customTitle.trim(),
        customDate,
        customAction.trim(),
        customDescription.trim()
      )

      setCustomSuccess("Custom deadline added successfully.")
      setCustomTitle("")
      setCustomDate("")
      setCustomAction("")
      setCustomDescription("")
      setDeadlineContext((prev) => {
        const active = prev?.active || deadlines?.active || []
        return {
          ...prev,
          active: [res.data, ...active],
        }
      })
    } catch (err) {
      setCustomError(err?.message || "Failed to add custom deadline.")
    } finally {
      setCreatingDeadline(false)
    }
  }

  const effectiveDeadlineContext = deadlineContext || deadlines
  const activeDeadlines = effectiveDeadlineContext?.active || []
  const approachingCount = effectiveDeadlineContext?.approaching?.length || 0
  const expiredCount = effectiveDeadlineContext?.expired?.length || 0
  const totalActive = activeDeadlines.length
  const nextDeadline = activeDeadlines[0]

  const critical = activeDeadlines.filter((d) => d.urgency === "Critical")
  const high = activeDeadlines.filter((d) => d.urgency === "High")
  const medium = activeDeadlines.filter((d) => d.urgency === "Medium")
  const low = activeDeadlines.filter((d) => d.urgency === "Low")

  const nextDueText = useMemo(() => {
    if (!nextDeadline) return "No deadlines yet"
    return `${nextDeadline.name} • ${formatDueDate(nextDeadline.exactDate)}`
  }, [nextDeadline])

  if (fetching || realtimeLoading) {
    return (
      <AppLayout sessionId={sessionId} currentFeature="deadlines">
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-brass" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout sessionId={sessionId} currentFeature="deadlines">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Step 4 of 8.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Deadline Tracker</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed">
          Every legal deadline tied to your situation, counted down in real time. Missing a deadline can close your case permanently.
        </p>
      </div>

      {!activeDeadlines.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            {situation?.legalCategory && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  Calculating deadlines based on
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Situation", value: `${situation.legalCategory} — ${situation.subcategory}` },
                    { label: "Jurisdiction", value: situation.jurisdiction },
                    { label: "Severity", value: situation.severity },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-brass shrink-0" />
                      <p className="text-sm">
                        <span className="text-muted-foreground">{item.label}: </span>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              onClick={handleCalculate}
              disabled={loading || !situation?.legalCategory}
              className="group w-full inline-flex items-center justify-between gap-4 rounded-xl bg-ink px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span>Calculating your deadlines…</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <span>Calculate my deadlines</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {!situation?.legalCategory && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Situation not complete</p>
                    <p className="mt-1 text-xs text-yellow-700 leading-relaxed">
                      Complete the Situation Finder first for accurate deadline tracking.
                    </p>
                    <button
                      onClick={() => navigate(`/situation/${sessionId}`)}
                      className="mt-2 text-xs text-yellow-800 underline underline-offset-2"
                    >
                      Go to Situation Finder →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                Why deadlines matter
              </p>
              <div className="space-y-3">
                {[
                  { icon: Clock, label: "Missing a filing window can permanently close your case" },
                  { icon: Bell, label: "Limitation periods run silently — LEX makes them visible" },
                  { icon: FileWarning, label: "Every deadline includes what to do and what's at stake" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <item.icon className="h-3.5 w-3.5 text-brass shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Add custom deadline</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Track your own milestones alongside LEX deadlines.
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomForm((current) => !current)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCustomForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
              </div>

              {showCustomForm && (
                <div className="mt-5 space-y-3">
                  {customError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {customError}
                    </div>
                  )}
                  {customSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {customSuccess}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Task title</label>
                    <input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                      placeholder="e.g. File police complaint"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Due date</label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Action required</label>
                    <input
                      value={customAction}
                      onChange={(e) => setCustomAction(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                      placeholder="e.g. Submit supporting evidence"
                    />
                  </div>

                  <button
                    onClick={handleCreateDeadline}
                    disabled={creatingDeadline}
                    className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingDeadline ? "Adding deadline…" : "Add custom deadline"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-6 rounded-2xl border border-border bg-card px-6 py-4">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Active deadlines</p>
                <p className="mt-1 font-display text-2xl">{totalActive}</p>
              </div>

              {[
                { label: "Critical", count: critical.length, color: "text-red-600" },
                { label: "High", count: high.length, color: "text-orange-600" },
                { label: "Medium", count: medium.length, color: "text-yellow-700" },
                { label: "Low", count: low.length, color: "text-green-700" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className={`font-display text-xl ${item.color}`}>{item.count}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>

            {[
              { group: critical, label: "Critical" },
              { group: high, label: "High" },
              { group: medium, label: "Medium" },
              { group: low, label: "Low" },
            ].map(({ group, label }) =>
              group.length > 0 ? (
                <div key={label}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label} urgency</h2>
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] text-muted-foreground">{group.length}</span>
                  </div>
                  <div className="space-y-4">
                    {group.map((deadline, index) => (
                      <DeadlineRow key={index} deadline={deadline} now={now} />
                    ))}
                  </div>
                </div>
              ) : null
            )}

            {effectiveDeadlineContext?.notes && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Notes from LEX</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{effectiveDeadlineContext.notes}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
              >
                {loading ? "Refreshing…" : "Refresh deadlines"}
              </button>
              <button
                onClick={() => navigate(`/counsel/${sessionId}`)}
                className="group flex-1 inline-flex items-center justify-between gap-4 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground"
              >
                Continue to LEX Counsel
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            {nextDeadline && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Most urgent</p>
                <p className="text-sm font-medium leading-snug">{nextDeadline.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nextDeadline.exactDate
                    ? new Date(nextDeadline.exactDate).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Add custom deadline</p>
                <button
                  onClick={() => setShowCustomForm((current) => !current)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCustomForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Track your own milestones alongside LEX deadlines.
              </p>

              {showCustomForm && (
                <div className="mt-5 space-y-3">
                  {customError && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {customError}
                    </div>
                  )}
                  {customSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {customSuccess}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Task title</label>
                    <input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                      placeholder="e.g. File police complaint"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Due date</label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Action required</label>
                    <input
                      value={customAction}
                      onChange={(e) => setCustomAction(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                      placeholder="e.g. Submit supporting evidence"
                    />
                  </div>

                  <button
                    onClick={handleCreateDeadline}
                    disabled={creatingDeadline}
                    className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingDeadline ? "Adding deadline…" : "Add custom deadline"}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <Zap className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Act before it’s too late</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    LEX updates countdowns continuously and surfaces the most urgent dates so you can prioritise what matters.
                  </p>
                </div>
              </div>
            </div>

            {expiredCount > 0 && (
              <div className="rounded-2xl border border-border bg-yellow-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800">Expired deadlines detected</p>
                    <p className="mt-1 text-xs text-yellow-700 leading-relaxed">
                      {expiredCount} deadline{expiredCount !== 1 ? "s" : ""} have already passed. Review them immediately to understand next steps.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {effectiveDeadlineContext?.notes && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Notes from LEX</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{effectiveDeadlineContext.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
