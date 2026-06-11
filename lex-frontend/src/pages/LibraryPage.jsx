import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BookOpen, FileText, MapPin, Search } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import {
  getArticlesByCategory,
  getCategories,
  searchArticles,
  searchWikipedia
} from "../api/libraryApi.js"

const REGION_OPTIONS = [
  { id: "maharashtra-mumbai", label: "Maharashtra — Mumbai" },
  { id: "maharashtra-pune", label: "Maharashtra — Pune" },
  { id: "delhi", label: "Delhi" },
  { id: "karnataka-bangalore", label: "Karnataka — Bangalore" },
  { id: "tamil-nadu-chennai", label: "Tamil Nadu — Chennai" }
]

const REGION_TOP_ISSUES = {
  "maharashtra-mumbai": [
    { title: "Traffic & accident claims", description: "City roads, fines, insurance, and common accident recovery steps." },
    { title: "Landlord & tenancy disputes", description: "Rent fixes, eviction notices, and tenant protections in busy residential areas." },
    { title: "Consumer service rights", description: "Ride hailing, delivery, and local service refunds for common consumer issues." }
  ],
  "maharashtra-pune": [
    { title: "Rent, deposit & landlord rights", description: "Lease negotiations, deposits, repairs, and eviction notices." },
    { title: "Workplace & contract basics", description: "Employment terms, notice periods, and salary dispute rights." },
    { title: "Utility bill disputes", description: "Electricity, water, and municipal service complaints that affect rentals." }
  ],
  delhi: [
    { title: "Police encounters & rights", description: "Know your rights during stops, searches, and FIR filing." },
    { title: "Document verification & permits", description: "Aadhaar, voter ID, licences, and common paperwork rules." },
    { title: "Traffic fines & accident steps", description: "What to do after a crash, challan payment, and insurance claims." }
  ],
  "karnataka-bangalore": [
    { title: "Rip-off services & consumer protection", description: "Online orders, telecom billing, and local business disputes." },
    { title: "Housing society rules", description: "Society governance, maintenance charges, and tenant rights." },
    { title: "Traffic safety & insurance", description: "Accident reporting, vehicle insurance, and challan disputes." }
  ],
  "tamil-nadu-chennai": [
    { title: "Landlord & lodge disputes", description: "Rental agreements, repairs, and deposit recovery in city housing." },
    { title: "Workplace rights", description: "Wage, leave, and termination protections for workers." },
    { title: "Consumer complaints", description: "Quality issues, refunds, and service provider accountability." }
  ]
}

const REGION_CATEGORY_ORDER = {
  "maharashtra-mumbai": ["traffic-road-safety", "renting-housing", "debt-consumer", "police-rights"],
  "maharashtra-pune": ["renting-housing", "work-employment", "debt-consumer"],
  delhi: ["police-rights", "traffic-road-safety", "debt-consumer"],
  "karnataka-bangalore": ["police-rights", "renting-housing", "traffic-road-safety"],
  "tamil-nadu-chennai": ["renting-housing", "work-employment", "debt-consumer"]
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(REGION_OPTIONS[0].id)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [articles, setArticles] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [wikiResults, setWikiResults] = useState([])
  const [externalError, setExternalError] = useState(null)
  const [error, setError] = useState(null)
  const [searchError, setSearchError] = useState(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCategories()
        const fetched = res.data || []
        setCategories(fetched)
        setSelectedCategory(fetched[0]?.id || "")
        try {
          const wikiRes = await searchWikipedia("Indian tenant rights law")
          setWikiResults(wikiRes.data || [])
        } catch (err) {
          console.warn("Wikipedia load failed:", err.message)
        }
      } catch (err) {
        setError(err.message || "Unable to load library categories.")
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (!selectedCategory) return
    const loadArticles = async () => {
      setLoadingArticles(true)
      setError(null)
      try {
        const res = await getArticlesByCategory(selectedCategory)
        setArticles(res.data || [])
      } catch (err) {
        setError(err.message || "Unable to load articles for this category.")
      } finally {
        setLoadingArticles(false)
      }
    }
    loadArticles()
  }, [selectedCategory])

  const sortedCategories = useMemo(() => {
    const order = REGION_CATEGORY_ORDER[selectedRegion] || []
    return [...categories].sort((a, b) => {
      const aIndex = order.indexOf(a.id)
      const bIndex = order.indexOf(b.id)
      if (aIndex === -1 && bIndex === -1) return a.title.localeCompare(b.title)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [categories, selectedRegion])

  const handleSearch = async (event) => {
    event.preventDefault()
    setSearchError(null)
    setExternalError(null)
    setSearchResults(null)
    setWikiResults([])

    if (searchQuery.trim().length < 2) {
      setSearchError("Type at least 2 characters to search.")
      return
    }

    setSearchLoading(true)
    try {
      const [internal, wiki] = await Promise.allSettled([
        searchArticles(searchQuery.trim()),
        searchWikipedia(searchQuery.trim())
      ])
      if (internal.status === "fulfilled") setSearchResults(internal.value.data || [])
      else setSearchError(internal.reason?.message || "Search failed.")
      if (wiki.status === "fulfilled") setWikiResults(wiki.value.data || [])
      else setExternalError(wiki.reason?.message || "Wikipedia search failed.")
    } finally {
      setSearchLoading(false)
    }
  }

  const topIssues = REGION_TOP_ISSUES[selectedRegion] || []
  const activeRegionLabel = REGION_OPTIONS.find((r) => r.id === selectedRegion)?.label
  const activeCategoryTitle = categories.find((item) => item.id === selectedCategory)?.title
  const internalCount = searchResults !== null ? searchResults.length : articles.length
  const totalCount = internalCount + wikiResults.length
  const isLoading = loadingArticles || searchLoading

  return (
    <AppLayout currentFeature="library">
      {/* Page header */}
      <header className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Learn the laws that matter in your region.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Legal Library</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Discover plain-English law guidance for your state or city, with the issues most common where you live.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <main className="space-y-6">
          {/* Region + top issues */}
          <section className="rounded-2xl border border-border bg-card p-6">
            {error && (
              <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Region picker */}
              <div className="flex flex-col">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Browse by state or city</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select the region that matches where you live.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {REGION_OPTIONS.map((region) => {
                    const active = region.id === selectedRegion
                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => setSelectedRegion(region.id)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                          active
                            ? "border-ink bg-ink/5 text-ink"
                            : "border-border bg-background text-foreground hover:border-foreground"
                        }`}
                      >
                        {region.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Top issues */}
              <div className="flex flex-col rounded-2xl border border-border bg-background p-5">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Top issues in {activeRegionLabel}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Topics people in this region most often need.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid flex-1 gap-3">
                  {topIssues.map((issue) => (
                    <div key={issue.title} className="rounded-xl border border-border bg-card p-4">
                      <p className="text-sm font-semibold">{issue.title}</p>
                      <p className="mt-1.5 text-sm text-muted-foreground">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Search */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Search law guides</p>
                <p className="mt-1 text-sm text-muted-foreground">Search by issue, law, or common complaint.</p>
              </div>
              <form onSubmit={handleSearch} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <label htmlFor="library-search" className="sr-only">Search library</label>
                <input
                  id="library-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for laws, rights, or rules"
                  className="w-full min-w-0 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-brass/20 sm:w-72"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </form>
            </div>
            {searchError && <p className="mt-3 text-sm text-destructive">{searchError}</p>}
            {externalError && <p className="mt-3 text-sm text-muted-foreground">{externalError}</p>}
          </section>

          {/* Categories */}
          <section className="rounded-2xl border border-border bg-background p-6">
            <div>
              <p className="text-sm font-semibold">Law categories</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse the library by topic and find articles that explain them in plain language.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {sortedCategories.map((category) => {
                const active = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      active ? "border-ink bg-ink/5" : "border-border bg-card hover:border-foreground"
                    }`}
                  >
                    <p className="text-sm font-semibold">{category.title}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{category.description}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Articles */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Law articles & resources</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchResults !== null
                    ? "Search results from your library and Wikipedia"
                    : `Showing articles for ${activeCategoryTitle || "the selected category"}`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
                {totalCount} items
              </span>
            </div>

            {isLoading ? (
              <div className="mt-6 rounded-xl border border-border bg-background p-8 text-center">
                <FileText className="mx-auto h-6 w-6 text-brass" />
                <p className="mt-3 text-sm text-muted-foreground">Loading articles…</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {(() => {
                  const internalArticles = searchResults !== null ? searchResults : articles
                  const combined = [
                    ...internalArticles.map((a) => ({ ...a, source: "library" })),
                    ...wikiResults.map((w) => ({
                      articleId: w.pageId,
                      title: w.title,
                      summary: w.snippet,
                      source: "wikipedia",
                      url: w.url
                    }))
                  ]

                  if (combined.length === 0) {
                    return (
                      <div className="rounded-xl border border-border bg-background p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No articles found yet. Try another search, or choose a different category.
                        </p>
                      </div>
                    )
                  }

                  return combined.map((article) => (
                    <button
                      key={`${article.source}-${article.articleId}`}
                      type="button"
                      onClick={() => {
                        if (article.source === "wikipedia") window.open(article.url, "_blank")
                        else navigate(`/library/${article.articleId}`)
                      }}
                      className="w-full rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-foreground"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{article.title}</p>
                            {article.source === "wikipedia" && (
                              <span className="rounded-full bg-brass/10 px-2 py-0.5 text-[11px] font-medium text-brass">
                                Wikipedia
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-sm text-muted-foreground">{article.summary}</p>
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  ))
                })()}
              </div>
            )}
          </section>
        </main>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Why it matters
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The right law can change how you act — whether you fight a notice, file a complaint, or resolve a dispute without undue stress.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              How to use this library
            </p>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. Choose the region that reflects where the issue happened.</li>
              <li>2. Review the most common issues for that area.</li>
              <li>3. Read a plain-English guide to know what law applies and what to do next.</li>
            </ol>
          </div>
        </aside>
      </div>
    </AppLayout>
  )
}
