import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Heart,
  Shield,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { runHealthCheck, getHealthCheckHistory } from "../api/healthCheckApi.js"
import { useAuthContext } from "../context/useAuthContext.js"

const HEALTH_CHECK_QUESTIONS = [
  {
    id: "contracts_reviewed",
    question: "Have you carefully reviewed all relevant contracts or agreements?"
  },
  {
    id: "evidence_preserved",
    question: "Have you preserved all relevant evidence (emails, messages, documents)?"
  },
  {
    id: "statute_of_limitations",
    question: "Are you within the statute of limitations for this claim?"
  },
  {
    id: "legal_representation",
    question: "Have you considered consulting with a lawyer about this situation?"
  },
  {
    id: "financial_readiness",
    question: "Are you financially prepared for potential legal costs?"
  },
  {
    id: "documentation_complete",
    question: "Do you have complete documentation of the incident or dispute?"
  },
  {
    id: "communication_recorded",
    question: "Have you documented all communications with the other party?"
  },
  {
    id: "timeline_clear",
    question: "Can you clearly establish a timeline of events?"
  },
]

const SEVERITY_CONFIG = {
  High: "text-red-600 bg-red-50 border-red-200",
  Medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Low: "text-green-600 bg-green-50 border-green-200",
}

export default function HealthCheckPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [state, setState] = useState("choose") // choose, questionnaire, report
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getHealthCheckHistory()
        setHistory(res.data || [])
      } catch (err) {
        console.error("Failed to load health check history:", err)
      }
    }

    if (user) {
      loadHistory()
    }
  }, [user])

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    if (current < HEALTH_CHECK_QUESTIONS.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 300)
    }
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
  }

  const handleViewHistory = async (checkId) => {
    try {
      const histItem = history.find(h => h.id === checkId)
      if (histItem) {
        setReport(histItem)
        setState("report")
      }
    } catch (err) {
      console.error("Error loading historical report:", err)
    }
  }

  const progressPercent = ((Object.keys(answers).length) / HEALTH_CHECK_QUESTIONS.length) * 100
  const answerCount = Object.keys(answers).length

  return (
    <AppLayout sessionId={null} currentFeature="health-check">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Legal Health Check
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Health Checkup</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Answer a brief questionnaire to audit your legal readiness and identify exposure areas before a dispute escalates.
        </p>
      </div>

      {state === "choose" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8 text-center">
              <Heart className="mx-auto h-12 w-12 text-brass" />
              <h2 className="mt-4 font-display text-2xl">Ready to take a legal health check?</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                LEX Counsel will ask 8 quick yes/no questions about your preparation, evidence, timeline, and legal readiness.
                The result is a personalized exposure report with recommendations.
              </p>

              <button
                onClick={() => setState("questionnaire")}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-8 py-4 text-sm font-medium text-white hover:bg-foreground"
              >
                Start Health Check
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {history.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-sm font-medium">Previous checks</h3>
                <div className="space-y-3">
                  {history.slice(0, 3).map((check, i) => (
                    <button
                      key={check.id || i}
                      onClick={() => handleViewHistory(check.id)}
                      className="w-full text-left rounded-2xl border border-border bg-background p-4 hover:border-brass/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{check.overallScore || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(check.timestamp || check.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${SEVERITY_CONFIG[check.overallScore] || SEVERITY_CONFIG.Low}`}>
                          {check.exposureCount || 0} exposures
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">What you'll learn</p>
              <div className="space-y-3">
                {[
                  "Your overall legal readiness score",
                  "Specific risk areas and exposure gaps",
                  "Prioritized action steps to strengthen your case",
                  "Resources to close the gaps",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Proactive legal hygiene</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    A strong legal case isn't built in court — it's built in the weeks and months before a dispute starts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {state === "questionnaire" && (
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brass transition-all rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0 font-medium">
                {answerCount} / {HEALTH_CHECK_QUESTIONS.length}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-8">
            <div>
              <p className="font-display text-xl leading-snug">
                {HEALTH_CHECK_QUESTIONS[current].question}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleAnswer(HEALTH_CHECK_QUESTIONS[current].id, false)}
                className="flex-1 max-w-[140px] rounded-xl border-2 border-border bg-background py-3 text-sm font-medium transition-all hover:border-foreground"
              >
                No
              </button>
              <button
                onClick={() => handleAnswer(HEALTH_CHECK_QUESTIONS[current].id, true)}
                className="flex-1 max-w-[140px] rounded-xl border-2 border-brass bg-brass/5 py-3 text-sm font-medium text-brass transition-all hover:bg-brass/10"
              >
                Yes
              </button>
            </div>
          </div>

          {/* Submit button when done */}
          {answerCount === HEALTH_CHECK_QUESTIONS.length && (
            <div className="mt-8 text-center">
              <button
                onClick={handleComplete}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-8 py-4 text-sm font-medium text-white hover:bg-foreground disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span>Generating report…</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
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

      {state === "report" && report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            {/* Overall Score */}
            <div className="rounded-3xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Legal Health Score</p>
              <p className={`font-display text-4xl md:text-5xl font-bold ${
                report.overallScore === "Good" ? "text-green-600" :
                report.overallScore === "Fair" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {report.overallScore}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {report.overallScore === "Good" && "You're well-prepared. Keep maintaining strong legal hygiene."}
                {report.overallScore === "Fair" && "Some gaps exist. Focus on the priority actions below."}
                {report.overallScore === "Needs Attention" && "Significant work needed. Start with the critical actions."}
              </p>
            </div>

            {/* Exposure Areas */}
            {report.exposures && report.exposures.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl">Risk areas</h2>
                {report.exposures.map((exposure, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <p className="text-sm font-medium">{exposure.area}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${SEVERITY_CONFIG[exposure.severity]}`}>
                        {exposure.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{exposure.risk}</p>
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <ArrowRight className="h-3.5 w-3.5 text-brass shrink-0 mt-0.5" />
                      <p className="text-xs">{exposure.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl">Recommended next steps</h2>
                {report.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-xl border border-brass/20 bg-brass/5 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-brass shrink-0 mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRestartQuestionnaire}
                className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground hover:border-foreground transition-all"
              >
                Retake Health Check
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-foreground"
              >
                Back to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">About this assessment</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This health check audits 8 key dimensions of legal readiness: documentation, evidence preservation, timeline clarity, and preparedness.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Remember</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is not legal advice. For guidance on your specific situation, consult with a qualified attorney.
              </p>
            </div>
          </div>
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
