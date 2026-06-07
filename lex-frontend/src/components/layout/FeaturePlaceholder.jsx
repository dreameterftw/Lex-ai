import { useParams } from "react-router-dom"
import { AppLayout } from "./AppLayout.jsx"

export function FeaturePlaceholder({ currentFeature, title, description }) {
  const { sessionId } = useParams()

  return (
    <AppLayout sessionId={sessionId} currentFeature={currentFeature}>
      <section className="rounded-lg border border-border bg-card p-8">
        <p className="font-display text-sm italic text-brass underline decoration-brass/40 underline-offset-4">
          Coming next.
        </p>
        <h1 className="mt-4 font-display text-3xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </section>
    </AppLayout>
  )
}
