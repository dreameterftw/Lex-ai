import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
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
  X,
  CheckCircle2
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

// ─── Manifesto Modal ─────────────────────────────────────────────
function ManifestoModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-background p-8 md:p-12 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          The LEX Manifesto.
        </p>
        <h2 className="mt-4 font-display text-3xl leading-tight">
          The law was written for everyone.
          <br />
          <span className="text-brass">It just never felt that way.</span>
        </h2>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            Every day, ordinary people sign documents they don't understand, miss deadlines they didn't know existed, and abandon rights they never knew they had. Not because they don't care — because the system was never designed to be readable by the people it governs.
          </p>
          <p>
            Lawyers are essential. But a lawyer shouldn't be the only way to understand your lease, know your workplace rights, or respond to a notice. The gap between legal literacy and legal cost is where most injustice quietly lives.
          </p>
          <p>
            LEX exists to close that gap. Not to replace lawyers — but to ensure that when you do walk into a lawyer's office, you already know what happened, what matters, and what to ask.
          </p>

          <div className="border-t border-border pt-6">
            <p className="font-display text-base text-foreground mb-4">
              Four things we will never compromise on:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Cite or stay silent",
                  body: "Every claim LEX makes links to a real law, statute, or regulation. We do not invent legal authority."
                },
                {
                  title: "Jurisdiction always",
                  body: "The law is local. A tenant in Maharashtra and a tenant in California have different rights. LEX knows the difference."
                },
                {
                  title: "Context first",
                  body: "Nothing in LEX is answered in isolation. Every response knows your situation, your document, your deadline."
                },
                {
                  title: "Honest limits",
                  body: "When something requires a real lawyer, we say so directly. LEX is a tool for clarity — not a substitute for counsel."
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-sm">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="border-t border-border pt-6 font-display text-base italic text-foreground">
            "The law protects everyone equally — but only if you know it exists. LEX makes sure you do."
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Section Divider ──────────────────────────────────────────────
function SectionDivider() {
  return (
    <div className="mx-5 md:mx-10">
      <div className="mx-auto max-w-6xl border-t border-border" />
    </div>
  )
}

// ─── Contact Section ──────────────────────────────────────────────
function ContactSection() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null) // "success" | "error" | null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)

    try {
      const workerUrl = import.meta.env.VITE_WORKER_URL
      if (!workerUrl) {
        throw new Error("VITE_WORKER_URL is not configured.")
      }

      const response = await fetch(`${workerUrl.replace(/\/$/, "")}/api/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: email,
          subject: `We received your message, ${name}`,
          html: `
            <h3>Thank you for reaching out, ${name}!</h3>
            <p>We received your message and will get back to you soon.</p>
            <hr />
            <p><strong>Your message:</strong></p>
            <p>${message.replace(/\n/g, "<br />")}</p>
          `
        }),
      })

      if (response.ok) {
        setStatus("success")
        setName("")
        setEmail("")
        setMessage("")
        setTimeout(() => setStatus(null), 5000)
      } else {
        const errorData = await response.json()
        console.error("Contact form error:", errorData)
        setStatus("error")
        setTimeout(() => setStatus(null), 5000)
      }
    } catch (error) {
      console.error("Failed to send contact form:", error)
      setStatus("error")
      setTimeout(() => setStatus(null), 5000)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">Contact.</p>
            <h2 className="mt-6 font-display text-3xl leading-tight md:text-4xl">Have a question?<br />We'll answer it.</h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
              Send us your query — about a feature, your situation, or how LEX can help. We reply within one business day.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="md:col-span-7 md:border-l md:border-border md:pl-12">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your name</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 100))}
                  disabled={sending}
                  className="mt-2 w-full border-b border-border bg-transparent py-2 text-base text-foreground outline-none transition-colors focus:border-brass disabled:opacity-50"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                  disabled={sending}
                  className="mt-2 w-full border-b border-border bg-transparent py-2 text-base text-foreground outline-none transition-colors focus:border-brass disabled:opacity-50"
                />
              </label>
            </div>
            <label className="mt-6 block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your query</span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                disabled={sending}
                className="mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-base text-foreground outline-none transition-colors focus:border-brass disabled:opacity-50"
              />
            </label>
            <div className="mt-8 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">{message.length}/1000</p>
              <button 
                type="submit" 
                disabled={sending}
                className="group inline-flex items-center gap-3 rounded-md bg-ink px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send via Email"}
                <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            {status === "success" && (
              <p className="mt-3 text-xs text-green-600">Message sent successfully! We'll get back to you soon.</p>
            )}
            {status === "error" && (
              <p className="mt-3 text-xs text-destructive">Failed to send message. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

// ─── Animation Variants ───────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

// ─── Main Landing Page ────────────────────────────────────────────
export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [showManifesto, setShowManifesto] = useState(false)

  const FEATURES = [
    {
      title: "Situation Finder",
      description: "Describe your problem in plain English. LEX classifies severity, identifies the legal category, and maps your jurisdiction's relevant statutes.",
      icon: FileSearch,
      specialists: ["Civil disputes", "Employment", "Housing & tenancy"]
    },
    {
      title: "Document X-Ray",
      description: "Reads any legal document and flags every unfair, dangerous, or one-sided clause — with the precedent that makes it suspect.",
      icon: ShieldCheck
    },
    {
      title: "Rights Navigator",
      description: "Identifies precisely which rights apply to your situation, in your jurisdiction, with citations to source law.",
      icon: Scale
    },
    {
      title: "Deadline Tracker",
      description: "Counts down every statutory and contractual deadline in real time — colour-coded by urgency, never missed.",
      icon: Clock
    },
    {
      title: "Lex Counsel",
      description: "Contextual AI wired into every feature. Answers grounded in your specific situation, never generic.",
      icon: MessageSquare
    },
    {
      title: "Signal",
      description: "Generates a formal rights-assertion letter citing the exact laws being violated — ready to send.",
      icon: Send
    },
    {
      title: "Case Timeline",
      description: "Auto-builds a chronological log of events, documents, and decisions — court-ready for lawyers or self-representation.",
      icon: GitBranch
    },
  ]

  const PRINCIPLES = [
    { title: "Context First", body: "Every feature writes to a shared case context. Nothing is answered in isolation." },
    { title: "Cite or Stay Silent", body: "Every claim links to statute, regulation, or precedent. No invented law." },
    { title: "Jurisdiction Always", body: "Your location shapes every answer. The law is local — LEX respects that." },
    { title: "Validated Output", body: "Every AI response is structured, schema-checked, and reviewed before display." },
  ]

  const SUPPORTING = [
    { title: "Court Prep Brief", description: "Plain-English preparation guide for small claims, tribunal, or self-representation.", icon: Gavel },
    { title: "Legal Health Check", description: "Periodic proactive audit of your legal exposure across contracts, employment, and tenancy.", icon: HeartPulse },
    { title: "Outcome Tracker", description: "Closes the loop on resolved situations. Builds outcome intelligence to sharpen future advice.", icon: Target },
    { title: "Plain Law Alerts", description: "Notifies you the moment a law changes in your jurisdiction that affects your contracts or rights.", icon: Bell },
    { title: "Legal Library", description: "Plain-English knowledge base organised by life situation — rent, work, family, money, identity.", icon: BookOpen },
  ]

  const INDIA_PROBLEMS = [
    { title: "The law is hard to read", body: "Most people first meet the legal system through dense notices, contracts, FIR language, or tenancy papers. The problem is not intelligence. The problem is translation." },
    { title: "Help is unevenly available", body: "A person in a metro city may find a specialist faster than someone in a smaller town. Even then, early legal clarity can be expensive, slow, or intimidating." },
    { title: "Deadlines are easy to miss", body: "Consumer complaints, rent disputes, employment issues, and appeals all run on time. Missing one date can weaken a strong case." },
    { title: "Rights are scattered", body: "The answer can depend on central law, state rules, local forums, and contract terms. People often do not know which right to assert, where, or how." }
  ]

  const INDIA_SOLUTIONS = [
    { title: "Plain-English first", body: "LEX turns legal language into practical next steps: what happened, what may be risky, what rights may apply, and what to do next." },
    { title: "Jurisdiction-aware guidance", body: "Every answer starts with location and situation, so users are not handed generic advice that ignores state-level or forum-level differences." },
    { title: "Document and deadline intelligence", body: "LEX reads agreements, notices, and uploaded PDFs, then flags one-sided clauses, missing facts, urgent dates, and evidence gaps." },
    { title: "Action-ready outputs", body: "From rights summaries to formal letters and case timelines, LEX helps users move from confusion to a clear record they can discuss with a lawyer." }
  ]

  const selectedFeature = FEATURES[activeFeature]
  const SelectedFeatureIcon = selectedFeature.icon

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ── */}
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
              <li><a href="#contact" className="hover:text-brass-soft transition-colors">Contact</a></li>
            </ul>
            <Link to="/dashboard" className="group inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/5 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-white/15 md:px-4 md:text-sm">
              Open LEX
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </nav>

          <motion.div className="relative z-10 grid grid-cols-1 gap-10 px-5 pb-10 pt-12 text-white md:grid-cols-12 md:gap-6 md:px-10 md:pb-16 md:pt-16 lg:pb-24 lg:pt-24" {...fadeIn}>
            <motion.div className="md:col-span-6" variants={fadeInUp} initial="initial" animate="animate">
              <div className="max-w-2xl space-y-8">
                <motion.div variants={fadeInUp}>
                  <h1 className="font-display text-[2.75rem] leading-[1.02] tracking-tight md:text-6xl lg:text-[5.5rem]">
                    Know Your Rights.<br /><span className="text-brass-soft">Before</span> You Need Them.
                  </h1>
                  <p className="mt-6 text-sm leading-relaxed text-white/80 md:text-base">
                    A legal intelligence platform that reads the fine print, tracks every deadline, and tells you exactly which rights apply.
                  </p>
                </motion.div>

                <motion.div className="grid gap-4 sm:grid-cols-2" variants={staggerContainer} initial="initial" animate="animate">
                  <motion.div className="rounded-3xl border border-white/15 bg-black/40 p-5" variants={scaleIn}>
                    <p className="font-display text-4xl leading-none">12k+</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/70">Documents reviewed</p>
                  </motion.div>
                  <motion.div className="rounded-3xl border border-white/15 bg-black/40 p-5" variants={scaleIn}>
                    <p className="font-display text-4xl leading-none">98%</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/70">Clauses caught</p>
                  </motion.div>
                </motion.div>

                <motion.div className="flex flex-col gap-4 sm:flex-row sm:items-center" variants={fadeInUp}>
                  <Link to="/dashboard" className="inline-flex items-center justify-center gap-3 rounded-md bg-white px-5 py-3.5 text-sm font-medium text-ink shadow-lg transition-all hover:bg-brass-soft">
                    Analyse a Document <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-xs text-white/70">Built for everyone — no lawyer required.</p>
                </motion.div>
              </div>
            </motion.div>
            <div className="md:col-span-6" />
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <motion.section id="how" className="px-5 py-12 md:px-10 md:py-16" initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-12">

          <motion.div className="md:col-span-6" variants={slideInLeft} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }}>
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">About LEX.</p>
            <motion.p className="mt-6 font-display text-2xl leading-snug md:text-[1.75rem]" variants={fadeInUp}>
              Legal systems weren't built for ordinary people. LEX reads the documents, tracks the deadlines, and translates the law — so you can act with the same clarity a lawyer would.
            </motion.p>
            <motion.p className="mt-6 text-base leading-relaxed text-muted-foreground" variants={fadeInUp}>
              Active across multiple jurisdictions with real-time updates. Every feature surfaces what matters first: your rights, your deadlines, and your next practical step.
            </motion.p>
            <div className="mt-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <button
                onClick={() => setShowManifesto(true)}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium shadow-sm hover:bg-muted transition-colors"
              >
                Read the Manifesto
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Features preview card */}
          <motion.div className="md:col-span-6" variants={slideInRight} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }}>
            <motion.div className="rounded-3xl border border-border bg-card p-8" whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
              <p className="text-xs uppercase tracking-[0.2em] text-brass">7 Core Features</p>
              <p className="mt-1 text-base text-muted-foreground">
                Every feature shares context — nothing answered in isolation.
              </p>

              <motion.div className="mt-6 space-y-1" variants={staggerContainer} initial="initial" animate="animate">
                {FEATURES.map((feature, index) => (
                  <motion.button
                    key={feature.title}
                    type="button"
                    onClick={() => {
                      setActiveFeature(index)
                      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="group w-full flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-muted/60"
                    variants={staggerItem}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-brass/10 transition-colors">
                        <feature.icon className="h-3.5 w-3.5 text-brass" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm text-foreground">{feature.title}</p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </motion.button>
                ))}
              </motion.div>

              <div className="mt-5 border-t border-border pt-5">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 text-xs font-medium text-brass hover:text-foreground transition-colors"
                >
                  Explore all features
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <SectionDivider />

      {/* ── INDIAN REALITY ── */}
      <motion.section id="india" className="px-5 py-12 md:px-10 md:py-16" initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <motion.div className="md:col-span-4 md:sticky md:top-24 md:self-start" variants={slideInLeft} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }}>
              <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">The Indian Reality.</p>
              <motion.h2 className="mt-6 font-display text-3xl leading-tight md:text-4xl" variants={fadeInUp}>Legal protection exists. Access does not feel equal.</motion.h2>
              <motion.p className="mt-6 text-base leading-relaxed text-muted-foreground" variants={fadeInUp}>
                In India, everyday legal problems often begin long before a court case: a confusing rental clause, a salary dispute, a consumer notice, a deadline hidden inside a form. LEX is built for that first moment of uncertainty.
              </motion.p>
            </motion.div>

            <motion.div className="md:col-span-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }}>
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
                {INDIA_PROBLEMS.map((problem, index) => (
                  <motion.div key={problem.title} className="bg-background p-6 md:p-8" variants={staggerItem} whileHover={{ y: -2 }}>
                    <p className="font-display text-sm text-brass">{String(index + 1).padStart(2, "0")}.</p>
                    <h3 className="mt-5 font-display text-xl">{problem.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">{problem.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      {/* ── HOW LEX HELPS ── */}
      <motion.section className="px-5 py-12 md:px-10 md:py-16" initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">

            {/* Sticky left */}
            <div className="md:col-span-5 md:sticky md:top-24 md:self-start">
              <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">How LEX Helps.</p>
              <h2 className="mt-6 font-display text-3xl leading-tight md:text-4xl">From legal confusion to a usable plan.</h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                LEX does not replace a lawyer. It helps people understand their situation earlier, prepare better questions, collect stronger records, and avoid preventable mistakes.
              </p>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  { number: "12+", label: "Feature modules" },
                  { number: "50+", label: "Jurisdictions supported" },
                  { number: "< 2m", label: "To your first insight" },
                  { number: "₹0", label: "Cost to get started" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-border bg-card px-5 py-4">
                    <p className="font-display text-3xl">{stat.number}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* What LEX is not */}
              <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">What LEX is not</p>
                <ul className="mt-4 space-y-2.5">
                  {[
                    "Not a law firm or legal representation",
                    "Not a replacement for professional advice",
                    "Not generic — every answer knows your situation",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-3 rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground"
                >
                  Start with your jurisdiction
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Right — numbered solutions */}
            <div className="md:col-span-7">
              <div className="space-y-0">
                {INDIA_SOLUTIONS.map((solution, index) => (
                  <div key={solution.title} className="grid grid-cols-12 gap-4 border-t border-border py-8 md:gap-8">
                    <div className="col-span-3 md:col-span-2">
                      <p className="font-display text-2xl text-muted-foreground">{String(index + 1).padStart(2, "0")}.</p>
                    </div>
                    <div className="col-span-9 md:col-span-10">
                      <h3 className="font-display text-xl md:text-2xl">{solution.title}</h3>
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{solution.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      {/* ── FEATURES ── */}
      <motion.section id="features" className="px-5 py-12 md:px-10 md:py-16" initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <motion.div className="mb-14" variants={slideInLeft} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }}>
            <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">Our Capabilities.</p>
            <motion.h2 className="mt-6 font-display text-3xl leading-tight md:text-4xl max-w-2xl" variants={fadeInUp}>
              Comprehensive Legal Intelligence,
              <br className="hidden md:block" />
              Tailored to Your Situation
            </motion.h2>
          </motion.div>

          {/* Two panel layout */}
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

            {/* Left — feature list */}
            <div className="space-y-1 rounded-3xl border border-border bg-card p-3">
              {FEATURES.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => setActiveFeature(index)}
                  className={`group w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all ${
                    activeFeature === index ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      activeFeature === index ? "bg-brass/15" : "bg-background group-hover:bg-brass/5"
                    }`}
                  >
                    <feature.icon className="h-4 w-4 text-brass" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
                    <p className="text-sm font-medium text-foreground truncate">{feature.title}</p>
                  </div>
                  {activeFeature === index && (
                    <span className="h-1.5 w-1.5 rounded-full bg-brass shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Right — feature detail */}
            <div className="rounded-3xl border border-border bg-card p-8 md:p-10">

              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-brass">
                    Capability {String(activeFeature + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-3xl">{selectedFeature.title}</h3>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
                  <SelectedFeatureIcon className="h-5 w-5 text-brass" strokeWidth={1.5} />
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <p className="text-base leading-relaxed text-muted-foreground max-w-lg">{selectedFeature.description}</p>

              {selectedFeature.specialists && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedFeature.specialists.map((s) => (
                    <span key={s} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* 3-step flow */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { step: "01", label: "Describe", body: "Tell LEX what's happening in plain English" },
                  { step: "02", label: "Analyse", body: "LEX maps your situation to applicable law" },
                  { step: "03", label: "Act", body: "Get specific next steps grounded in statute" },
                ].map((item) => (
                  <div key={item.step} className="rounded-xl bg-muted/60 px-4 py-4">
                    <p className="text-[10px] font-mono text-muted-foreground">{item.step}</p>
                    <p className="mt-1.5 text-sm font-medium">{item.label}</p>
                      <p className="mt-1 text-base text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2.5 rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground"
                >
                  Try {selectedFeature.title}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="my-20 border-t border-border" />

          {/* Supporting suite */}
          <div className="mt-20">
            <div className="mb-10">
              <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">Supporting Suite.</p>
              <h3 className="mt-5 font-display text-2xl leading-tight md:text-4xl max-w-xl">
                Built around the moments you didn't see coming
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {SUPPORTING.map((s, i) => (
                <div
                  key={s.title}
                  className={`group rounded-3xl border border-border bg-card p-6 transition-colors hover:bg-secondary md:p-8 ${
                    i === 0 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted group-hover:bg-brass/10 transition-colors">
                      <s.icon className="h-5 w-5 text-brass" strokeWidth={1.5} />
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{String(i + 8).padStart(2, "0")}.</p>
                  </div>
                  <h4 className="mt-6 font-display text-lg">{s.title}</h4>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
      <SectionDivider />

      {/* ── PRINCIPLES ── */}
      <motion.section id="principles" className="px-5 py-12 md:px-10 md:py-16" initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">Our Principles.</p>
              <h2 className="mt-6 font-display text-3xl leading-tight md:text-4xl">The Discipline That Sets Us Apart</h2>
            </div>

            <motion.div className="md:col-span-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }}>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
                {PRINCIPLES.map((p, i) => (
                  <motion.div key={p.title} className={i % 2 === 1 ? "md:border-l md:border-border md:pl-12" : ""} variants={staggerItem} whileHover={{ x: 4 }}>
                    <p className="font-display text-lg text-brass">{p.title}</p>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">{p.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      {/* ── CTA BANNER ── */}
      <motion.section className="px-5 py-12 md:px-10 md:py-16" initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-ink px-8 py-16 text-white md:px-16 md:py-24">
          <motion.div className="flex flex-col items-center text-center gap-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }}>
            <motion.p className="text-xs uppercase tracking-[0.2em] text-brass-soft" variants={fadeInUp}>Begin with LEX</motion.p>
            <motion.h2 className="font-display text-3xl leading-tight md:text-4xl" variants={fadeInUp}>
              Your situation,<br />read clearly.
            </motion.h2>
            <motion.p className="max-w-2xl text-sm leading-relaxed text-white/70" variants={fadeInUp}>
              Upload a contract, describe a dispute, or ask a question. LEX builds a working understanding of your case in minutes.
            </motion.p>
            <div className="flex flex-col items-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-3 rounded-md bg-white px-6 py-3.5 text-sm font-medium text-ink transition-all hover:bg-brass-soft"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-white/50">No credit card. No lawyer fees.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <SectionDivider />

      <ContactSection />

      {/* ── FOOTER ── */}
      <div className="mx-5 md:mx-10">
        <div className="mx-auto max-w-6xl border-t border-border" />
      </div>
      <footer className="px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 text-base text-muted-foreground md:flex-row md:items-center">
          <LexMark className="text-foreground" />
          <p>
            © {new Date().getFullYear()} LEX. Legal intelligence, demystified.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── MANIFESTO MODAL ── */}
      {showManifesto && (
        <ManifestoModal onClose={() => setShowManifesto(false)} />
      )}

    </div>
  )
}
