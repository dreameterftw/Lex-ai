import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileSearch,
  Gavel,
  Loader2,
  RotateCcw,
  Scale,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { analyzeSituation } from "../api/situationApi.js"
import { getSession } from "../api/sessionApi.js"
import { INDIAN_JURISDICTIONS } from "../utils/indiaJurisdictions.js"

const MAX_CHARS = 2000
const MIN_CHARS = 10

const EXAMPLES = [
  {
    label: "Landlord dispute",
    text: "My landlord is refusing to return my security deposit and is claiming vague repair costs without invoices. I moved out after giving notice and have photos of the flat from the last day.",
  },
  {
    label: "Salary not paid",
    text: "My employer has not paid my salary for two months and keeps saying payment will happen next week. I have emails, payslips from earlier months, and my employment contract.",
  },
  {
    label: "Consumer complaint",
    text: "I bought an appliance online and it stopped working within the warranty period. The seller and service centre are both refusing repair or replacement despite repeated emails.",
  },
]

const PROGRESS = [
  "Situation",
  "Document",
  "Rights",
  "Deadlines",
  "Counsel",
  "Signal",
  "Timeline",
  "Court Prep",
]

const TONES = {
  neutral: "border-border bg-muted text-foreground",
  warning: "border-brass/30 bg-brass/10 text-brass",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  success: "border-border bg-secondary text-foreground",
}

const getPayload = (response, fallback) => response?.data ?? fallback

function ResultBadge({ label, tone = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {label}
    </span>
  )
}

function ProgressTracker({ done }) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Session progress
        </p>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {done ? "1" : "0"} / {PROGRESS.length}
        </span>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brass transition-all duration-500"
          style={{ width: `${(done ? 1 : 0) * (100 / PROGRESS.length)}%` }}
        />
      </div>

      <ol className="mt-5 space-y-3">
        {PROGRESS.map((step, index) => {
          const isDone = index === 0 && done
          const isActive = index === 0 && !done

          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium tabular-nums transition-colors ${
                  isDone
                    ? "border-brass bg-brass text-background"
                    : isActive
                      ? "border-brass text-brass"
                      : "border-border text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <span
                className={`text-sm ${
                  isActive
                    ? "font-medium text-foreground"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

function SituationResult({ result, sessionId, onReset }) {
  const severityTone =
    result.severity === "High"
      ? "danger"
      : result.severity === "Medium"
        ? "warning"
        : "success"

  return (
    <div className="space-y-6">
      {/* Hero — classification */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="min-w-0">
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
              Situation classified
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
              {result.legalCategory || "Legal situation"}
            </h1>
            {result.subcategory && (
              <p className="mt-2 text-sm text-muted-foreground">{result.subcategory}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {result.severity && (
              <ResultBadge label={`${result.severity} severity`} tone={severityTone} />
            )}
            {result.timeIsSensitive && <ResultBadge label="Time sensitive" tone="warning" />}
            {result.needsLawyer && <ResultBadge label="Lawyer recommended" tone="danger" />}
          </div>
        </div>

        {result.reasoning && (
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-display text-lg">Why LEX classified it this way</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {result.reasoning}
            </p>
          </div>
        )}
      </section>

      {/* Alerts — semantic tokens, consistent layout */}
      {result.timeIsSensitive && (
        <section className="flex gap-3 rounded-2xl border border-brass/30 bg-brass/5 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-foreground">This may be time sensitive</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Deadlines or notice periods may affect your options. Continue to the next steps and
              preserve records now.
            </p>
          </div>
        </section>
      )}

      {result.needsLawyer && (
        <section className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-foreground">
              A lawyer may be important here
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {result.needsLawyerReason ||
                "This situation may involve risk, urgency, or procedural complexity."}
            </p>
          </div>
        </section>
      )}

      {/* Next action */}
      <section className="rounded-2xl border border-border bg-secondary/40 p-6">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background">
            <Gavel className="h-5 w-5 text-brass" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Suggested next action
            </p>
            <h2 className="mt-2 font-display text-xl leading-snug">
              {result.suggestedNextStep || "Upload or review your documents next."}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              LEX will use this classification as context for document analysis, rights
              identification, deadlines, and letters.
            </p>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/document/${sessionId}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground sm:flex-none"
        >
          Continue to Document X-Ray
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:flex-none"
        >
          <RotateCcw className="h-4 w-4" />
          Re-describe situation
        </button>
      </div>
    </div>
  )
}

export default function SituationPage() {
  const { sessionId } = useParams()
  const [description, setDescription] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const charsRemaining = MAX_CHARS - description.length
  const canSubmit =
    description.trim().length >= MIN_CHARS && jurisdiction.trim() && !submitting
  const progressDone = !!result?.completedAt

  const formHint = useMemo(() => {
    if (description.length === 0)
      return "Describe what happened, who is involved, dates, documents, and what outcome you want."
    if (description.trim().length < MIN_CHARS)
      return `Add at least ${MIN_CHARS - description.trim().length} more characters.`
    return "Good. Add dates, amounts, notices, or messages if they matter."
  }, [description])

  useEffect(() => {
    document.title = "Situation Finder — LEX"

    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await getSession(sessionId)
        const data = getPayload(response, null)
        const existing = data?.context?.situation

        setJurisdiction(existing?.jurisdiction || data?.jurisdiction || "")

        if (existing?.completedAt) {
          setDescription(existing.rawDescription || "")
          setResult(existing)
        }
      } catch (err) {
        setError(err.message || "Failed to load this session.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [sessionId])

  const handleExample = (text) => {
    setDescription(text.slice(0, MAX_CHARS))
    setResult(null)
    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) {
      setError("Please describe the situation and confirm the jurisdiction.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const response = await analyzeSituation(
        sessionId,
        description.trim(),
        jurisdiction.trim(),
      )
      setResult(getPayload(response, null))
    } catch (err) {
      setError(err.message || "Failed to analyze this situation.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError("")
  }

  return (
    <AppLayout sessionId={sessionId} currentFeature="situation">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* MAIN */}
        <div className="min-w-0">
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-brass" />
                <span className="text-sm">Loading session…</span>
              </div>
            </div>
          ) : result ? (
            <SituationResult
              result={result}
              sessionId={sessionId}
              onReset={handleReset}
            />
          ) : (
            <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
              {/* Header */}
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted md:flex">
                  <FileSearch className="h-6 w-6 text-brass" strokeWidth={1.4} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
                    Step 01
                  </p>
                  <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
                    Situation Finder
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Tell LEX what happened in plain English. It will classify the issue, identify
                    urgency, and create the working context for the rest of your legal session.
                  </p>
                </div>
              </div>

              {/* Examples */}
              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-brass" />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Start from an example
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => handleExample(example.text)}
                      className="group h-full rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-brass/50 hover:bg-secondary/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{example.label}</p>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brass" />
                      </div>
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                        {example.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Your state or union territory
                  </span>
                  <select
                    required
                    value={jurisdiction}
                    onChange={(event) => setJurisdiction(event.target.value)}
                    className="mt-2 w-full cursor-pointer rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20"
                  >
                    <option value="" disabled>
                      Select your state or union territory
                    </option>
                    {INDIAN_JURISDICTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Describe your situation
                    </span>
                    <span
                      className={`text-[10px] tabular-nums ${
                        charsRemaining < 100 ? "text-brass" : "text-muted-foreground"
                      }`}
                    >
                      {description.length}/{MAX_CHARS}
                    </span>
                  </div>
                  <textarea
                    required
                    rows={9}
                    maxLength={MAX_CHARS}
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value)
                      setError("")
                    }}
                    placeholder="Example: My landlord is refusing to return my deposit even though I gave notice and have move-out photos..."
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-brass focus:ring-2 focus:ring-brass/20"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{formHint}</p>
                </label>

                {error && (
                  <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing situation…</span>
                      <Scale className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Analyze situation</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <ProgressTracker done={progressDone} />

          <section className="rounded-2xl border border-border bg-secondary/40 p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              What LEX needs
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {[
                "Dates or rough timeline",
                "Who is involved",
                "Documents or messages you have",
                "What outcome you want",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </AppLayout>
  )
}
