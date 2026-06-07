import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileText,
  Gavel,
  Loader2,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { generateCourtPrep, getCourtPrep } from "../api/courtPrepApi.js"
import { getSession } from "../api/sessionApi.js"

export default function CourtPrepPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [courtPrep, setCourtPrep] = useState(null)
  const [situation, setSituation] = useState(null)
  const [rightsCount, setRightsCount] = useState(0)
  const [error, setError] = useState(null)
  const briefRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [sessionRes, courtPrepRes] = await Promise.all([
          getSession(sessionId),
          getCourtPrep(sessionId).catch(() => null)
        ])

        setSituation(sessionRes.data?.context?.situation || null)
        setRightsCount(sessionRes.data?.context?.rights?.identified?.length || 0)

        if (courtPrepRes?.data) {
          setCourtPrep(courtPrepRes.data)
        }
      } catch (err) {
        setError(err.message || "Failed to load court prep.")
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
      const res = await generateCourtPrep(sessionId)
      setCourtPrep(res.data)
    } catch (err) {
      setError(err.message || "Unable to generate court prep brief.")
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!courtPrep || !briefRef.current) return
    window.print()
  }

  const canGenerate = !!situation?.legalCategory && rightsCount > 0 && !generating

  return (
    <AppLayout sessionId={sessionId} currentFeature="court-prep">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Step 8 of 8.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Court Prep Brief</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Generate a plain-English hearing guide with what to bring, opening statements, key arguments, likely questions, and how to respond confidently.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-brass" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <main className="lg:col-span-8 space-y-6">
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Court Prep status</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {courtPrep
                      ? "A preparation brief has already been generated for this session."
                      : "Generate a new brief whenever you’re ready for court or tribunal preparation."}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? "Generating…" : courtPrep ? "Regenerate brief" : "Generate brief"}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={!courtPrep}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Download brief as PDF
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Situation complete</p>
                  <p className="mt-2 text-sm text-foreground">
                    {situation?.legalCategory ? "Yes" : "No"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Rights identified</p>
                  <p className="mt-2 text-sm text-foreground">{rightsCount}</p>
                </div>
              </div>

              {!situation?.legalCategory && (
                <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm font-medium text-yellow-800">Situation Finder required</p>
                  <p className="mt-2 text-sm text-yellow-700">
                    Complete the Situation Finder before generating court prep guidance.
                  </p>
                  <button
                    onClick={() => navigate(`/situation/${sessionId}`)}
                    className="mt-3 inline-flex text-sm font-medium text-yellow-900 underline underline-offset-2"
                  >
                    Go to Situation Finder
                  </button>
                </div>
              )}

              {!rightsCount && (
                <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm font-medium text-yellow-800">Rights Navigator required</p>
                  <p className="mt-2 text-sm text-yellow-700">
                    Identify the rights that apply to your case before generating court preparation guidance.
                  </p>
                  <button
                    onClick={() => navigate(`/rights/${sessionId}`)}
                    className="mt-3 inline-flex text-sm font-medium text-yellow-900 underline underline-offset-2"
                  >
                    Go to Rights Navigator
                  </button>
                </div>
              )}
            </div>

            {courtPrep ? (
              <div ref={briefRef} className="space-y-6 printable-area">
                <div className="rounded-3xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brass/10">
                      <Gavel className="h-5 w-5 text-brass" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Court type</p>
                      <p className="mt-1 text-sm text-muted-foreground">{courtPrep.briefContent?.courtType || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-background p-6">
                  <p className="text-sm font-medium">What to bring</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {courtPrep.briefContent?.whatToBring?.map((item, index) => (
                      <div key={index} className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <section className="rounded-3xl border border-border bg-card p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-brass" />
                    <h2 className="text-lg font-semibold">Opening statement</h2>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {courtPrep.briefContent?.openingStatement}
                  </p>
                </section>

                <section className="rounded-3xl border border-border bg-background p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-brass" />
                    <h2 className="text-lg font-semibold">Key arguments</h2>
                  </div>
                  <div className="space-y-3">
                    {courtPrep.briefContent?.keyArguments?.map((argument, index) => (
                      <p key={index} className="text-sm text-muted-foreground">• {argument}</p>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-border bg-card p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-brass" />
                    <h2 className="text-lg font-semibold">Likely questions & answers</h2>
                  </div>
                  <div className="space-y-4">
                    {courtPrep.briefContent?.likelyQuestions?.map((item, index) => (
                      <div key={index} className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-sm font-medium">Q: {item.question}</p>
                        <p className="mt-2 text-sm text-muted-foreground">A: {item.suggestedAnswer}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-border bg-background p-6 space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Opposing arguments</p>
                      <div className="mt-3 space-y-2">
                        {courtPrep.briefContent?.opposingArguments?.map((item, index) => (
                          <p key={index} className="text-sm text-muted-foreground">• {item}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Counter arguments</p>
                      <div className="mt-3 space-y-2">
                        {courtPrep.briefContent?.counterArguments?.map((item, index) => (
                          <p key={index} className="text-sm text-muted-foreground">• {item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-border bg-card p-6 space-y-5">
                  <div>
                    <p className="text-sm font-medium">What not to say</p>
                    <div className="mt-3 space-y-2">
                      {courtPrep.briefContent?.whatNotToSay?.map((item, index) => (
                        <p key={index} className="text-sm text-muted-foreground">• {item}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Final tip</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {courtPrep.briefContent?.finalTip}
                    </p>
                  </div>
                </section>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-brass" />
                <p className="mt-5 text-sm text-muted-foreground">
                  Generate a court prep brief to get a step-by-step guide for your hearing.
                </p>
              </div>
            )}
          </main>

          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Why this helps</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                This brief turns your case into clear courtroom instructions, so you know what to say, what to bring, and how to respond to the other side.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-brass shrink-0" />
                <div>
                  <p className="text-xs font-medium">Built from your session</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    The brief is grounded in your situation, documents, rights, deadlines, and any earlier legal work you've done in Lex.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/timeline/${sessionId}`)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground"
            >
              Review case timeline
              <ArrowRight className="h-4 w-4" />
            </button>
          </aside>
        </div>
      )}
    </AppLayout>
  )
}
