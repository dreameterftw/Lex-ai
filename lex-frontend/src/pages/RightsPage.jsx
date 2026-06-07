import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  Loader2,
  ClipboardList,
  Zap,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { identifyRights } from "../api/rightsApi.js"
import { getSession } from "../api/sessionApi.js"

export default function RightsPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [situation, setSituation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId)
        const ctx = res.data?.context
        setSituation(ctx?.situation || null)
        if (ctx?.rights?.identified?.length) {
          setResult(ctx.rights)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }

    load()
  }, [sessionId])

  const handleIdentify = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await identifyRights(sessionId)
      setResult(res.data)
    } catch (err) {
      setError(err?.message || "Failed to identify rights.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <AppLayout sessionId={sessionId} currentFeature="rights">
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-brass" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout sessionId={sessionId} currentFeature="rights">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Step 3 of 8.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Rights Navigator</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Based on your situation, your document, and your jurisdiction — LEX identifies exactly
          which legal rights apply to you, which have been violated, and what to do.
        </p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            {situation?.legalCategory ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  LEX will identify rights based on
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-brass shrink-0" />
                    <p className="text-sm">
                      <span className="text-muted-foreground">Situation: </span>
                      {situation.legalCategory} — {situation.subcategory}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-brass shrink-0" />
                    <p className="text-sm">
                      <span className="text-muted-foreground">Jurisdiction: </span>
                      {situation.jurisdiction}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-brass shrink-0" />
                    <p className="text-sm">
                      <span className="text-muted-foreground">Severity: </span>
                      {situation.severity}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
                <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Situation not yet classified</p>
                  <p className="mt-1 text-xs text-yellow-700">
                    Complete the Situation Finder first for more accurate rights identification.
                  </p>
                  <button
                    onClick={() => navigate(`/situation/${sessionId}`)}
                    className="mt-2 text-xs text-yellow-800 underline underline-offset-2"
                  >
                    Go to Situation Finder →
                  </button>
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
              onClick={handleIdentify}
              disabled={loading || !situation?.legalCategory}
              className="group w-full inline-flex items-center justify-between gap-4 rounded-xl bg-ink px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span>Identifying your rights…</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <span>Identify my rights</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                What LEX identifies
              </p>
              <div className="space-y-3">
                {[
                  { icon: Shield, label: "Rights that apply to your situation" },
                  { icon: ShieldAlert, label: "Rights that have been violated" },
                  { icon: ClipboardList, label: "Evidence you should collect today" },
                  { icon: Zap, label: "The single most important next action" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-brass shrink-0" strokeWidth={1.4} />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            {result.immediateAction && (
              <div className="rounded-xl border border-brass/30 bg-brass/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-brass/20">
                    <Zap className="h-4 w-4 text-brass" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-brass mb-1">
                      Most important action right now
                    </p>
                    <p className="text-sm font-medium leading-relaxed">{result.immediateAction}</p>
                  </div>
                </div>
              </div>
            )}

            {result.violated?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rights violated</h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-red-600">{result.violated.length}</span>
                </div>

                <div className="space-y-3">
                  {result.violated.map((r, i) => (
                    <div key={i} className="rounded-xl border border-red-200 bg-red-50/50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" strokeWidth={1.4} />
                          <div>
                            <p className="text-sm font-medium">{r.right}</p>
                            {r.law && (
                              <p className="mt-0.5 text-xs text-red-600 font-mono">{r.law}</p>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full border border-red-200 bg-red-100 text-red-700 font-medium">
                          Violated
                        </span>
                      </div>

                      {r.violation && (
                        <div className="mt-4 border-t border-red-200 pt-4">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                            How it was violated
                          </p>
                          <p className="text-sm leading-relaxed text-muted-foreground">{r.violation}</p>
                        </div>
                      )}

                      {r.evidenceAvailable && (
                        <div className="mt-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                            Evidence available
                          </p>
                          <p className="text-xs text-muted-foreground">{r.evidenceAvailable}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.identified?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your rights</h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">{result.identified.length}</span>
                </div>

                <div className="rounded-xl border border-border bg-card divide-y divide-border">
                  {result.identified.map((r, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="h-4 w-4 text-brass shrink-0 mt-0.5" strokeWidth={1.4} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{r.right}</p>
                          {r.law && <p className="mt-0.5 text-xs text-brass font-mono">{r.law}</p>}
                          {r.explanation && (
                            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.evidenceToCollect?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Evidence to collect now</h3>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="rounded-xl border border-border bg-card divide-y divide-border">
                  {result.evidenceToCollect.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-4">
                      <ClipboardList className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setResult(null)}
                className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Re-identify rights
              </button>
              <button
                onClick={() => navigate(`/deadlines/${sessionId}`)}
                className="group flex-1 inline-flex items-center justify-between gap-4 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground"
              >
                Continue to Deadline Tracker
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">Summary</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Rights identified</span>
                  <span className="text-xs font-medium">{result.identified?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Potential violations</span>
                  <span className={`text-xs font-medium ${result.violated?.length > 0 ? "text-red-600" : "text-green-600"}`}>
                    {result.violated?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Evidence items</span>
                  <span className="text-xs font-medium">{result.evidenceToCollect?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 text-brass shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-medium">Learn more about your rights</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    The Legal Library has plain-English guides on every right identified here.
                  </p>
                  <button
                    onClick={() => navigate("/library")}
                    className="mt-2 text-xs text-brass underline underline-offset-2"
                  >
                    Open Library →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
