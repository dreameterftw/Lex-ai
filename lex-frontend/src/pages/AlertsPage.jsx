import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { getAlerts, markAlertRead, markAllAlertsRead } from "../api/alertsApi.js"

const ALERT_TYPE_CONFIG = {
  deadline_approaching: { icon: Clock, color: "text-orange-600" },
  deadline_critical: { icon: AlertCircle, color: "text-red-600" },
  health_alert: { icon: TrendingUp, color: "text-yellow-600" },
  system_alert: { icon: Bell, color: "text-blue-600" },
}

export default function AlertsPage() {
  const navigate = useNavigate()

  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // all, unread, read

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await getAlerts()
        setAlerts(res.data || [])
      } catch (err) {
        setError(err.message || "Failed to load alerts.")
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  const handleMarkRead = async (alertId) => {
    setMarking(true)
    try {
      await markAlertRead(alertId)
      setAlerts(prev =>
        prev.map(a =>
          a.id === alertId ? { ...a, read: true } : a
        )
      )
    } catch (err) {
      console.error("Error marking alert read:", err)
    } finally {
      setMarking(false)
    }
  }

  const handleMarkAllRead = async () => {
    setMarking(true)
    try {
      await markAllAlertsRead()
      setAlerts(prev => prev.map(a => ({ ...a, read: true })))
    } catch (err) {
      console.error("Error marking all alerts read:", err)
    } finally {
      setMarking(false)
    }
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter === "unread") return !a.read
    if (filter === "read") return a.read
    return true
  })

  const unreadCount = alerts.filter(a => !a.read).length
  const readCount = alerts.filter(a => a.read).length

  const formatDateTime = (dateString) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(hours / 24)

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`

    return date.toLocaleDateString()
  }

  return (
    <AppLayout sessionId={null} currentFeature="alerts">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Notifications
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Stay on top of critical deadline alerts, health check findings, and system notifications across all your active cases.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-brass" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            {/* Filters and actions */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "all"
                        ? "bg-brass text-white"
                        : "border border-border bg-background hover:border-foreground"
                    }`}
                  >
                    All ({alerts.length})
                  </button>
                  <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "unread"
                        ? "bg-brass text-white"
                        : "border border-border bg-background hover:border-foreground"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilter("read")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "read"
                        ? "bg-brass text-white"
                        : "border border-border bg-background hover:border-foreground"
                    }`}
                  >
                    Read ({readCount})
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={marking}
                    className="text-xs font-medium text-brass hover:text-brass/80 transition-colors disabled:opacity-50"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Alerts list */}
            {filteredAlerts.length > 0 ? (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const config = ALERT_TYPE_CONFIG[alert.type] || { icon: Bell, color: "text-brass" }
                  const Icon = config.icon

                  return (
                    <button
                      key={alert.id}
                      onClick={() => handleMarkRead(alert.id)}
                      className={`w-full flex items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                        alert.read
                          ? "border-border bg-card opacity-60 hover:opacity-80"
                          : "border-brass/30 bg-brass/5 hover:bg-brass/10"
                      }`}
                    >
                      {/* Unread indicator */}
                      {!alert.read && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-brass shrink-0" />
                      )}

                      {/* Icon */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0 ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">
                            {alert.content?.title || "Alert"}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                            {alert.type.replace(/_/g, " ")}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {alert.content?.message || "No details"}
                        </p>

                        <p className="mt-2 text-[10px] text-muted-foreground">
                          {formatDateTime(alert.createdAt)}
                        </p>
                      </div>

                      {!alert.read && (
                        <Check className="h-4 w-4 text-brass shrink-0 mt-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-brass/40" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {filter === "all" && "No alerts yet. They'll appear here as you use Lex."}
                  {filter === "unread" && "All caught up! No unread alerts."}
                  {filter === "read" && "No read alerts to display."}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Alert types</p>
              <div className="space-y-3">
                {[
                  { label: "Deadline alerts", description: "Approaching critical dates" },
                  { label: "Health check alerts", description: "Legal readiness findings" },
                  { label: "System alerts", description: "Important account updates" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-brass shrink-0 mt-1.5" />
                    <div>
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Quick stats</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total alerts</span>
                  <span className="text-sm font-medium">{alerts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Unread</span>
                  <span className="text-sm font-medium text-brass">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Read</span>
                  <span className="text-sm font-medium text-muted-foreground">{readCount}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground"
            >
              Back to Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </aside>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 mt-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
