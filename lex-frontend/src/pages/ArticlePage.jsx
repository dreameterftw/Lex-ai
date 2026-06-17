import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { getArticle } from "../api/libraryApi.js"

function renderMarkdown(content) {
  if (!content) return null

  return content.split("\n\n").map((block, index) => {
    if (block.startsWith("# ")) {
      return (
        <h1 key={index} className="mt-6 text-2xl font-semibold text-foreground">
          {block.replace("# ", "")}
        </h1>
      )
    }

    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-6 text-xl font-semibold text-foreground">
          {block.replace("## ", "")}
        </h2>
      )
    }

    if (block.startsWith("- ") || block.includes("\n- ")) {
      const items = block.split("\n").map((line) => line.replace(/^- /, ""))
      return (
        <ul key={index} className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ul>
      )
    }

    return (
      <p key={index} className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {block}
      </p>
    )
  })
}

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
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/library")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </button>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-brass" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-border bg-destructive/10 p-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-8 space-y-6">
            <div>
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-medium capitalize text-secondary-foreground">
                  {article.category?.replace(/-/g, " ")}
                </span>
                {article.type === "landmark-case" && (
                  <span className="rounded-full border border-brass/20 bg-brass/10 px-2.5 py-0.5 text-[10px] font-medium text-brass">
                    Landmark Case
                  </span>
                )}
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
                {article.year && (
                  <span className="text-[10px] text-muted-foreground">· {article.year}</span>
                )}
                {article.court && (
                  <span className="text-[10px] text-muted-foreground">· {article.court}</span>
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

            <div className="space-y-4">{renderMarkdown(article.content)}</div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
