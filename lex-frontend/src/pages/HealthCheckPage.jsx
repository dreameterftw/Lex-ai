import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Heart,
  Shield,
  RotateCcw,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { runHealthCheck, getHealthCheckHistory } from "../api/healthCheckApi.js"
import { useAuthContext } from "../context/useAuthContext.js"

const HEALTH_CHECK_QUESTIONS = [
  { id: "contracts_reviewed", question: "Have you carefully reviewed all relevant contracts or agreements?" },
  { id: "evidence_preserved", question: "Have you preserved all relevant evidence (emails, messages, documents)?" },
  { id: "statute_of_limitations", question: "Are you within the statute of limitations for this claim?" },
  { id: "legal_representation", question: "Have you considered consulting with a lawyer about this situation?" },
  { id: "financial_readiness", question: "Are you financially prepared for potential legal costs?" },
  { id: "documentation_complete", question: "Do you have complete documentation of the incident or dispute?" },
  { id: "communication_recorded", question: "Have you documented all communications with the other party?" },
  { id: "timeline_clear", question: "Can you clearly establish a timeline of events?" },
]

// Semantic severity styling — uses tokens, no raw colors.
const SEVERITY_CONFIG = {
  High: "text-destructive bg-destructive/10 border-destructive/30",
  Medium: "text-brass bg-brass/10 border-brass/30",
  Low: "text-foreground bg-muted border-border",
}

const SCORE_TONE = {
  Good: "text-brass",
  Fair: "text-foreground",
  "Needs Attention": "text-destructive",
}

const SCORE_BLURB = {
  Good: "You're well-prepared. Keep maintaining strong legal hygiene.",
  Fair: "Some gaps exist. Focus on the priority actions below.",
  "Needs Attention": "Significant work needed. Start with the critical actions.",
}

export default function HealthCheckPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [state, setState] = useState("choose") // choose | questionnaire | report
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const res = await getHealthCheckHistory()
        setHistory(res.data || [])
      } catch (err) {
        console.error("Failed to load health check history:", err)
      }
    })()
  }, [user])

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    if (current < HEALTH_CHECK_QUESTIONS.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 250)
    }
  }

  const handleBack = () => {
    if (current > 0) setCurrent((c) => c - 1)
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await runHealthCheck(answers)
      setReport(res.data)
      setState("report")
      setHistory([res.data, ...history])
    } catch (err) {
      setError(err.message || "Failed to generate health check report.")
    } finally {
      setLoading(false)
    }
  }

  const handleRestartQuestionnaire = () => {
    setState("questionnaire")
    setCurrent(0)
    setAnswers({})
    setReport(null)
    setError(null)
  }

  const handleViewHistory = (checkId) => {
    const histItem = history.find((h) => h.id === checkId)
    if (histItem) {
      setReport(histItem)
      setState("report")
    }
  }

  const answerCount = Object.keys(answers).length
  const progressPercent = (answerCount / HEALTH_CHECK_QUESTIONS.length) * 100
  const currentQuestion = HEALTH_CHECK_QUESTIONS[current]

  return (
    <AppLayout sessionId={null} currentFeature="health-check">
      {/* Page header */}
      <header className="mb-10 max-w-2xl">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Legal Health Check
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Health Checkup</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Answer a brief questionnaire to audit your legal readiness and identify exposure areas
          before a dispute escalates.
        </p>
      </header>

      {/* ───────────────────── CHOOSE ───────────────────── */}
      {state === "choose" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
          {/* Left column */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/10">
                <Heart className="h-7 w-7 text-brass" />
              </div>
              <h2 className="mt-5 font-display text-2xl">Ready to take a legal health check?</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                LEX Counsel will ask 8 quick yes/no questions about your preparation, evidence,
                timeline, and legal readiness. The result is a personalized exposure report with
                recommendations.
              </p>
              <button
                onClick={() => setState("questionnaire")}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-7 py-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground"
              >
                Start Health Check
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>

            {history.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium">Previous checks</h3>
                  <span className="text-xs text-muted-foreground">{history.length} total</span>
                </div>
                <ul className="space-y-3">
                  {history.slice(0, 3).map((check, i) => (
                    <li key={check.id || i}>
                      <button
                        onClick={() => handleViewHistory(check.id)}
                        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-brass/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {check.overallScore || "Unknown"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(check.timestamp || check.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                            SEVERITY_CONFIG[check.overallScore] || SEVERITY_CONFIG.Low
                          }`}
                        >
                          {check.exposureCount || 0} exposures
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right column — sidebar tiles, equal radii (rounded-2xl) */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                What you'll learn
              </p>
              <ul className="space-y-3">
                {[
                  "Your overall legal readiness score",
                  "Specific risk areas and exposure gaps",
                  "Prioritized action steps to strengthen your case",
                  "Resources to close the gaps",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Proactive legal hygiene</p>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    A strong legal case isn't built in court — it's built in the weeks and months
                    before a dispute starts.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ───────────────────── QUESTIONNAIRE ───────────────────── */}
      {state === "questionnaire" && (
        <div className="mx-auto max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Question {Math.min(current + 1, HEALTH_CHECK_QUESTIONS.length)} of{" "}
                {HEALTH_CHECK_QUESTIONS.length}
              </span>
              <span className="font-medium">
                {answerCount} / {HEALTH_CHECK_QUESTIONS.length} answered
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brass transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <section className="rounded-2xl border border-border bg-card p-8 sm:p-10">
            <p className="text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {currentQuestion.id.replace(/_/g, " ")}
            </p>
            <p className="mx-auto mt-4 max-w-lg text-center font-display text-xl leading-snug sm:text-2xl">
              {currentQuestion.question}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:mx-auto sm:max-w-sm">
              <button
                onClick={() => handleAnswer(currentQuestion.id, false)}
                className={`rounded-xl border-2 py-3 text-sm font-medium transition-all ${
                  answers[currentQuestion.id] === false
                    ? "border-foreground bg-foreground/5"
                    : "border-border bg-background hover:border-foreground/60"
                }`}
              >
                No
              </button>
              <button
                onClick={() => handleAnswer(currentQuestion.id, true)}
                className={`rounded-xl border-2 py-3 text-sm font-medium text-brass transition-all ${
                  answers[currentQuestion.id] === true
                    ? "border-brass bg-brass/15"
                    : "border-brass/60 bg-brass/5 hover:bg-brass/10"
                }`}
              >
                Yes
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                onClick={handleBack}
                disabled={current === 0}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                Previous
              </button>
              <span>Tap an answer to continue</span>
            </div>
          </section>

          {answerCount === HEALTH_CHECK_QUESTIONS.length && (
            <div className="mt-8 text-center">
              <button
                onClick={handleComplete}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-8 py-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating report…</span>
                  </>
                ) : (
                  <>
                    <span>View Your Health Report</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────── REPORT ───────────────────── */}
      {state === "report" && report && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr] lg:gap-8">
          <div className="space-y-6">
            {/* Overall score */}
            <section className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Legal Health Score
              </p>
              <p
                className={`mt-3 font-display text-4xl font-bold md:text-5xl ${
                  SCORE_TONE[report.overallScore] || "text-foreground"
                }`}
              >
                {report.overallScore}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                {SCORE_BLURB[report.overallScore]}
              </p>
            </section>

            {/* Exposures */}
            {report.exposures && report.exposures.length > 0 && (
              <section className="space-y-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                  <h2 className="font-display text-xl">Risk areas</h2>
                  <span className="text-xs text-muted-foreground">
                    {report.exposures.length} found
                  </span>
                </div>
                <ul className="space-y-3">
                  {report.exposures.map((exposure, i) => (
                    <li key={i} className="rounded-2xl border border-border bg-card p-5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <p className="min-w-0 text-sm font-medium">{exposure.area}</p>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                            SEVERITY_CONFIG[exposure.severity] || SEVERITY_CONFIG.Low
                          }`}
                        >
                          {exposure.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {exposure.risk}
                      </p>
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                        <p className="text-xs leading-relaxed">{exposure.action}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display text-xl">Recommended next steps</h2>
                <ul className="space-y-3">
                  {report.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="rounded-2xl border border-brass/25 bg-brass/5 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleRestartQuestionnaire}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Health Check
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground"
              >
                Back to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                About this assessment
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This health check audits 8 key dimensions of legal readiness: documentation,
                evidence preservation, timeline clarity, and preparedness.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Remember
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is not legal advice. For guidance on your specific situation, consult with a
                qualified attorney.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
