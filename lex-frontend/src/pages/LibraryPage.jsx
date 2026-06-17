import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BookOpen, ChevronDown, FileText, Gavel, Globe, Search, X } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout.jsx"
import { getArticlesByCategory, getCategories, searchArticles } from "../api/libraryApi.js"

// ── Quick-access shortcut chips ───────────────────────────────────────────────
const SHORTCUTS = [
  { label: "FIR & Police Rights", query: "FIR" },
  { label: "Tenant Rights", query: "tenant" },
  { label: "Salary & Wages", query: "salary" },
  { label: "Consumer Court", query: "consumer" },
  { label: "Arrest Rights", query: "arrest" },
  { label: "Fundamental Rights", query: "fundamental rights" },
  { label: "Lok Adalat", query: "lok adalat" },
]

// ── State / city filter options ────────────────────────────────────────────────
const LOCATION_OPTIONS = [
  { id: "", label: "All India" },
  { id: "maharashtra-mumbai", label: "Maharashtra — Mumbai" },
  { id: "maharashtra-pune",   label: "Maharashtra — Pune" },
  { id: "delhi",              label: "Delhi" },
  { id: "karnataka-bangalore", label: "Karnataka — Bangalore" },
  { id: "tamil-nadu-chennai", label: "Tamil Nadu — Chennai" },
]

// ── Type filter options ────────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { id: "",               label: "All types" },
  { id: "article",        label: "Articles" },
  { id: "landmark-case",  label: "Landmark Cases" },
  { id: "comparison",     label: "India vs World" },
]

// ── Category → location relevance map ─────────────────────────────────────────
// When a location is selected, we surface these categories first
const LOCATION_CATEGORY_PRIORITY = {
  "maharashtra-mumbai":    ["traffic-road-safety", "renting-housing", "debt-consumer", "police-rights"],
  "maharashtra-pune":      ["renting-housing", "work-employment", "debt-consumer"],
  "delhi":                 ["police-rights", "traffic-road-safety", "debt-consumer", "legal-system"],
  "karnataka-bangalore":   ["debt-consumer", "renting-housing", "traffic-road-safety"],
  "tamil-nadu-chennai":    ["renting-housing", "work-employment", "debt-consumer"],
}

// ── "Know Your Laws" static content ──────────────────────────────────────────
const KNOW_YOUR_LAWS = {
  national: [
    {
      title: "You cannot be arrested without reason",
      body: "Article 22 of the Constitution requires police to tell you why you are being arrested and produce you before a Magistrate within 24 hours.",
      tag: "Criminal Law",
    },
    {
      title: "FIR registration is mandatory",
      body: "Under Section 173 BNSS (formerly S.154 CrPC), police must register an FIR for any cognizable offence. Refusal is itself an offence.",
      tag: "Police Rights",
    },
    {
      title: "Consumer courts are free",
      body: "You can file complaints against products and services in District Consumer Commissions without a lawyer. No fee for claims up to ₹50 lakh.",
      tag: "Consumer Law",
    },
    {
      title: "Wages must be paid by the 7th or 10th",
      body: "The Code on Wages 2019 requires wages to be paid by the 7th of the following month (smaller companies) or 10th (larger). Delay is a criminal offence.",
      tag: "Labour Law",
    },
    {
      title: "Your employer must have an ICC",
      body: "Every employer with 10+ employees must have an Internal Complaints Committee under the POSH Act 2013 to address sexual harassment complaints.",
      tag: "Workplace Rights",
    },
    {
      title: "Privacy is a fundamental right",
      body: "The Supreme Court in Puttaswamy (2017) declared privacy a fundamental right under Article 21. Any government action violating it can be challenged in High Court.",
      tag: "Digital Rights",
    },
    {
      title: "Free legal aid is a constitutional right",
      body: "Article 39A entitles you to free legal representation if you cannot afford one. Contact your District Legal Services Authority or call NALSA helpline: 15100.",
      tag: "Legal Aid",
    },
    {
      title: "Lok Adalat awards cannot be appealed",
      body: "A settlement reached at Lok Adalat has the force of a court decree and is final. No court fee, no appeal — and cases are resolved in a single sitting.",
      tag: "Dispute Resolution",
    },
  ],
  "maharashtra-mumbai": [
    {
      title: "Mumbai Rent Control Act protects tenants",
      body: "The Maharashtra Rent Control Act 1999 caps rent increases and requires a court order for eviction. Deposits cannot exceed 3 months rent.",
      tag: "Maharashtra Tenancy",
    },
    {
      title: "Motor Accident Claims Tribunal (MACT)",
      body: "Road accident compensation claims in Mumbai go to the MACT — not regular civil court. You can file within 6 months of the accident without a lawyer.",
      tag: "Mumbai Traffic",
    },
    {
      title: "Shops & Establishments Act Maharashtra",
      body: "All commercial establishments in Maharashtra must register under the Shops & Establishments Act. Employees are entitled to at least 8 paid leaves a year.",
      tag: "Maharashtra Labour",
    },
  ],
  "maharashtra-pune": [
    {
      title: "Maharashtra Rent Control Act 1999",
      body: "Covers all residential and commercial premises in Pune. Standard lease registration is compulsory for agreements above 11 months.",
      tag: "Pune Tenancy",
    },
    {
      title: "RERA Maharashtra for flat buyers",
      body: "MahaRERA requires builders to register all residential projects. Buyers can file complaints online at maharerait.mahaonline.gov.in for delays or defects.",
      tag: "Maharashtra Real Estate",
    },
  ],
  "delhi": [
    {
      title: "Delhi Rent Control Act 1958",
      body: "Applies to older properties and caps standard rent. Newer properties built after 1997 are largely outside its scope and follow the Transfer of Property Act.",
      tag: "Delhi Tenancy",
    },
    {
      title: "Delhi Police must register FIR within 24 hours",
      body: "A Standing Order of Delhi Police requires FIR registration within 24 hours of a complaint, backed by the Lalita Kumari Supreme Court ruling.",
      tag: "Delhi Police",
    },
    {
      title: "Delhi Shops & Establishments Act",
      body: "Commercial establishments in Delhi must follow the Delhi Shops and Establishments Act 1954. Employees get weekly off, notice periods, and overtime pay.",
      tag: "Delhi Labour",
    },
  ],
  "karnataka-bangalore": [
    {
      title: "Karnataka Rent Control Act 2001",
      body: "Covers residential premises in Bangalore. Security deposits are limited, and landlords must give 3 months notice before asking tenants to vacate.",
      tag: "Karnataka Tenancy",
    },
    {
      title: "RERA Karnataka — K-RERA",
      body: "All residential projects in Karnataka with more than 8 units must register with K-RERA. Buyers can file complaints at rera.karnataka.gov.in.",
      tag: "Karnataka Real Estate",
    },
  ],
  "tamil-nadu-chennai": [
    {
      title: "Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act 2017",
      body: "This Act covers all residential and commercial rentals in TN. Disputes go to a Rent Court (Rent Controller). Deposits are limited to 5 months rent.",
      tag: "Tamil Nadu Tenancy",
    },
    {
      title: "Tamil Nadu Shops & Establishments Act 1947",
      body: "Governs working hours, leaves, and termination for all shops and commercial establishments in TN. Minimum annual leave is 12 days.",
      tag: "Tamil Nadu Labour",
    },
  ],
}

// ── Type badge ─────────────────────────────────────────────────────────────────
const TYPE_BADGE = {
  "article":       { label: "Article",       style: "bg-secondary text-secondary-foreground border-border" },
  "landmark-case": { label: "Landmark Case", style: "bg-brass/10 text-brass border-brass/20" },
  "comparison":    { label: "India vs World", style: "bg-muted text-muted-foreground border-border" },
}

function ArticleCard({ article, onClick }) {
  const badge = TYPE_BADGE[article.type] || TYPE_BADGE["article"]
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-brass/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.style}`}>
              {badge.label}
            </span>
            {article.readingTime && (
              <span className="text-[10px] text-muted-foreground">{article.readingTime}</span>
            )}
            {article.year && (
              <span className="text-[10px] text-muted-foreground">{article.year}</span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold leading-snug">{article.title}</p>
          {article.subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{article.subtitle}</p>
          )}
          {article.summary && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {article.summary}
            </p>
          )}
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brass" />
      </div>
    </button>
  )
}

function KnowYourLawsPanel({ location }) {
  const national = KNOW_YOUR_LAWS.national
  const stateCards = location ? (KNOW_YOUR_LAWS[location] || []) : []

  return (
    <div className="rounded-xl border border-brass/30 bg-brass/5 p-6">
      <div className="flex items-center gap-2 mb-5">
        <BookOpen className="h-4 w-4 text-brass" />
        <p className="text-sm font-semibold">Know Your Laws</p>
        {stateCards.length > 0 && (
          <span className="ml-auto text-[10px] font-medium text-brass">
            {LOCATION_OPTIONS.find(l => l.id === location)?.label}
          </span>
        )}
      </div>

      {stateCards.length > 0 && (
        <div className="mb-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-brass">
            State-specific rules
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {stateCards.map((card) => (
              <div key={card.title} className="rounded-lg border border-brass/20 bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold leading-snug">{card.title}</p>
                  <span className="shrink-0 rounded-full bg-brass/10 px-2 py-0.5 text-[9px] font-medium text-brass">
                    {card.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        National laws — applicable everywhere
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {national.map((card) => (
          <div key={card.title} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold leading-snug">{card.title}</p>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-secondary-foreground">
                {card.tag}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page component ────────────────────────────────────────────────────────
export default function LibraryPage() {
  const navigate = useNavigate()

  // Search + filter state
  const [searchQuery, setSearchQuery]     = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [typeFilter, setTypeFilter]         = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // Data state
  const [allCategories, setAllCategories]   = useState([])
  const [articles, setArticles]             = useState([])
  const [searchResults, setSearchResults]   = useState(null)
  const [loading, setLoading]               = useState(false)
  const [searchLoading, setSearchLoading]   = useState(false)
  const [error, setError]                   = useState(null)
  const [searchError, setSearchError]       = useState(null)

  // Know Your Laws panel
  const [showKnowLaws, setShowKnowLaws] = useState(false)

  // Load categories once on mount and default to first category with content
  useEffect(() => {
    const res = [
      { id: "renting-housing",    title: "Renting & Housing" },
      { id: "work-employment",    title: "Work & Employment" },
      { id: "police-rights",      title: "Police & Rights" },
      { id: "legal-system",       title: "Legal System" },
      { id: "debt-consumer",      title: "Consumer & Debt" },
      { id: "family-relationships", title: "Family Law" },
    ]
    setAllCategories(res)
    setSelectedCategory(res[0].id)
  }, [])

  // Load articles when category changes
  useEffect(() => {
    if (!selectedCategory || searchResults !== null) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getArticlesByCategory(selectedCategory)
        setArticles(res.data || [])
      } catch (err) {
        setError(err.message || "Unable to load articles.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedCategory, searchResults])

  // Filter articles client-side by type
  const visibleArticles = useMemo(() => {
    const base = searchResults !== null ? searchResults : articles
    if (!typeFilter) return base
    return base.filter((a) => a.type === typeFilter)
  }, [articles, searchResults, typeFilter])

  // Sort: when a location is selected, surface priority categories' articles first
  const sortedArticles = useMemo(() => {
    if (!locationFilter || searchResults !== null) return visibleArticles
    const priority = LOCATION_CATEGORY_PRIORITY[locationFilter] || []
    return [...visibleArticles].sort((a, b) => {
      const ai = priority.indexOf(a.category)
      const bi = priority.indexOf(b.category)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }, [visibleArticles, locationFilter, searchResults])

  const hasFilters = locationFilter || typeFilter

  const handleSearch = async (q) => {
    const query = (q ?? searchQuery).trim()
    if (query.length < 2) {
      setSearchError("Type at least 2 characters.")
      return
    }
    setSearchLoading(true)
    setSearchError(null)
    try {
      const res = await searchArticles(query)
      setSearchResults(res.data || [])
    } catch (err) {
      setSearchError(err.message || "Search failed.")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleShortcut = (query) => {
    setSearchQuery(query)
    handleSearch(query)
    setShowKnowLaws(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults(null)
    setSearchError(null)
  }

  const clearFilters = () => {
    setLocationFilter("")
    setTypeFilter("")
  }

  const activeLocationLabel = LOCATION_OPTIONS.find(l => l.id === locationFilter)?.label
  const activeCategoryLabel = allCategories.find(c => c.id === selectedCategory)?.title

  return (
    <AppLayout currentFeature="library">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <header className="mb-8">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Laws that apply to you, in plain English.
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Legal Library</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Search any legal topic, browse by category, or explore basic laws by state.
        </p>
      </header>

      <div className="space-y-5">
        {/* ── Search bar ──────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch() }}
            className="flex gap-2"
          >
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (!e.target.value) clearSearch() }}
                placeholder="Search by topic, law, or keyword — e.g. FIR, tenants, salary…"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-9 text-sm outline-none transition-colors focus:border-brass focus:ring-2 focus:ring-brass/20"
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="shrink-0 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground disabled:opacity-50"
            >
              {searchLoading ? "Searching…" : "Search"}
            </button>
          </form>

          {searchError && <p className="mt-2 text-xs text-destructive">{searchError}</p>}

          {/* Shortcut chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {SHORTCUTS.map((s) => (
              <button
                key={s.query}
                type="button"
                onClick={() => handleShortcut(s.query)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-brass/40 hover:text-foreground"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Filter bar + Know Your Laws button ──────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Location filter */}
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-border bg-card py-2 pl-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-brass hover:border-foreground"
            >
              {LOCATION_OPTIONS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-border bg-card py-2 pl-3 pr-8 text-sm text-foreground outline-none transition-colors focus:border-brass hover:border-foreground"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}

          {/* Know Your Laws button */}
          <button
            type="button"
            onClick={() => setShowKnowLaws((s) => !s)}
            className={`ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              showKnowLaws
                ? "border-brass bg-brass/10 text-brass"
                : "border-border bg-card text-muted-foreground hover:border-brass/40 hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Know Your Laws
          </button>
        </div>

        {/* ── Know Your Laws panel ─────────────────────────────────────── */}
        {showKnowLaws && <KnowYourLawsPanel location={locationFilter} />}

        {/* ── Category tabs (hidden when searching) ────────────────────── */}
        {searchResults === null && (
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const active = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-ink bg-ink text-background"
                      : "border-border bg-card text-foreground hover:border-foreground"
                  }`}
                >
                  {cat.title}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Article list ─────────────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold">
              {searchResults !== null
                ? `${sortedArticles.length} result${sortedArticles.length !== 1 ? "s" : ""} for "${searchQuery}"`
                : activeCategoryLabel}
            </p>
            {sortedArticles.length > 0 && (
              <span className="text-xs text-muted-foreground">{sortedArticles.length} items</span>
            )}
          </div>

          {loading || searchLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-xl border border-border bg-card p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted/60" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : sortedArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
              <FileText className="mx-auto h-6 w-6 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {searchResults !== null
                  ? "No results found. Try a different keyword."
                  : "No articles in this category yet."}
              </p>
              {searchResults !== null && (
                <button type="button" onClick={clearSearch}
                  className="mt-3 text-xs font-medium text-brass hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedArticles.map((article) => (
                <ArticleCard
                  key={article.articleId}
                  article={article}
                  onClick={() => navigate(`/library/${article.articleId}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
