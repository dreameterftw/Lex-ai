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
              <p className="text-sm text-muted-foreground">{article.category?.replace(/-/g, " ")}</p>
              <h1 className="mt-3 text-3xl font-display">{article.title}</h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
            </div>

            <div className="space-y-4">{renderMarkdown(article.content)}</div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
