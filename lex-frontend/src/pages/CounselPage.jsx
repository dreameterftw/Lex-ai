import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  Circle,
  Loader2,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { sendMessage, getCounselHistory } from "../api/counselApi.js"
import { getSession } from "../api/sessionApi.js"

export default function CounselPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [history, setHistory] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [situation, setSituation] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [sessionRes, historyRes] = await Promise.all([
          getSession(sessionId),
          getCounselHistory(sessionId)
        ])

        setSituation(sessionRes.data?.context?.situation || null)
        setHistory(historyRes.data || [])
      } catch (err) {
        setError(err.message || "Failed to load Lex Counsel.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId])

  const handleSend = async () => {
    if (!input.trim()) return

    setSending(true)
    setError(null)
    const messageText = input.trim()
    setInput("")
    setHistory((prev) => [...prev, { id: `pending_${Date.now()}`, user: messageText, lex: null, pending: true }])

    try {
      const res = await sendMessage(sessionId, messageText)
      const response = res.data

      setHistory((prev) => prev.map((entry) =>
        entry.pending ? { ...entry, lex: response.message, id: response.exchangeId, timestamp: response.timestamp, pending: false } : entry
      ))
    } catch (err) {
      setError(err.message || "Lex Counsel failed. Please try again.")
      setHistory((prev) => prev.filter((entry) => !entry.pending))
    } finally {
      setSending(false)
    }
  }

  const hasConversation = history.length > 0
  const canSend = input.trim().length > 0 && !sending

  return (
    <AppLayout sessionId={sessionId} currentFeature="counsel">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Step 5 of 8.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Lex Counsel</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Ask LEX anything about your case and get grounded answers that use your situation, documents, rights, and deadlines.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-brass" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            {!situation?.legalCategory && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Situation context is missing</p>
                    <p className="mt-1 text-sm text-yellow-700">
                      Complete the Situation Finder so Lex Counsel can provide advice specific to your case.
                    </p>
                    <button
                      onClick={() => navigate(`/situation/${sessionId}`)}
                      className="mt-2 text-xs text-yellow-800 underline underline-offset-2"
                    >
                      Complete Situation Finder →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brass/10">
                    <Sparkles className="h-5 w-5 text-brass" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Contextual AI</p>
                    <p className="text-xs text-muted-foreground">Answers are grounded in your exact situation and file history.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Lex Counsel uses your uploaded documents, rights findings, deadlines, and timeline events to provide tailored guidance.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ask about</p>
                      <p className="mt-2 text-sm">What rights apply in this case?</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ask about</p>
                      <p className="mt-2 text-sm">What evidence should I preserve?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {hasConversation ? (
                history.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <div className="rounded-3xl border border-border bg-card p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">You</p>
                          <p className="mt-2 text-sm leading-relaxed">{item.user}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-background p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brass/10">
                          <ShieldCheck className="h-4 w-4 text-brass" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Lex Counsel</span>
                            {item.pending && <span className="inline-flex items-center gap-1 text-yellow-600"><Circle className="h-2 w-2 animate-pulse" /> Thinking…</span>}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed">{item.lex || "Waiting for Lex Counsel..."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-border bg-card p-8 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-brass" />
                  <p className="mt-5 text-sm text-muted-foreground">Start the conversation by asking a question about your case.</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ask Lex Counsel</label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                  className="min-h-[120px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brass"
                  placeholder="Ask a question about your rights, evidence, or next steps."
                />
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-ink px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending…" : "Send question"}
                </button>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Lex Counsel advantage</p>
              <div className="space-y-3">
                {[
                  "Answers based on your documents, rights, and deadlines",
                  "No generic legal advice — only tailored guidance",
                  "Saved conversation history for later review",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Circle className="mt-1 h-2.5 w-2.5 rounded-full bg-brass" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Next step</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If your question requires a formal rights assertion, generate a Signal Letter next.
              </p>
              <button
                onClick={() => navigate(`/signal/${sessionId}`)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground"
              >
                Generate Signal Letter
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <p className="font-medium">Why Lex Counsel works</p>
        <p className="mt-2 leading-relaxed">
          Lex Counsel is built to answer your follow-up questions in a single session, using the specific legal facts,
          documents, and rights information already stored for your case.
        </p>
      </div>
    </AppLayout>
  )
}
