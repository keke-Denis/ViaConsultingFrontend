"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fetchDistillationStats } from '@/lib/distillation/stats'

type DistillationStats = any

type ContextShape = {
  stats: DistillationStats | null
  loading: boolean
  refreshStats: () => Promise<void>
}

const DistillationStatsContext = createContext<ContextShape | undefined>(undefined)

export const DistillationStatsProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<DistillationStats | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshStats = async () => {
    setLoading(true)
    try {
      const data = await fetchDistillationStats()
      setStats(data)
    } catch (err) {
      console.error('refreshStats error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // initial load only when an access token exists (avoid 401 redirect loops on public/login pages)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (token) refreshStats()
    } catch (err) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DistillationStatsContext.Provider value={{ stats, loading, refreshStats }}>
      {children}
    </DistillationStatsContext.Provider>
  )
}

export const useDistillationStats = () => {
  const ctx = useContext(DistillationStatsContext)
  if (!ctx) throw new Error('useDistillationStats must be used within DistillationStatsProvider')
  return ctx
}

export default DistillationStatsProvider
