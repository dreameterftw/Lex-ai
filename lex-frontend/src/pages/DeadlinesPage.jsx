import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Clock,
  CalendarDays,
  Zap,
  ShieldCheck,
  Bell,
  FileWarning,
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
  const [customName, setCustomName] = useState("")
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
    const interval = setInterval(() => setNow(new Date()), 1000)
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

    if (!customName.trim() || !customDate) {
      setCustomError("Please provide both a title and a due date.")
      return
    }

    setCreatingDeadline(true)

    try {
      const res = await createDeadline(
        sessionId,
        customName.trim(),
        customDate,
        customAction.trim(),
        customDescription.trim()
      )

      setCustomSuccess("Custom deadline added successfully.")
      setCustomName("")
      setCustomDate("")
      setCustomAction("")
      setCustomDescription("")
      setDeadlineContext((prev) => {
        const active = prev?.active || deadlines?.active || []
        return {
          ...prev,
          active: [res.data, ...active]
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
  const criticalCount = activeDeadlines.filter((d) => d.urgency === "Critical").length
  const highCount = activeDeadlines.filter((d) => d.urgency === "High").length

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
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          LEX turns your legal situation into a live dashboard of every urgent deadline,
          countdown timers, and next actions so you never miss a critical date.
        </p>
      </div>

      {!activeDeadlines.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brass/10">
                  <Clock className="h-5 w-5 text-brass" />
                </div>
                <div>
                  <p className="text-sm font-medium">No deadlines have been tracked yet</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Once LEX processes your case, it will list every statutory and contractual
                    deadline with real-time countdown cards, urgency flags, and recommended actions.
                  </p>
                </div>
              </div>
            </div>

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
                  <span>Calculating deadlines…</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <span>Track my deadlines</span>
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
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                What you’ll see
              </p>
              <div className="space-y-3">
                {[
                  { icon: Clock, label: "Live deadline countdowns" },
                  { icon: Bell, label: "Urgency alerts for critical dates" },
                  { icon: FileWarning, label: "Clear actions and consequences" },
                  { icon: ShieldCheck, label: "Legal context from your case" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-brass shrink-0" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Create a custom deadline</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Add your own task deadline if you want to track an earlier milestone or a personalized action.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
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
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Task title</label>
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    placeholder="File police complaint"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due date</label>
                  <input
                    type="datetime-local"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Action required</label>
                  <input
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    placeholder="Submit supporting evidence"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes (optional)</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    placeholder="Use this deadline as an early completion milestone for your task."
                  />
                </div>

                <button
                  onClick={handleCreateDeadline}
                  disabled={creatingDeadline}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingDeadline ? "Adding deadline…" : "Add custom deadline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Active deadlines
                  </p>
                  <h2 className="mt-2 text-2xl font-display">{totalActive} upcoming deadline{totalActive !== 1 ? "s" : ""}</h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                    Real-time countdowns keep you aware of every urgent date, the required next step,
                    and what happens if you miss it.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-background px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Critical</p>
                    <p className="mt-2 text-lg font-semibold text-red-600">{criticalCount}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">High</p>
                    <p className="mt-2 text-lg font-semibold text-orange-600">{highCount}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Approaching</p>
                    <p className="mt-2 text-lg font-semibold text-yellow-600">{approachingCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {activeDeadlines.map((deadline, index) => {
                const urgencyClass = getUrgencyColor(deadline.urgency)
                const dotClass = getUrgencyDot(deadline.urgency)
                const countdown = formatCountdown(deadline.exactDate, now)

                return (
                  <div key={index} className="rounded-3xl border border-border bg-card p-6">
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
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {deadline.description}
                        </p>
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
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            Relevant law
                          </p>
                        )}
                        {deadline.law && <p className="mt-2 text-sm text-brass font-mono">{deadline.law}</p>}
                        {deadline.consequence && (
                          <div className="mt-3">
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
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Refresh deadlines
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
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                Deadline summary
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Next deadline</span>
                  <span className="text-xs font-medium">{nextDueText}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Active deadlines</span>
                  <span className="text-xs font-medium">{totalActive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Approaching deadlines</span>
                  <span className="text-xs font-medium">{approachingCount}</span>
                </div>
                {expiredCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Expired deadlines</span>
                    <span className="text-xs font-medium">{expiredCount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <Zap className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Act before it’s too late</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    LEX updates countdowns every second and highlights the most urgent dates so you can prioritize what matters.
                  </p>
                </div>
              </div>
            </div>

            {expiredCount > 0 && (
              <div className="rounded-xl border border-border bg-yellow-50 p-5">
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
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  Notes from LEX
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {effectiveDeadlineContext.notes}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Create a custom deadline</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Add your own task deadline if you want to track an earlier milestone or a personalized action.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
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
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Task title</label>
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    placeholder="File police complaint"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due date</label>
                  <input
                    type="datetime-local"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Action required</label>
                  <input
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    placeholder="Submit supporting evidence"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes (optional)</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    placeholder="Use this deadline as an early completion milestone for your task."
                  />
                </div>

                <button
                  onClick={handleCreateDeadline}
                  disabled={creatingDeadline}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingDeadline ? "Adding deadline…" : "Add custom deadline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
