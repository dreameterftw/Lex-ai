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

        // Load Wikipedia results for a popular legal topic on page load
        try {
          const wikiRes = await searchWikipedia("Indian tenant rights law")
          setWikiResults(wikiRes.data || [])
        } catch (err) {
          // Wikipedia results are optional, don't block loading
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

      if (internal.status === "fulfilled") {
        setSearchResults(internal.value.data || [])
      } else {
        setSearchError(internal.reason?.message || "Search failed.")
      }

      if (wiki.status === "fulfilled") {
        setWikiResults(wiki.value.data || [])
      } else {
        setExternalError(wiki.reason?.message || "Wikipedia search failed.")
      }
    } finally {
      setSearchLoading(false)
    }
  }

  const topIssues = REGION_TOP_ISSUES[selectedRegion] || []

  return (
    <AppLayout currentFeature="library">
      <div className="mb-10">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Learn the laws that matter in your region.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Legal Library</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Discover plain-English law guidance for your state or city, with the issues most common where you live.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.9fr_1.1fr]">
        <main className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            {error && (
              <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-brass" />
                  <div>
                    <p className="text-sm font-medium">Browse by state or city</p>
                    <p className="mt-1 text-sm text-muted-foreground">Select the region that matches where you live to see the most relevant law topics.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {REGION_OPTIONS.map((region) => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => setSelectedRegion(region.id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                        region.id === selectedRegion
                          ? "border-ink bg-ink/5 text-ink"
                          : "border-border bg-background text-foreground hover:border-foreground"
                      }`}
                    >
                      <p className="text-sm font-semibold">{region.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background p-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-brass" />
                  <div>
                    <p className="text-sm font-medium">Top issues in {REGION_OPTIONS.find((r) => r.id === selectedRegion)?.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">These are the legal topics people in this region most often need.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {topIssues.map((issue) => (
                    <div key={issue.title} className="rounded-3xl border border-border bg-card p-4">
                      <p className="text-sm font-semibold">{issue.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Search law guides</p>
                <p className="mt-2 text-sm text-muted-foreground">Search by issue, law, or common complaint.</p>
              </div>
              <form onSubmit={handleSearch} className="flex w-full gap-3 sm:w-auto">
                <label htmlFor="library-search" className="sr-only">Search library</label>
                <input
                  id="library-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for laws, rights, or rules"
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-ink focus:ring-2 focus:ring-brass/20"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white hover:bg-foreground"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </form>
            </div>
            {searchError && <p className="mt-4 text-sm text-destructive">{searchError}</p>}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Law categories</p>
                <p className="mt-2 text-sm text-muted-foreground">Browse the library by topic and find the articles that explain them in plain language.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {sortedCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group rounded-3xl border p-5 text-left transition-all ${
                    selectedCategory === category.id
                      ? "border-ink bg-ink/5"
                      : "border-border bg-card hover:border-foreground"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{category.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Law articles & resources</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchResults !== null ? "Search results from your library and Wikipedia" : `Showing articles for ${categories.find((item) => item.id === selectedCategory)?.title || "the selected category"}`}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
                {(() => {
                  if (searchResults !== null) {
                    return searchResults.length + wikiResults.length;
                  }
                  return articles.length + wikiResults.length;
                })()} items
              </span>
            </div>

            {loadingCategories || searchLoading || loadingArticles ? (
              <div className="mt-8 rounded-3xl border border-border bg-background p-8 text-center">
                <FileText className="mx-auto h-6 w-6 text-brass" />
                <p className="mt-4 text-sm text-muted-foreground">Loading articles…</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {(() => {
                  const internalArticles = searchResults !== null ? searchResults : articles;
                  const combined = [
                    ...internalArticles.map((article) => ({
                      ...article,
                      source: "library"
                    })),
                    ...wikiResults.map((wiki) => ({
                      articleId: wiki.pageId,
                      title: wiki.title,
                      summary: wiki.snippet,
                      source: "wikipedia",
                      url: wiki.url
                    }))
                  ];

                  return combined.length > 0 ? (
                    combined.map((article) => (
                      <button
                        key={`${article.source}-${article.articleId}`}
                        type="button"
                        onClick={() => {
                          if (article.source === "wikipedia") {
                            window.open(article.url, "_blank");
                          } else {
                            navigate(`/library/${article.articleId}`);
                          }
                        }}
                        className="w-full rounded-3xl border border-border bg-background p-5 text-left transition hover:border-foreground"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold">{article.title}</p>
                              {article.source === "wikipedia" && (
                                <span className="inline-block rounded-full bg-brass/10 px-2 py-0.5 text-xs font-medium text-brass">
                                  Wikipedia
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{article.summary}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-border bg-background p-8 text-center">
                      <p className="text-sm text-muted-foreground">No articles found yet. Try another search, or choose a different category.</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Why it matters</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The right law can change how you act, whether you fight a notice, file a complaint, or resolve a dispute without undue stress.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">How to use this library</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>1. Choose the region that reflects where the issue happened.</p>
              <p>2. Review the most common issues for that area.</p>
              <p>3. Read a plain-English guide to know what law applies and what to do next.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppLayout>
  )
}
