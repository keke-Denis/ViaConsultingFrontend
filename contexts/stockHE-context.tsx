"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { stockHEAPI } from "@/lib/stockHE/stockHE-api"
import { isAuthenticated } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export type StockHEData = {
  HE_FEUILLES: number | null
}

type StockHEContextValue = {
  stock: StockHEData
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  decreaseBy: (amount: number) => void
  setStockValue: (value: number | null) => void
}

const defaultValue: StockHEContextValue = {
  stock: { HE_FEUILLES: null },
  isLoading: false,
  error: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refresh: async () => {},
  decreaseBy: () => {},
  setStockValue: () => {},
}

const StockHEContext = createContext<StockHEContextValue>(defaultValue)

export const StockHEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stock, setStock] = useState<StockHEData>({ HE_FEUILLES: null })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await stockHEAPI.getPoidsNet()
      setStock({ HE_FEUILLES: data?.HE_FEUILLES ?? null })
    } catch (err: any) {
      console.error('StockHEContext load error:', err)
      setError(err?.message || 'Erreur lors du chargement du stock HE')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const decreaseBy = (amount: number) => {
    setStock(prev => {
      const current = prev?.HE_FEUILLES ?? 0
      const next = Math.max(0, current - amount)
      return { HE_FEUILLES: next }
    })
  }

  const setStockValue = (value: number | null) => {
    setStock({ HE_FEUILLES: value })
  }

  const { user } = useAuth()

  useEffect(() => {
    if (isAuthenticated() || user) {
      load()
    }
  }, [user])

  return (
    <StockHEContext.Provider value={{ stock, isLoading, error, refresh: load, decreaseBy, setStockValue }}>
      {children}
    </StockHEContext.Provider>
  )
}

export const useStockHE = () => useContext(StockHEContext)

export default StockHEContext
