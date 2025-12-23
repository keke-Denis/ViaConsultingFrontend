"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { stockAPI } from "@/lib/stock/stock-api"
import { isAuthenticated } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

type PoidsNetData = {
  FG: number | null
  CG: number | null
  GG: number | null
}

type PoidsNetContextValue = {
  poidsNet: PoidsNetData
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const defaultValue: PoidsNetContextValue = {
  poidsNet: { FG: null, CG: null, GG: null },
  isLoading: false,
  error: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refresh: async () => {},
}

const PoidsNetContext = createContext<PoidsNetContextValue>(defaultValue)

export const PoidsNetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [poidsNet, setPoidsNet] = useState<PoidsNetData>({ FG: null, CG: null, GG: null })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await stockAPI.getPoidsNet()
      setPoidsNet({
        FG: data?.FG ?? null,
        CG: data?.CG ?? null,
        GG: data?.GG ?? null,
      })
    } catch (err: any) {
      console.error('PoidsNetContext load error:', err)
      setError('Erreur lors du chargement des poids nets')
    } finally {
      setIsLoading(false)
    }
  }

  const { user } = useAuth()

  useEffect(() => {
    // Charger les poids si l'utilisateur est déjà authentifié (refresh de page)
    // ou dès que l'utilisateur se connecte (user devient non-null)
    if (isAuthenticated() || user) {
      load()
    }
  }, [user])

  return (
    <PoidsNetContext.Provider value={{ poidsNet, isLoading, error, refresh: load }}>
      {children}
    </PoidsNetContext.Provider>
  )
}

export const usePoidsNet = () => useContext(PoidsNetContext)

export default PoidsNetContext
