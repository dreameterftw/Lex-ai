import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  ArrowUpRight,
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
        if (ctx?.rights?.identified?.length) setResult(ctx.rights)
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

  const pad = (n) => String(n).padStart(2, "0")

  return (
    <AppLayout sessionId={sessionId} currentFeature="rights">
      {/* Header */}
      <div className="mb-12 max-w-3xl">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Step 3 of 8.
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-foreground">
          Rights Navigator
        </h1>
        <p className="mt-5 text-base text-muted-foreground leading-relaxed">
          Based on your situation, your document, and your jurisdiction — LEX identifies exactly
          which legal rights apply to you, which have been violated, and what to do next.
        </p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: context + CTA */}
          <div className="lg:col-span-7 space-y-6">
            {situation?.legalCategory ? (
              <div className="rounded-2xl border border-border bg-card p-7">
                <p className="text-[10px] uppercase tracking-[0.22em] text-brass mb-5">
                  LEX will identify rights based on
                </p>
                <dl className="divide-y divide-border/70">
                  {[
                    ["Situation", `${situation.legalCategory} — ${situation.subcategory}`],
                    ["Jurisdiction", situation.jurisdiction],
                    ["Severity", situation.severity],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0">
                      <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{k}</dt>
                      <dd className="font-display text-base text-foreground text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-brass/30 bg-brass/5 px-6 py-5">
                <AlertCircle className="h-4 w-4 text-brass shrink-0 mt-1" />
                <div>
                  <p className="font-display text-base text-foreground">Situation not yet classified</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete the Situation Finder first for more accurate rights identification.
                  </p>
                  <button
                    onClick={() => navigate(`/situation/${sessionId}`)}
                    className="mt-3 inline-flex items-center gap-1 text-sm italic text-brass underline decoration-brass/40 underline-offset-4"
                  >
                    Go to Situation Finder <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              onClick={handleIdentify}
              disabled={loading || !situation?.legalCategory}
              className="group w-full inline-flex items-center justify-between gap-4 rounded-2xl bg-ink px-7 py-5 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span>Identifying your rights…</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <span>Identify my rights</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </>
              )}
            </button>
          </div>

          {/* Right: what LEX identifies */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-brass">What LEX identifies</p>
              <p className="mt-2 font-display text-lg text-foreground leading-snug">
                Four answers, surfaced together — never in isolation.
              </p>

              <ul className="mt-6 divide-y divide-border/70">
                {[
                  { icon: Shield, label: "Rights that apply to your situation" },
                  { icon: ShieldAlert, label: "Rights that have been violated" },
                  { icon: ClipboardList, label: "Evidence you should collect today" },
                  { icon: Zap, label: "The single most important next action" },
                ].map((item, i) => (
                  <li key={item.label} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/10">
                      <item.icon className="h-4 w-4 text-brass" strokeWidth={1.5} />
                    </div>
                    <p className="flex-1 font-display text-[15px] text-foreground">{item.label}</p>
                    <span className="text-[11px] tabular-nums text-muted-foreground">{pad(i + 1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main column */}
          <div className="lg:col-span-8 space-y-8">
            {result.immediateAction && (
              <div className="rounded-2xl border border-brass/30 bg-brass/5 p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brass/15">
                    <Zap className="h-4 w-4 text-brass" strokeWidth={1.6} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-brass">
                      Most important action right now
                    </p>
                    <p className="mt-2 font-display text-xl leading-snug text-foreground">
                      {result.immediateAction}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result.violated?.length > 0 && (
              <section>
                <div className="flex items-baseline gap-4 mb-5">
                  <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
                    Rights violated.
                  </p>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {pad(result.violated.length)}
                  </span>
                </div>

                <div className="space-y-4">
                  {result.violated.map((r, i) => (
                    <article key={i} className="rounded-2xl border border-border bg-card p-7">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                            <ShieldAlert className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                          </div>
                          <div>
                            <h3 className="font-display text-xl leading-snug text-foreground">{r.right}</h3>
                            {r.law && (
                              <p className="mt-1 text-xs font-mono uppercase tracking-wider text-brass">
                                {r.law}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-destructive">
                          Violated
                        </span>
                      </div>

                      {r.violation && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                            How it was violated
                          </p>
                          <p className="text-sm leading-relaxed text-muted-foreground">{r.violation}</p>
                        </div>
                      )}

                      {r.evidenceAvailable && (
                        <div className="mt-5">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                            Evidence available
                          </p>
                          <p className="text-sm text-muted-foreground">{r.evidenceAvailable}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {result.identified?.length > 0 && (
              <section>
                <div className="flex items-baseline gap-4 mb-5">
                  <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
                    Your rights.
                  </p>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {pad(result.identified.length)}
                  </span>
                </div>

                <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                  {result.identified.map((r, i) => (
                    <div key={i} className="px-7 py-5 flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/10">
                        <ShieldCheck className="h-4 w-4 text-brass" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="font-display text-base text-foreground">{r.right}</p>
                          <span className="text-[11px] tabular-nums text-muted-foreground">{pad(i + 1)}</span>
                        </div>
                        {r.law && (
                          <p className="mt-1 text-xs font-mono uppercase tracking-wider text-brass">{r.law}</p>
                        )}
                        {r.explanation && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.evidenceToCollect?.length > 0 && (
              <section>
                <div className="flex items-baseline gap-4 mb-5">
                  <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
                    Evidence to collect now.
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                  {result.evidenceToCollect.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 px-7 py-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass/10">
                        <ClipboardList className="h-4 w-4 text-brass" strokeWidth={1.5} />
                      </div>
                      <p className="flex-1 font-display text-[15px] text-foreground">{item}</p>
                      <span className="text-[11px] tabular-nums text-muted-foreground">{pad(i + 1)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setResult(null)}
                className="flex-1 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Re-identify rights
              </button>
              <button
                onClick={() => navigate(`/deadlines/${sessionId}`)}
                className="group flex-1 inline-flex items-center justify-between gap-4 rounded-2xl bg-ink px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-foreground"
              >
                Continue to Deadline Tracker
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-7">
              <p className="text-[10px] uppercase tracking-[0.22em] text-brass mb-5">Summary</p>
              <dl className="divide-y divide-border/70">
                {[
                  ["Rights identified", result.identified?.length || 0, "text-foreground"],
                  [
                    "Potential violations",
                    result.violated?.length || 0,
                    result.violated?.length > 0 ? "text-destructive" : "text-foreground",
                  ],
                  ["Evidence items", result.evidenceToCollect?.length || 0, "text-foreground"],
                ].map(([label, value, cls]) => (
                  <div key={label} className="flex items-baseline justify-between py-3 first:pt-0 last:pb-0">
                    <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
                    <dd className={`font-display text-2xl tabular-nums ${cls}`}>{pad(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass/10">
                <BookOpen className="h-4 w-4 text-brass" strokeWidth={1.5} />
              </div>
              <p className="mt-5 font-display text-lg leading-snug text-foreground">
                Learn more about your rights.
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                The Legal Library has plain-English guides on every right identified here.
              </p>
              <button
                onClick={() => navigate("/library")}
                className="mt-4 inline-flex items-center gap-1.5 text-sm italic text-brass underline decoration-brass/40 underline-offset-4"
              >
                Open Library <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </aside>
        </div>
      )}
    </AppLayout>
  )
}
