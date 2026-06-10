export const workerFetch = async (path, options = {}) => {
  const workerUrl = import.meta.env.VITE_WORKER_URL
  if (!workerUrl) {
    throw new Error("VITE_WORKER_URL is not configured.")
  }

  const response = await fetch(`${workerUrl.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || "Request failed.")
  }

  return data
}

export default { workerFetch }
