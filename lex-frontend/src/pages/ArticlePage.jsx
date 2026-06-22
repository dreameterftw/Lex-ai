import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, BookOpen, Gavel, Loader2, Quote, Scale, Shield } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { getArticle } from "../api/libraryApi.js"

// ── Markdown renderer for regular articles ────────────────────────────────────
function renderMarkdown(content) {
  if (!content) return null

  return content.split("\n\n").map((block, index) => {
    if (block.startsWith("# ")) {
      return (
        <h1 key={index} className="mt-8 font-display text-2xl font-semibold text-foreground first:mt-0">
          {block.replace(/^# /, "")}
        </h1>
      )
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-7 text-lg font-semibold text-foreground">
          {block.replace(/^## /, "")}
        </h2>
      )
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={index} className="mt-5 text-base font-semibold text-foreground">
          {block.replace(/^### /, "")}
        </h3>
      )
    }
    if (block.startsWith("- ") || block.includes("\n- ")) {
      const items = block.split("\n").filter(l => l.trim()).map(l => l.replace(/^- /, ""))
      return (
        <ul key={index} className="mt-4 space-y-2 pl-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (block.startsWith("> ")) {
      return (
        <blockquote key={index} className="mt-5 border-l-2 border-brass pl-4">
          <p className="text-sm italic leading-relaxed text-foreground">
            {block.replace(/^> /, "")}
          </p>
        </blockquote>
      )
    }
    if (block.startsWith("**") && block.endsWith("**") && block.split("\n").length === 1) {
      return (
        <p key={index} className="mt-4 text-sm font-semibold text-foreground">
          {block.replace(/\*\*/g, "")}
        </p>
      )
    }
    return (
      <p key={index} className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {inlineMarkdown(block)}
      </p>
    )
  })
}

// Handle inline bold/italic
function inlineMarkdown(text) {
  if (!text) return text
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

// ── Landmark case renderer ────────────────────────────────────────────────────
function LandmarkCaseView({ article }) {
  const [activeStage, setActiveStage] = useState(0)

  // Parse structured sections from content
  const sections = parseCaseSections(article.content)

  return (
    <div className="space-y-0">
      {/* Case header card */}
      <div className="rounded-2xl border border-brass/20 bg-brass/5 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="rounded-full border border-brass/20 bg-brass/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-brass">
            Landmark Case
          </span>
          <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-medium capitalize text-secondary-foreground">
            {article.category?.replace(/-/g, " ")}
          </span>
          {article.year && (
            <span className="text-[10px] text-muted-foreground">· {article.year}</span>
          )}
          {article.readingTime && (
            <span className="text-[10px] text-muted-foreground">· {article.readingTime} read</span>
          )}
        </div>

        <h1 className="font-display text-3xl leading-tight md:text-4xl">{article.title}</h1>
        {article.subtitle && (
          <p className="mt-2 text-base text-muted-foreground">{article.subtitle}</p>
        )}

        {/* Court / bench strip */}
        {(article.court || article.bench) && (
          <div className="mt-5 flex flex-wrap gap-4 rounded-xl border border-brass/15 bg-background/60 p-4">
            {article.court && (
              <div className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-brass" />
                <span className="text-xs text-muted-foreground">{article.court}</span>
              </div>
            )}
            {article.bench && (
              <div className="flex items-center gap-2">
                <Gavel className="h-3.5 w-3.5 text-brass" />
                <span className="text-xs text-muted-foreground">{article.bench}</span>
              </div>
            )}
          </div>
        )}

        {/* One-line summary */}
        {article.summary && (
          <p className="mt-5 text-sm leading-relaxed text-foreground/80">{article.summary}</p>
        )}
      </div>

      {/* Stage navigation (if stages exist) */}
      {sections.stages && sections.stages.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Case Stages
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.stages.map((stage, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveStage(i)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeStage === i
                    ? "border-brass bg-brass/10 text-brass"
                    : "border-border bg-card text-muted-foreground hover:border-brass/30 hover:text-foreground"
                }`}
              >
                <span className="mr-1.5 opacity-50">{String(i + 1).padStart(2, "0")}</span>
                {stage.title}
              </button>
            ))}
          </div>

          {/* Active stage content */}
          <div className="mt-4 rounded-xl border border-border bg-card p-5 md:p-6">
            <h3 className="font-semibold text-foreground">{sections.stages[activeStage].title}</h3>
            <div className="mt-3 space-y-3">
              {sections.stages[activeStage].content.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {inlineMarkdown(para)}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content sections */}
      <div className="mt-6 space-y-5">
        {sections.main.map((section, i) => {
          // Verdict box
          if (section.type === "verdict") {
            return (
              <div key={i} className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <Gavel className="h-4 w-4 text-green-700 dark:text-green-400" />
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-green-700 dark:text-green-400">
                    The Verdict
                  </p>
                </div>
                <div className="space-y-2">
                  {section.content.map((para, j) => (
                    <p key={j} className="text-sm leading-relaxed text-green-900 dark:text-green-100">
                      {inlineMarkdown(para)}
                    </p>
                  ))}
                </div>
              </div>
            )
          }

          // Pull quote
          if (section.type === "quote") {
            return (
              <div key={i} className="rounded-xl border border-brass/20 bg-brass/5 p-5">
                <Quote className="h-5 w-5 text-brass mb-3 opacity-60" />
                <p className="font-display text-base leading-relaxed text-foreground italic">
                  {section.content[0]}
                </p>
                {section.attribution && (
                  <p className="mt-2 text-[11px] text-muted-foreground">— {section.attribution}</p>
                )}
              </div>
            )
          }

          // Impact / what it means box
          if (section.type === "impact") {
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-brass" />
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brass">
                    What This Means For You
                  </p>
                </div>
                <div className="space-y-2">
                  {section.content.map((para, j) => (
                    <p key={j} className="text-sm leading-relaxed text-muted-foreground">
                      {inlineMarkdown(para)}
                    </p>
                  ))}
                </div>
              </div>
            )
          }

          // Regular section
          return (
            <div key={i} className="rounded-xl border border-border bg-card p-5 md:p-6">
              {section.heading && (
                <h2 className="mb-3 font-semibold text-foreground">{section.heading}</h2>
              )}
              <div className="space-y-3">
                {section.content.map((para, j) => (
                  <p key={j} className="text-sm leading-relaxed text-muted-foreground">
                    {inlineMarkdown(para)}
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Section parser for landmark cases ────────────────────────────────────────
function parseCaseSections(content) {
  if (!content) return { stages: [], main: [] }

  const lines = content.split("\n")
  const stages = []
  const main = []

  let currentSection = null
  let inStagesBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect stage markers like "### Stage 1:" or "### Stage N:"
    if (/^### Stage \d+[:\s—–-]/i.test(line)) {
      inStagesBlock = true
      if (currentSection) flushSection(currentSection, stages, main)
      currentSection = {
        type: "stage",
        title: line.replace(/^### Stage \d+[:\s—–-]+/i, "").trim(),
        content: []
      }
      continue
    }

    // Detect verdict section
    if (/^## (The )?Verdict|^## (Final )?Decision|^## What the Court Decided/i.test(line)) {
      inStagesBlock = false
      if (currentSection) flushSection(currentSection, stages, main)
      currentSection = { type: "verdict", heading: null, content: [] }
      continue
    }

    // Detect quote section
    if (/^## (Key )?Quote|^## (The )?Judgment Quote/i.test(line)) {
      inStagesBlock = false
      if (currentSection) flushSection(currentSection, stages, main)
      currentSection = { type: "quote", heading: null, content: [], attribution: null }
      continue
    }

    // Detect impact section
    if (/^## What (It|This) Means For You|^## Practical Impact/i.test(line)) {
      inStagesBlock = false
      if (currentSection) flushSection(currentSection, stages, main)
      currentSection = { type: "impact", heading: null, content: [] }
      continue
    }

    // Regular ## heading
    if (line.startsWith("## ")) {
      inStagesBlock = false
      if (currentSection) flushSection(currentSection, stages, main)
      currentSection = {
        type: "section",
        heading: line.replace(/^## /, "").trim(),
        content: []
      }
      continue
    }

    // Skip # title line
    if (line.startsWith("# ")) continue

    // Attribution line for quotes
    if (currentSection?.type === "quote" && line.startsWith("— ")) {
      currentSection.attribution = line.replace(/^— /, "")
      continue
    }

    // Add content to current section
    const trimmed = line.trim()
    if (trimmed && currentSection) {
      currentSection.content.push(trimmed)
    } else if (trimmed && !currentSection) {
      currentSection = { type: "section", heading: null, content: [trimmed] }
    }
  }

  if (currentSection) flushSection(currentSection, stages, main)

  return { stages, main }
}

function flushSection(section, stages, main) {
  if (!section.content || section.content.length === 0) return
  if (section.type === "stage") {
    stages.push(section)
  } else {
    main.push(section)
  }
}

// ── Article page ──────────────────────────────────────────────────────────────
export default function ArticlePage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const res = await getArticle(articleId)
        setArticle(res.data)
      } catch (err) {
        setError(err.message || "Unable to load article.")
      } finally {
        setLoading(false)
      }
    }
    loadArticle()
  }, [articleId])

  return (
    <AppLayout currentFeature="library">
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          type="button"
          onClick={() => navigate("/library")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </button>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-brass" />
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : article.type === "landmark-case" ? (
          <LandmarkCaseView article={article} />
        ) : (
          // Regular article layout
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-medium capitalize text-secondary-foreground">
                  {article.category?.replace(/-/g, " ")}
                </span>
                {article.type === "comparison" && (
                  <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    India vs World
                  </span>
                )}
                {article.readingTime && (
                  <span className="text-[10px] text-muted-foreground">{article.readingTime} read</span>
                )}
                {article.difficulty && (
                  <span className="text-[10px] text-muted-foreground">· {article.difficulty}</span>
                )}
              </div>
              <h1 className="mt-4 font-display text-3xl leading-tight">{article.title}</h1>
              {article.subtitle && (
                <p className="mt-1 text-base text-muted-foreground">{article.subtitle}</p>
              )}
              {article.summary && (
                <div className="mt-5 rounded-xl border border-brass/20 bg-brass/5 p-4">
                  <p className="text-sm leading-relaxed text-foreground">{article.summary}</p>
                </div>
              )}
            </div>
            <div className="prose-sm max-w-none">{renderMarkdown(article.content)}</div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
