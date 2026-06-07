import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { recordOutcome } from "../api/outcomeApi.js"

export default function OutcomeModal({ sessionId, onClose, onResolved }) {
  const [outcome, setOutcome] = useState("")
  const [decidingFactor, setDecidingFactor] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const OPTIONS = [
    { value: "resolved_in_my_favour", label: "Resolved in my favour" },
    { value: "resolved_against_me", label: "Resolved against me" },
    { value: "ongoing", label: "Still ongoing" },
    { value: "escalated_to_court", label: "Escalated to court" },
    { value: "abandoned", label: "Abandoned" },
  ]

  const handleSubmit = async () => {
    if (!outcome) return

    setLoading(true)
    setError(null)

    try {
      await recordOutcome(sessionId, outcome, decidingFactor)
      onResolved()
    } catch (err) {
      setError(err.message || "Failed to record outcome.")
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Modal */}
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">How did this resolve?</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Recording outcomes helps improve LEX for everyone.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Outcome options */}
        <div className="mb-6 space-y-2">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setOutcome(opt.value)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                outcome === opt.value
                  ? "border-brass bg-brass/5 font-medium text-brass"
                  : "border-border bg-card hover:border-brass/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Deciding factor */}
        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
            What made the difference? (optional)
          </label>
          <textarea
            value={decidingFactor}
            onChange={e => setDecidingFactor(e.target.value)}
            placeholder="e.g. Sending the Signal letter resolved it"
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brass resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!outcome || loading}
            className="flex-1 rounded-xl bg-ink py-3 text-sm font-medium text-white hover:bg-foreground disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span>Saving…</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Record outcome"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
