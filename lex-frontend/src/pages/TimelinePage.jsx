import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  Clock,
  Loader2,
  Plus,
  Sparkles,
  Timeline as TimelineIcon,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { getTimeline, addTimelineEvent } from "../api/timelineApi.js"

export default function TimelinePage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTimeline(sessionId)
        setEvents(res.data || [])
      } catch (err) {
        setError(err.message || "Failed to load timeline.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId])

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [events])

  const handleAddEvent = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Both title and description are required.")
      return
    }

    setAdding(true)
    setError(null)

    try {
      const res = await addTimelineEvent(sessionId, title.trim(), description.trim())
      setEvents((prev) => [res.data, ...prev])
      setTitle("")
      setDescription("")
    } catch (err) {
      setError(err.message || "Failed to add timeline event.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <AppLayout sessionId={sessionId} currentFeature="timeline">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Step 7 of 8.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Case Timeline</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Auto-built from your situation, documents, rights, deadlines, and letters, the timeline keeps a chronological legal record for your case.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-brass" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brass/10">
                  <TimelineIcon className="h-5 w-5 text-brass" />
                </div>
                <div>
                  <p className="text-sm font-medium">Legal case chronology</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Timeline events are automatically appended as you progress through Lex Counsel, Signal Letter, and other steps.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total events</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{events.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Most recent</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {sortedEvents[0]?.title || "No timeline events yet."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="text-sm font-medium">Add a manual event</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Record any important call, meeting, or document change in your case history.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Event title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    placeholder="Called the landlord about deposit"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                    rows={4}
                    placeholder="Noted that the landlord refused to provide invoices and asked for updated payment details."
                  />
                </div>
                <button
                  onClick={handleAddEvent}
                  disabled={adding}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? "Saving event…" : "Add timeline event"}
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {sortedEvents.length > 0 ? (
                sortedEvents.map((event) => (
                  <div key={event.id} className="rounded-3xl border border-border bg-background p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{event.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full border border-brass/30 bg-brass/10 px-3 py-1 text-xs font-medium text-brass">
                        {event.type === "manual"
                          ? "Manual"
                          : event.type
                            ? event.type.replace(/_/g, " ")
                            : "Auto"}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-border bg-card p-8 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-brass" />
                  <p className="mt-4 text-sm text-muted-foreground">Your case timeline will begin to populate as you use Lex Counsel, Signal Letter, and other features.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Why timeline matters</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A clear, chronological record helps lawyers, judges, or mediators understand what happened, when, and how you responded.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-brass shrink-0" />
                <div>
                  <p className="text-xs font-medium">Auto-built from your session</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Chronology is appended automatically when you generate letters, calculate deadlines, and ask Lex Counsel questions.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/counsel/${sessionId}`)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground"
            >
              Continue Lex Counsel
              <ArrowRight className="h-4 w-4" />
            </button>
          </aside>
        </div>
      )}
    </AppLayout>
  )
}
