"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { ficheService } from "@/lib/TestHuille/fiche-reception.service"

interface TestFicheContextType {
  fiches: any[]
  isLoading: boolean
  error: string | null
  getFiches: () => Promise<void>
  createFiche: (data: any) => Promise<any>
  updateFiche: (id: number, data: any) => Promise<any>
  deleteFiche: (id: number) => Promise<void>
}

const TestFicheContext = createContext<TestFicheContextType | undefined>(undefined)

export function TestFicheProvider({ children }: { children: React.ReactNode }) {
  const [fiches, setFiches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getFiches = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await ficheService.getAll()
      setFiches(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || "Erreur chargement fiches")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createFiche = useCallback(async (payload: any) => {
    try {
      setIsLoading(true)
      const created = await ficheService.create(payload)
      setFiches(prev => [created, ...prev])
      return created
    } catch (err: any) {
      setError(err?.message || "Erreur création fiche")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateFiche = useCallback(async (id: number, payload: any) => {
    try {
      setIsLoading(true)
      const updated = await ficheService.update(id, payload)
      setFiches(prev => prev.map(f => f.id === id ? updated : f))
      return updated
    } catch (err: any) {
      setError(err?.message || "Erreur mise à jour fiche")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteFiche = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      await ficheService.delete(id)
      setFiches(prev => prev.filter(f => f.id !== id))
    } catch (err: any) {
      setError(err?.message || "Erreur suppression fiche")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: TestFicheContextType = {
    fiches,
    isLoading,
    error,
    getFiches,
    createFiche,
    updateFiche,
    deleteFiche,
  }

  return (
    <TestFicheContext.Provider value={value}>
      {children}
    </TestFicheContext.Provider>
  )
}

export function useTestFiche() {
  const ctx = useContext(TestFicheContext)
  if (!ctx) throw new Error("useTestFiche must be used within TestFicheProvider")
  return ctx
}
