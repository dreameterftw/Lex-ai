export const getUrgencyColor = (urgency) => {
  const map = {
    Critical: "text-red-600 bg-red-50 border-red-200",
    High: "text-orange-600 bg-orange-50 border-orange-200",
    Medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    Low: "text-green-600 bg-green-50 border-green-200"
  }
  return map[urgency] || map.Low
}

export const getUrgencyDot = (urgency) => {
  const map = {
    Critical: "bg-red-500",
    High: "bg-orange-500",
    Medium: "bg-yellow-500",
    Low: "bg-green-500"
  }
  return map[urgency] || map.Low
}

export const getSeverityColor = (severity) => {
  const map = {
    High: "text-red-600 bg-red-50",
    Medium: "text-yellow-600 bg-yellow-50",
    Low: "text-green-600 bg-green-50"
  }
  return map[severity] || map.Low
}

export const formatDaysRemaining = (days) => {
  if (days === 0) return "Due today"
  if (days === 1) return "1 day remaining"
  if (days < 0) return `${Math.abs(days)} days overdue`
  return `${days} days remaining`
}
