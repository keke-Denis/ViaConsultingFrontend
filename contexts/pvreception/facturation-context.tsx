//contexts/pvreception/facturation-context.tsx
"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { 
  Facturation, 
  CreateFacturationData, 
  PaiementData
} from "@/lib/pvreception/facturation-types"
import { facturationApi, facturationUtils } from "@/lib/pvreception/facturation-api"

interface FacturationContextType {
  facturations: Facturation[]
  currentFacturation: Facturation | null
  isLoading: boolean
  error: string | null
  createFacturation: (data: CreateFacturationData) => Promise<Facturation>
  getFacturations: () => Promise<void>
  getFacturation: (id: number) => Promise<void>
  enregistrerPaiement: (facturationId: number, data: PaiementData) => Promise<Facturation>
  clearError: () => void
  clearCurrentFacturation: () => void
}

const FacturationContext = createContext<FacturationContextType | undefined>(undefined)

export function FacturationProvider({ children }: { children: ReactNode }) {
  const [facturations, setFacturations] = useState<Facturation[]>([])
  const [currentFacturation, setCurrentFacturation] = useState<Facturation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFacturation = useCallback(async (data: CreateFacturationData): Promise<Facturation> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const erreurs = facturationUtils.validerDonnees(data)
      if (erreurs.length > 0) {
        const errorMessage = erreurs.join(', ')
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      const response = await facturationApi.create(data)
      const facturation: Facturation = response.data
      
      setFacturations(prev => [facturation, ...prev])
      return facturation
    } catch (error: any) {
      let errorMessage = error.message || "Erreur lors de la création de la facturation"
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          errorMessage = Object.values(validationErrors).flat().join(', ')
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFacturations = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await facturationApi.getAll()
      
      const facturationsData = Array.isArray(response.data) ? response.data : []
      setFacturations(facturationsData)
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || "Erreur lors du chargement des facturations"
      setError(errorMessage)
      setFacturations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFacturation = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await facturationApi.getById(id)
      
      if (!response.data) {
        throw new Error("Facturation non trouvée")
      }
      
      setCurrentFacturation(response.data)
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || "Erreur lors du chargement de la facturation"
      setError(errorMessage)
      setCurrentFacturation(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const enregistrerPaiement = useCallback(async (facturationId: number, data: PaiementData): Promise<Facturation> => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!facturationId || facturationId <= 0) {
        const errorMessage = 'ID facturation invalide'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      const response = await facturationApi.enregistrerPaiement(facturationId, data)
      
      if (!response.data) {
        throw new Error("Réponse invalide de l'API")
      }
      
      const facturation: Facturation = response.data
      
      setFacturations(prev => 
        prev.map(f => f.id === facturationId ? facturation : f)
      )
      
      if (currentFacturation?.id === facturationId) {
        setCurrentFacturation(facturation)
      }
      
      return facturation
    } catch (error: any) {
      let errorMessage = error.message || "Erreur lors de l'enregistrement du paiement"
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          errorMessage = Object.values(validationErrors).flat().join(', ')
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Facturation non trouvée"
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [currentFacturation])

  const clearError = useCallback(() => setError(null), [])
  const clearCurrentFacturation = useCallback(() => setCurrentFacturation(null), [])

  const value: FacturationContextType = {
    facturations,
    currentFacturation,
    isLoading,
    error,
    createFacturation,
    getFacturations,
    getFacturation,
    enregistrerPaiement,
    clearError,
    clearCurrentFacturation,
  }

  return (
    <FacturationContext.Provider value={value}>
      {children}
    </FacturationContext.Provider>
  )
}

export function useFacturation() {
  const context = useContext(FacturationContext)
  if (context === undefined) {
    throw new Error("useFacturation must be used within a FacturationProvider")
  }
  return context
}
