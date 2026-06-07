export const formatDate = (dateString) => {
  if (!dateString) return "Unknown date"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return "Unknown"
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export const formatOutcome = (outcome) => {
  const map = {
    resolved_in_my_favour: "Resolved in my favour",
    resolved_against_me: "Resolved against me",
    ongoing: "Ongoing",
    escalated_to_court: "Escalated to court",
    abandoned: "Abandoned"
  }
  return map[outcome] || outcome
}

export const truncate = (text, maxLength = 100) => {
  if (!text) return ""
  return text.length > maxLength
    ? text.slice(0, maxLength) + "..."
    : text
}
