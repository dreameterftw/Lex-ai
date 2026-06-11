import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  Loader2,
  BookOpen,
  Mail,
  FileText,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { generateSignal, markLetterSent, updateRecipient } from "../api/signalApi.js"
import { getSession } from "../api/sessionApi.js"
import { X, Clipboard } from "lucide-react"

export default function SignalPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [signal, setSignal] = useState(null)
  const [recipientDraft, setRecipientDraft] = useState("")
  const [savingRecipient, setSavingRecipient] = useState(false)
  const [showLetterModal, setShowLetterModal] = useState(false)
  const [contextReady, setContextReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId)
        const signalContext = res.data?.context?.signal
        const rights = res.data?.context?.rights
        setSignal(signalContext || null)
        setRecipientDraft(signalContext?.recipient || "")
        setContextReady(rights?.identified?.length > 0)
      } catch (err) {
        setError(err.message || "Failed to load Signal Letter context.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)

    try {
      const res = await generateSignal(sessionId)
      setSignal(res.data)
    } catch (err) {
      setError(err.message || "Failed to generate the Signal Letter.")
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkSent = async () => {
    setSending(true)
    setError(null)

    try {
      const res = await markLetterSent(sessionId)
      setSignal((prev) => ({ ...prev, sentDate: res.data.sentDate }))
    } catch (err) {
      setError(err.message || "Failed to mark the letter as sent.")
    } finally {
      setSending(false)
    }
  }

  const handleSaveRecipient = async () => {
    if (!signal) return
    setSavingRecipient(true)
    setError(null)

    try {
      const res = await updateRecipient(sessionId, recipientDraft)
      setSignal(res.data)
    } catch (err) {
      setError(err.message || "Failed to save recipient.")
    } finally {
      setSavingRecipient(false)
    }
  }

  const handleCopyLetter = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // small feedback could be added later
    } catch (e) {
      // ignore copy failures silently
    }
  }

  return (
    <AppLayout sessionId={sessionId} currentFeature="signal">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Step 6 of 8.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Signal Letter</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Generate a formal rights assertion letter that cites the exact laws being violated and spells out your requested action.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-brass" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            {!signal ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brass/10">
                    <Mail className="h-5 w-5 text-brass" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ready to generate your formal letter</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      LEX will draft a rights-assertion letter tailored to your situation, citing exact statutes and legal grounds.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brass/10">
                      <FileText className="h-5 w-5 text-brass" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{signal.letterType}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{signal.subject}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recipient</p>
                    {signal.sentDate ? (
                      <p className="mt-2 text-sm">{signal.recipient}</p>
                    ) : (
                      <div className="mt-2 flex gap-3">
                        <input
                          value={recipientDraft}
                          onChange={(e) => setRecipientDraft(e.target.value)}
                          placeholder="Recipient name or organization"
                          className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none"
                        />
                        <button
                          onClick={handleSaveRecipient}
                          disabled={savingRecipient}
                          className="rounded-xl border border-border bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {savingRecipient ? "Saving…" : "Save"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Requested action</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{signal.requestedAction}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Response deadline</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{signal.responseDeadline}</p>
                    </div>
                    {signal.legalCitations?.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Exact laws cited</p>
                        <div className="mt-2 space-y-2">
                          {signal.legalCitations.map((law, index) => (
                            <p key={index} className="text-sm text-muted-foreground">• {law}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {signal && (
              <div className="rounded-3xl border border-border bg-background p-6 space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Letter body</p>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {signal.body?.slice(0, 600) || ""}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => setShowLetterModal(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium"
                    >
                      <Clipboard className="h-4 w-4 text-brass" />
                      View full letter
                    </button>
                  </div>
                </div>

                {signal.disclaimer && (
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Legal disclaimer</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{signal.disclaimer}</p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating || !contextReady}
                className="flex-1 inline-flex items-center justify-center gap-3 rounded-xl bg-ink px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <span>Generating letter…</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <span>{signal ? "Regenerate letter" : "Generate letter"}</span>
                )}
              </button>
              {signal && (
                <button
                  onClick={handleMarkSent}
                  disabled={sending || !!signal.sentDate}
                  className="flex-1 inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Marking sent…" : signal.sentDate ? "Letter sent" : "Mark letter sent"}
                </button>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">What this letter does</p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A formal rights assertion letter is written to make the opposing party aware of your claims,
                  the legal basis, and the action you expect.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  LEX cites exact laws and requested remedies, so the letter is stronger and more persuasive.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-brass shrink-0" />
                <div>
                  <p className="text-xs font-medium">Next step</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    After sending the letter, continue to the case timeline to track response, evidence, and any follow-up actions.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/timeline/${sessionId}`)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground"
            >
              Open Case Timeline
              <ArrowRight className="h-4 w-4" />
            </button>
          </aside>
        </div>
      )}
      {showLetterModal && signal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">{signal.subject || signal.letterType || "Signal Letter"}</h2>
              <button onClick={() => setShowLetterModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              <p className="mb-2"><strong>To:</strong> {signal.recipient}</p>
              <p className="mb-4 whitespace-pre-wrap">{signal.body}</p>
              {signal.disclaimer && (
                <p className="mt-4 text-xs text-muted-foreground">{signal.disclaimer}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => await handleCopyLetter(`${signal.subject}\n\nTo: ${signal.recipient}\n\n${signal.body}`)}
                className="rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground"
              >
                Copy letter
              </button>
              <button
                onClick={() => setShowLetterModal(false)}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

