import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowUpRight,
  ArrowRight,
  FileSearch,
  Scale,
  Clock,
  MessageSquare,
  Send,
  GitBranch,
  ShieldCheck,
  Gavel,
  HeartPulse,
  Target,
  Bell,
  BookOpen,
  Mail,
} from "lucide-react"
import hero from "../assets/hero.png"

function LexMark({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Scale className="h-5 w-5" strokeWidth={1.5} />
      <span className="font-display text-xl tracking-tight">LEX</span>
    </div>
  )
}

function ContactSection() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`LEX enquiry from ${name || "a visitor"}`)
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`)
    window.location.href = `mailto:hello@lex-app.web.app?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="px-5 pb-20 md:px-10 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">Contact.</p>
            <h2 className="mt-6 font-display text-3xl leading-tight md:text-4xl">Have a question? We'll answer it.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">Send us your query — about a feature, your situation, or how LEX can help. We reply within one business day.</p>
            <div className="mt-8 flex items-center gap-3 text-sm text-foreground">
              <Mail className="h-4 w-4 text-brass" strokeWidth={1.5} />
              <a href="mailto:hello@lex-app.web.app" className="hover:text-brass">hello@lex-app.web.app</a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="md:col-span-7 md:border-l md:border-border md:pl-12">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your name</span>
                <input required value={name} onChange={(e) => setName(e.target.value.slice(0, 100))} className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-brass" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Email</span>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 255))} className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-brass" />
              </label>
            </div>
            <label className="mt-6 block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your query</span>
              <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value.slice(0, 1000))} className="mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-brass" />
            </label>
            <div className="mt-8 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">{message.length}/1000</p>
              <button type="submit" className="group inline-flex items-center gap-3 rounded-md bg-ink px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-foreground">
                Send via Email
                <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const FEATURES = [
    { title: "Situation Finder", description: "Describe your problem in plain English. LEX classifies severity, identifies the legal category, and maps your jurisdiction's relevant statutes.", icon: FileSearch, specialists: ["Civil disputes", "Employment", "Housing & tenancy"] },
    { title: "Document X-Ray", description: "Reads any legal document and flags every unfair, dangerous, or one-sided clause — with the precedent that makes it suspect.", icon: ShieldCheck },
    { title: "Rights Navigator", description: "Identifies precisely which rights apply to your situation, in your jurisdiction, with citations to source law.", icon: Scale },
    { title: "Deadline Tracker", description: "Counts down every statutory and contractual deadline in real time — colour-coded by urgency, never missed.", icon: Clock },
    { title: "Lex Counsel", description: "Contextual AI wired into every feature. Answers grounded in your specific situation, never generic.", icon: MessageSquare },
    { title: "Signal", description: "Generates a formal rights-assertion letter citing the exact laws being violated — ready to send.", icon: Send },
    { title: "Case Timeline", description: "Auto-builds a chronological log of events, documents, and decisions — court-ready for lawyers or self-representation.", icon: GitBranch },
  ]

  const PRINCIPLES = [
    { title: "Context First", body: "Every feature writes to a shared case context. Nothing is answered in isolation." },
    { title: "Cite or Stay Silent", body: "Every claim links to statute, regulation, or precedent. No invented law." },
    { title: "Jurisdiction Always", body: "Your location shapes every answer. The law is local — LEX respects that." },
    { title: "Validated Output", body: "Every AI response is structured, schema-checked, and reviewed before display." },
  ]

  const SUPPORTING = [
    { title: "Court Prep Brief", description: "Plain-English preparation guide for small claims, tribunal, or self-representation — questions, evidence, what to wear.", icon: Gavel },
    { title: "Legal Health Check", description: "Periodic proactive audit of your legal exposure across contracts, employment, and tenancy — before a crisis forms.", icon: HeartPulse },
    { title: "Outcome Tracker", description: "Closes the loop on resolved situations. Builds outcome intelligence to sharpen future advice.", icon: Target },
    { title: "Plain Law Alerts", description: "Notifies you the moment a law changes in your jurisdiction that affects your contracts, rights, or filings.", icon: Bell },
    { title: "Legal Library", description: "Plain-English knowledge base organised by life situation — rent, work, family, money, identity.", icon: BookOpen },
  ]

  const INDIA_PROBLEMS = [
    {
      title: "The law is hard to read",
      body: "Most people first meet the legal system through dense notices, contracts, FIR language, tenancy papers, employment letters, or court forms. The problem is not intelligence. The problem is translation."
    },
    {
      title: "Help is unevenly available",
      body: "A person in a metro city may find a specialist faster than someone in a smaller town. Even then, early legal clarity can be expensive, slow, or intimidating."
    },
    {
      title: "Deadlines are easy to miss",
      body: "Consumer complaints, rent disputes, employment issues, appeals, notices, limitation periods, and document replies all run on time. Missing one date can weaken a strong case."
    },
    {
      title: "Rights are scattered",
      body: "The answer can depend on central law, state rules, local forums, contract terms, and the facts of the situation. People often do not know which right to assert, where, or how."
    }
  ]

  const INDIA_SOLUTIONS = [
    { title: "Plain-English first", body: "LEX turns legal language into practical next steps: what happened, what may be risky, what rights may apply, and what to do next." },
    { title: "Jurisdiction-aware guidance", body: "Every answer starts with location and situation, so Indian users are not handed generic advice that ignores state-level or forum-level differences." },
    { title: "Document and deadline intelligence", body: "LEX reads agreements, notices, and uploaded PDFs, then flags one-sided clauses, missing facts, urgent dates, and evidence gaps." },
    { title: "Action-ready outputs", body: "From rights summaries to formal letters and case timelines, LEX helps users move from confusion to a clear record they can discuss with a lawyer or use for self-preparation." }
  ]

  const selectedFeature = FEATURES[activeFeature]
  const SelectedFeatureIcon = selectedFeature.icon

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="px-3 pt-3 md:px-5 md:pt-5">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0">
            <img src={hero} alt="Hero" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/75" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
          </div>

          <nav className="relative z-10 flex items-center justify-between px-5 py-5 text-white md:px-10 md:py-7">
            <LexMark />
            <ul className="hidden items-center gap-8 text-sm md:flex">
              <li><a href="#features" className="hover:text-brass-soft transition-colors">Features</a></li>
              <li><a href="#how" className="hover:text-brass-soft transition-colors">How it Works</a></li>
              <li><a href="#principles" className="hover:text-brass-soft transition-colors">Principles</a></li>
              <li><a href="#library" className="hover:text-brass-soft transition-colors">Library</a></li>
            </ul>
            <Link to="/dashboard" className="group inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/5 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-white/15 md:px-4 md:text-sm">Open LEX <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
          </nav>

          <div className="relative z-10 grid grid-cols-1 gap-10 px-5 pb-10 pt-12 text-white md:grid-cols-12 md:gap-6 md:px-10 md:pb-16 md:pt-16 lg:pb-24 lg:pt-24">
            <div className="md:col-span-6">
              <div className="max-w-2xl space-y-8">
                <div>
                  <h1 className="font-display text-[2.75rem] leading-[1.02] tracking-tight md:text-6xl lg:text-[5.5rem]">Know Your Rights.<br /><span className="text-brass-soft">Before</span> You Need Them.</h1>
                  <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">A legal intelligence platform that reads the fine print, tracks every deadline, and tells you exactly which rights apply.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/15 bg-black/40 p-5">
                    <p className="font-display text-4xl leading-none">12k+</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/70">Documents reviewed</p>
                  </div>
                  <div className="rounded-3xl border border-white/15 bg-black/40 p-5">
                    <p className="font-display text-4xl leading-none">98%</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/70">Clauses caught</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
                  <Link id="cta" to="/dashboard" className="inline-flex items-center justify-center gap-3 rounded-md bg-white px-5 py-3.5 text-sm font-medium text-ink shadow-lg transition-all hover:bg-brass-soft">Analyse a Document <ArrowRight className="h-4 w-4" /></Link>
                  <p className="text-xs text-white/70">Built for everyone — no lawyer required.</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-6" />
          </div>
        </div>
      </section>

      <section id="how" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">About LEX.</p>
            <p className="mt-6 font-display text-2xl leading-snug text-foreground md:text-[1.75rem]">Legal systems weren't built for ordinary people. LEX reads the documents, tracks the deadlines, and translates the law — so you can act with the same clarity a lawyer would.</p>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">Active across multiple jurisdictions with real-time updates. Every feature is designed to surface what matters first: your rights, your deadlines, and your next practical step.</p>
            <div className="mt-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <a href="#" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium shadow-sm hover:bg-muted">Read the Manifesto <ArrowRight className="h-3.5 w-3.5" /></a>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-card p-8 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-brass">7 Core Features</p>
              <h3 className="mt-6 font-display text-3xl leading-tight">Product intelligence for every legal moment.</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/70">From document review and rights navigation to deadline tracking and court prep, LEX keeps the full case context in one place.</p>
              <div className="mt-8 flex h-44 items-center justify-center rounded-3xl bg-muted/80">
                <FileSearch className="h-10 w-10 text-brass" strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="india" className="border-y border-border bg-secondary/45 px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-4 md:sticky md:top-24 md:self-start">
              <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">The Indian Reality.</p>
              <h2 className="mt-6 font-display text-3xl leading-tight md:text-5xl">Legal protection exists. Access does not feel equal.</h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                In India, everyday legal problems often begin long before a court case: a confusing rental clause, a salary dispute, a consumer notice, a police document, a family paper, or a deadline hidden inside a form. LEX is built for that first moment of uncertainty.
              </p>
            </div>

            <div className="md:col-span-8">
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
                {INDIA_PROBLEMS.map((problem, index) => (
                  <div key={problem.title} className="bg-background p-6 md:p-8">
                    <p className="font-display text-sm text-brass">{String(index + 1).padStart(2, "0")}.</p>
                    <h3 className="mt-5 font-display text-xl text-foreground">{problem.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{problem.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">How LEX Helps.</p>
              <h2 className="mt-6 font-display text-3xl leading-tight md:text-5xl">From legal confusion to a usable plan.</h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                LEX does not replace a lawyer. It helps people understand their situation earlier, prepare better questions, collect stronger records, and avoid preventable mistakes.
              </p>
            </div>

            <div className="md:col-span-7">
              <div className="space-y-0">
                {INDIA_SOLUTIONS.map((solution, index) => (
                  <div key={solution.title} className="grid grid-cols-12 gap-4 border-t border-border py-7 md:gap-8 md:py-8">
                    <div className="col-span-12 md:col-span-3">
                      <p className="font-display text-2xl text-muted-foreground">{String(index + 1).padStart(2, "0")}.</p>
                    </div>
                    <div className="col-span-12 md:col-span-9">
                      <h3 className="font-display text-xl text-foreground md:text-2xl">{solution.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{solution.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/signup" className="mt-10 inline-flex items-center gap-3 rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground">
                Start with your jurisdiction
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 md:mb-16">
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">Our Capabilities.</p>
            <div className="mt-6 flex items-start justify-between gap-6">
              <h2 className="font-display text-3xl leading-tight md:text-5xl md:max-w-2xl">Comprehensive Legal Intelligence,<br className="hidden md:block" /> Tailored to Your Situation</h2>
              <ArrowUpRight className="hidden h-7 w-7 shrink-0 text-foreground md:block" strokeWidth={1.5} />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(280px,360px)_1fr]">
            <div className="space-y-3 rounded-3xl border border-border bg-card p-4 md:p-6">
              {FEATURES.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => setActiveFeature(index)}
                  className={`group w-full rounded-3xl border px-4 py-4 text-left transition ${activeFeature === index ? "border-brass bg-ink text-white" : "border-transparent bg-background hover:border-border"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xs uppercase tracking-[0.22em] text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
                      <p className="mt-3 font-display text-lg text-foreground">{feature.title}</p>
                    </div>
                    <feature.icon className="h-5 w-5 text-brass" strokeWidth={1.5} />
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-card p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brass">Capability {String(activeFeature + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 font-display text-3xl text-foreground">{selectedFeature.title}</h3>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <SelectedFeatureIcon className="h-6 w-6 text-brass" strokeWidth={1.5} />
                </div>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{selectedFeature.description}</p>
              {selectedFeature.specialists && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {selectedFeature.specialists.map((specialist) => (
                    <span key={specialist} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{specialist}</span>
                  ))}
                </div>
              )}
              <Link to="/signup" className="mt-10 inline-flex items-center gap-3 rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground">
                Try it now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-24 md:mt-32">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">Supporting Suite.</p>
                <h3 className="mt-5 font-display text-2xl leading-tight md:text-4xl md:max-w-xl">Built around the moments you didn't see coming</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {SUPPORTING.map((s, i) => (
                <div key={s.title} className={`group rounded-3xl border border-border bg-card p-6 transition-colors hover:bg-secondary md:p-8 ${i === 0 ? "lg:col-span-2" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-muted">
                      <s.icon className="h-5 w-5 text-brass" strokeWidth={1.5} />
                    </div>
                    <p className="font-display text-sm text-muted-foreground">{String(i + 8).padStart(2, "0")}. </p>
                  </div>
                  <h4 className="mt-6 font-display text-lg text-foreground">{s.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="principles" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">Our Principles.</p>
              <h2 className="mt-6 font-display text-3xl leading-tight md:text-4xl">The Discipline That Sets Us Apart</h2>
            </div>

            <div className="md:col-span-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
                {PRINCIPLES.map((p, i) => (
                  <div key={p.title} className={i % 2 === 1 ? "md:border-l md:border-border md:pl-12" : ""}>
                    <p className="font-display text-lg text-brass">{p.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-ink px-8 py-16 text-white md:px-16 md:py-24">
          <div className="flex flex-col items-center text-center gap-8">
            <p className="text-xs uppercase tracking-[0.2em] text-brass-soft">Begin with LEX</p>
            <h2 className="font-display text-4xl leading-tight md:text-6xl">Your situation,<br /> read clearly.</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-white/70">Upload a contract, describe a dispute, or ask a question. LEX builds a working understanding of your case in minutes.</p>
            <div className="flex flex-col items-center gap-4">
              <Link to="/signup" className="inline-flex items-center justify-center gap-3 rounded-md bg-white px-6 py-3.5 text-sm font-medium text-ink transition-all hover:bg-brass-soft">Start Free <ArrowRight className="h-4 w-4" /></Link>
              <p className="text-xs text-white/50">No credit card. No lawyer fees.</p>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />

      <footer className="border-t border-border px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 text-sm text-muted-foreground md:flex-row md:items-center">
          <LexMark className="text-foreground" />
          <p>© {new Date().getFullYear()} LEX. Legal intelligence, demystified.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
