import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Upload,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { analyzeDocument } from "../api/documentApi.js"
import { getSession } from "../api/sessionApi.js"

const SEVERITY_CONFIG = {
  High: {
    border: "border-destructive/30",
    bg: "bg-destructive/5",
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    dot: "bg-destructive",
    label: "text-destructive",
  },
  Medium: {
    border: "border-brass/30",
    bg: "bg-brass/5",
    badge: "bg-brass/10 text-brass border-brass/30",
    dot: "bg-brass",
    label: "text-brass",
  },
  Low: {
    border: "border-border",
    bg: "bg-card",
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/50",
    label: "text-muted-foreground",
  },
}

const RISK_CONFIG = {
  High: "text-destructive bg-destructive/10 border-destructive/30",
  Medium: "text-brass bg-brass/10 border-brass/30",
  Low: "text-muted-foreground bg-muted border-border",
}

async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const pdfjsLib = await import(
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs"
        )

        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.mjs"

        const typedArray = new Uint8Array(event.target?.result)
        const pdf = await pdfjsLib.getDocument(typedArray).promise

        let fullText = ""
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const text = content.items.map((item) => item.str).join(" ")
          fullText += text + "\n\n"
        }

        if (!fullText.trim()) {
          reject(new Error("No text found. The PDF may be scanned or image-based."))
          return
        }

        resolve(fullText.trim())
      } catch (err) {
        reject(new Error("Failed to read PDF: " + (err?.message || "Unknown error")))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file."))
    reader.readAsArrayBuffer(file)
  })
}

export default function DocumentPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const dropRef = useRef(null)

  const [fetching, setFetching] = useState(true)
  const [result, setResult] = useState(null)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(new Set([0]))

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSession(sessionId)
        const documentContext = res.data?.context?.document
        if (documentContext) setResult(documentContext)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [sessionId])

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFile(dropped)
  }
  const handleFileInput = (e) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }
  const handleFile = (f) => {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.")
      return
    }
    setFile(f)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!file) return
    setError(null)
    setExtracting(true)

    let rawText
    try {
      rawText = await extractTextFromPDF(file)
    } catch (err) {
      setError(err?.message || "Unable to extract text from the PDF.")
      setExtracting(false)
      return
    }

    setExtracting(false)
    setAnalyzing(true)

    try {
      const res = await analyzeDocument(sessionId, rawText, file.name)
      setResult(res.data)
      setExpanded(new Set([0]))
    } catch (err) {
      setError(err?.message || "Analysis failed. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const toggleExpanded = (index) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  if (fetching) {
    return (
      <AppLayout sessionId={sessionId} currentFeature="document">
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-brass" />
        </div>
      </AppLayout>
    )
  }

  const hasFlagged = result?.flaggedClauses?.length > 0
  const severityCounts = { High: 0, Medium: 0, Low: 0 }
  result?.flaggedClauses?.forEach((c) => {
    if (severityCounts[c.severity] !== undefined) severityCounts[c.severity] += 1
  })

  return (
    <AppLayout sessionId={sessionId} currentFeature="document">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Step 2 of 8.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Document X-Ray</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-2xl">
          Upload any legal document — lease, employment contract, NDA, court summons.
          LEX reads every clause and flags what is unfair, unusual, or potentially illegal.
        </p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6 min-w-0">
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-all p-10 text-center cursor-pointer ${
                dragging
                  ? "border-brass bg-brass/5"
                  : file
                  ? "border-brass/40 bg-brass/5"
                  : "border-border bg-card hover:border-brass/40"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brass/10">
                    <FileText className="h-6 w-6 text-brass" strokeWidth={1.4} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyse
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" strokeWidth={1.4} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drop your PDF here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse · max 10MB</p>
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    Lease · Contract · NDA · Summons · Any legal PDF
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {(extracting || analyzing) && (
              <div className="rounded-2xl border border-border bg-card px-5 py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-brass shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {extracting ? "Extracting text from PDF…" : "Analysing document clauses…"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {extracting
                        ? "Reading your document locally — it never leaves your device"
                        : "LEX is reviewing every clause against your jurisdiction's laws"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {file && !extracting && !analyzing && (
              <button
                onClick={handleAnalyze}
                className="group w-full inline-flex items-center justify-between gap-4 rounded-xl bg-ink px-6 py-4 text-sm font-medium text-background transition-colors hover:bg-foreground"
              >
                <span>Analyse document</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            <button
              onClick={() => navigate(`/rights/${sessionId}`)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Skip — I don't have a document to upload
            </button>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Privacy</p>
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-brass shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your PDF is read locally in your browser using PDF.js. The actual file{" "}
                  <strong className="text-foreground">never leaves your device</strong>.
                  Only the extracted text is sent for analysis.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                What LEX looks for
              </p>
              <ul className="space-y-2">
                {[
                  "Clauses that waive your legal rights",
                  "Terms that are unusual or one-sided",
                  "Missing protections that should be present",
                  "Provisions that may be unenforceable",
                  "Points you could negotiate before signing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brass shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6 min-w-0">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Document type
                  </p>
                  <h2 className="mt-1 font-display text-2xl break-words">
                    {result.documentType || "Untitled document"}
                  </h2>
                  {result.fileName && (
                    <p className="mt-1 text-sm text-muted-foreground truncate">{result.fileName}</p>
                  )}
                </div>
                {result.overallRisk && (
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${RISK_CONFIG[result.overallRisk]}`}
                  >
                    {result.overallRisk} risk
                  </span>
                )}
              </div>

              {result.summary && (
                <div className="mt-5 border-t border-border pt-5">
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </div>
              )}
            </div>

            {hasFlagged ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Flagged clauses
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">{result.flaggedClauses.length}</span>
                </div>

                <div className="space-y-3">
                  {result.flaggedClauses.map((clause, i) => {
                    const config = SEVERITY_CONFIG[clause.severity] || SEVERITY_CONFIG.Low
                    const isExpanded = expanded.has(i)

                    return (
                      <div key={i} className={`rounded-2xl border ${config.border} ${config.bg}`}>
                        <button
                          onClick={() => toggleExpanded(i)}
                          className="w-full grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 text-left"
                        >
                          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium truncate">{clause.clauseId}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${config.badge}`}
                              >
                                {clause.severity}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground truncate">
                              {clause.issue}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-inherit px-5 py-4 space-y-4">
                            {clause.originalText && (
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                                  Original clause
                                </p>
                                <p className="text-xs font-mono leading-relaxed bg-background/60 rounded-xl px-3 py-2.5 text-muted-foreground">
                                  "{clause.originalText}"
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                                What this means
                              </p>
                              <p className="text-sm leading-relaxed">{clause.plainEnglish}</p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                                Why it's a problem
                              </p>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {clause.issue}
                              </p>
                            </div>

                            {clause.law && (
                              <div className="flex items-start gap-2 rounded-xl bg-background/60 px-3 py-2">
                                <Info className="h-3.5 w-3.5 text-brass shrink-0 mt-0.5" />
                                <p className="text-xs text-brass leading-relaxed">{clause.law}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brass/10">
                  <ShieldCheck className="h-6 w-6 text-brass" strokeWidth={1.4} />
                </div>
                <p className="mt-4 font-display text-lg">No clauses flagged</p>
                <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                  LEX didn't find any unfair, unusual, or unenforceable clauses in this document.
                </p>
              </div>
            )}

            {result.missingProtections?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Missing protections
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                  {result.missingProtections.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-4">
                      <AlertTriangle className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.userLeveragePoints?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Your leverage points
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                  {result.userLeveragePoints.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-4">
                      <CheckCircle2 className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setError(null)
                }}
                className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Upload different document
              </button>
              <button
                onClick={() => navigate(`/rights/${sessionId}`)}
                className="group flex-1 inline-flex items-center justify-between gap-4 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground"
              >
                Continue to Rights Navigator
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Risk summary
              </p>
              <div className="space-y-3">
                {["High", "Medium", "Low"].map((sev) => {
                  const count = severityCounts[sev]
                  const config = SEVERITY_CONFIG[sev]
                  return (
                    <div
                      key={sev}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${config.dot}`} />
                        <span className="text-xs text-muted-foreground truncate">
                          {sev} severity
                        </span>
                      </div>
                      <span className="text-xs font-medium tabular-nums">
                        {count} clause{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-brass shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-medium">Your file stayed on your device</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Only the extracted text was sent for analysis. The PDF itself was never
                    uploaded anywhere.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AppLayout>
  )
}
