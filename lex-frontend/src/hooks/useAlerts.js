import { useEffect, useState, useCallback } from "react"
import { getAlerts, getUnreadCount, markRead, markAllRead } from "../api/alertsApi.js"

const loadAlerts = async () => {
  const [alertsRes, countRes] = await Promise.all([getAlerts(), getUnreadCount()])
  return {
    alerts: alertsRes,
    unreadCount: countRes.unreadCount
  }
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await loadAlerts()
      setAlerts(data.alerts)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      console.error("Failed to fetch alerts:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        const data = await loadAlerts()
        if (!active) return
        setAlerts(data.alerts)
        setUnreadCount(data.unreadCount)
      } catch (err) {
        console.error("Failed to fetch alerts:", err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    run()

    return () => {
      active = false
    }
  }, [])

  const handleMarkRead = async (alertId) => {
    await markRead(alertId)
    setAlerts((prev) =>
      prev.map((a) =>
        a.alertId === alertId ? { ...a, read: true } : a
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const handleMarkAllRead = async () => {
    await markAllRead()
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
    setUnreadCount(0)
  }

  return {
    alerts,
    unreadCount,
    loading,
    handleMarkRead,
    handleMarkAllRead,
    refresh: fetchAlerts
  }
}
