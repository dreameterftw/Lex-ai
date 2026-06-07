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

const getPayload = (response, fallback) => response?.data ?? fallback

function ResultBadge({ label, tone = "neutral" }) {
  const tones = {
    neutral: "border-border bg-muted text-foreground",
    warning: "border-orange-200 bg-orange-50 text-orange-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-700",
  }

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${tones[tone]}`}>
      {label}
    </span>
  )
}

function ProgressTracker({ done }) {
  return (
    <aside className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Session progress</p>
      <div className="mt-5 space-y-3">
        {PROGRESS.map((step, index) => {
          const isDone = index === 0 && done
          const isActive = index === 0 && !done

          return (
            <div key={step} className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium ${
                  isDone
                    ? "border-brass bg-brass text-white"
                    : isActive
                      ? "border-brass text-brass"
                      : "border-border text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : String(index + 1).padStart(2, "0")}
              </span>
              <span className={`text-sm ${index === 0 ? "text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function SituationResult({ result, sessionId, onReset }) {
  const severityTone = result.severity === "High" ? "danger" : result.severity === "Medium" ? "warning" : "success"

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
              Situation classified.
            </p>
            <h1 className="mt-4 font-display text-3xl">{result.legalCategory || "Legal situation"}</h1>
            {result.subcategory && (
              <p className="mt-2 text-sm text-muted-foreground">{result.subcategory}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {result.severity && <ResultBadge label={`${result.severity} severity`} tone={severityTone} />}
            {result.timeIsSensitive && <ResultBadge label="Time sensitive" tone="warning" />}
            {result.needsLawyer && <ResultBadge label="Lawyer recommended" tone="danger" />}
          </div>
        </div>

        {result.reasoning && (
          <div className="mt-8">
            <h2 className="font-display text-xl">Why LEX classified it this way</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.reasoning}</p>
          </div>
        )}
      </section>

      {result.timeIsSensitive && (
        <section className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 p-5 text-orange-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="text-sm font-medium">This may be time sensitive</h2>
            <p className="mt-1 text-sm leading-relaxed">
              Deadlines or notice periods may affect your options. Continue to the next steps and preserve records now.
            </p>
          </div>
        </section>
      )}

      {result.needsLawyer && (
        <section className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="text-sm font-medium">A lawyer may be important here</h2>
            <p className="mt-1 text-sm leading-relaxed">
              {result.needsLawyerReason || "This situation may involve risk, urgency, or procedural complexity."}
            </p>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-border bg-secondary/45 p-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background">
            <Gavel className="h-5 w-5 text-brass" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Suggested next action</p>
            <h2 className="mt-2 font-display text-xl">{result.suggestedNextStep || "Upload or review your documents next."}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              LEX will use this classification as context for document analysis, rights identification, deadlines, and letters.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/document/${sessionId}`}
          className="inline-flex items-center justify-center gap-3 rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground"
        >
          Continue to Document X-Ray
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-3 rounded-md border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
  const canSubmit = description.trim().length >= MIN_CHARS && jurisdiction.trim() && !submitting
  const progressDone = !!result?.completedAt

  const formHint = useMemo(() => {
    if (description.length === 0) return "Describe what happened, who is involved, dates, documents, and what outcome you want."
    if (description.trim().length < MIN_CHARS) return `Add at least ${MIN_CHARS - description.trim().length} more characters.`
    return "Good. Add dates, amounts, notices, or messages if they matter."
  }, [description])

  useEffect(() => {
    document.title = "Situation Finder - LEX"

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
      const response = await analyzeSituation(sessionId, description.trim(), jurisdiction.trim())
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-border bg-card">
              <Loader2 className="h-5 w-5 animate-spin text-brass" />
            </div>
          ) : result ? (
            <SituationResult result={result} sessionId={sessionId} onReset={handleReset} />
          ) : (
            <section className="rounded-lg border border-border bg-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-muted md:flex">
                  <FileSearch className="h-6 w-6 text-brass" strokeWidth={1.4} />
                </div>
                <div>
                  <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
                    Step 01.
                  </p>
                  <h1 className="mt-4 font-display text-3xl md:text-4xl">Situation Finder</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Tell LEX what happened in plain English. It will classify the issue, identify urgency, and create the working context for the rest of your legal session.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
                {EXAMPLES.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => handleExample(example.text)}
                    className="rounded-md border border-border bg-background p-4 text-left transition-colors hover:border-brass/50 hover:bg-secondary"
                  >
                    <p className="text-sm font-medium">{example.label}</p>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{example.text}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your state or union territory</span>
                  <select
                    required
                    value={jurisdiction}
                    onChange={(event) => setJurisdiction(event.target.value)}
                    className="mt-2 w-full cursor-pointer border-b border-border bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-brass"
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
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Describe your situation</span>
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
                    className="mt-2 w-full resize-none rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-brass"
                  />
                </label>

                <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>{formHint}</span>
                  <span className={charsRemaining < 100 ? "text-orange-600" : ""}>
                    {description.length}/{MAX_CHARS}
                  </span>
                </div>

                {error && (
                  <div className="flex gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group inline-flex w-full items-center justify-between gap-4 rounded-md bg-ink px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing situation...
                      </span>
                      <Scale className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Analyze situation
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </section>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <ProgressTracker done={progressDone} />
          <section className="rounded-lg border border-border bg-secondary/45 p-5">
            <p className="font-display text-lg">What LEX needs</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>Dates or rough timeline</li>
              <li>Who is involved</li>
              <li>Documents or messages you have</li>
              <li>What outcome you want</li>
            </ul>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
