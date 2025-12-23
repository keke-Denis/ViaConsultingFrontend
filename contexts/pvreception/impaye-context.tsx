//contexts/pvreception/impaye-context.tsx
"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { 
  Impaye, 
  CreateImpayeData, 
  PaiementImpayeData
} from "@/lib/pvreception/impaye-types"
import { impayeApi, impayeUtils } from "@/lib/pvreception/impaye-api"

interface ImpayeContextType {
  impayes: Impaye[]
  currentImpaye: Impaye | null
  isLoading: boolean
  error: string | null
  createImpaye: (data: CreateImpayeData) => Promise<Impaye>
  getImpayes: () => Promise<void>
  getImpaye: (id: number) => Promise<void>
  enregistrerPaiement: (impayeId: number, data: PaiementImpayeData) => Promise<Impaye>
  clearError: () => void
  clearCurrentImpaye: () => void
}

const ImpayeContext = createContext<ImpayeContextType | undefined>(undefined)

export function ImpayeProvider({ children }: { children: ReactNode }) {
  const [impayes, setImpayes] = useState<Impaye[]>([])
  const [currentImpaye, setCurrentImpaye] = useState<Impaye | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createImpaye = useCallback(async (data: CreateImpayeData): Promise<Impaye> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const erreurs = impayeUtils.validerDonnees(data)
      if (erreurs.length > 0) {
        const errorMessage = erreurs.join(', ')
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      const response = await impayeApi.create(data)
      const impaye: Impaye = response.data
      
      setImpayes(prev => [impaye, ...prev])
      return impaye
    } catch (error: any) {
      let errorMessage = error.message || "Erreur lors de la création de l'impayé"
      
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

  const getImpayes = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await impayeApi.getAll()
      
      const impayesData = Array.isArray(response.data) ? response.data : []
      setImpayes(impayesData)
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || "Erreur lors du chargement des impayés"
      setError(errorMessage)
      setImpayes([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getImpaye = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await impayeApi.getById(id)
      
      if (!response.data) {
        throw new Error("Impayé non trouvé")
      }
      
      setCurrentImpaye(response.data)
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || "Erreur lors du chargement de l'impayé"
      setError(errorMessage)
      setCurrentImpaye(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const enregistrerPaiement = useCallback(async (impayeId: number, data: PaiementImpayeData): Promise<Impaye> => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!impayeId || impayeId <= 0) {
        const errorMessage = 'ID impayé invalide'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      const response = await impayeApi.enregistrerPaiement(impayeId, data)
      
      if (!response.data) {
        throw new Error("Réponse invalide de l'API")
      }
      
      const impaye: Impaye = response.data
      
      setImpayes(prev => 
        prev.map(i => i.id === impayeId ? impaye : i)
      )
      
      if (currentImpaye?.id === impayeId) {
        setCurrentImpaye(impaye)
      }
      
      return impaye
    } catch (error: any) {
      let errorMessage = error.message || "Erreur lors de l'enregistrement du paiement"
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          errorMessage = Object.values(validationErrors).flat().join(', ')
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Impayé non trouvé"
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [currentImpaye])

  const clearError = useCallback(() => setError(null), [])
  const clearCurrentImpaye = useCallback(() => setCurrentImpaye(null), [])

  const value: ImpayeContextType = {
    impayes,
    currentImpaye,
    isLoading,
    error,
    createImpaye,
    getImpayes,
    getImpaye,
    enregistrerPaiement,
    clearError,
    clearCurrentImpaye,
  }

  return (
    <ImpayeContext.Provider value={value}>
      {children}
    </ImpayeContext.Provider>
  )
}

export function useImpaye() {
  const context = useContext(ImpayeContext)
  if (context === undefined) {
    throw new Error("useImpaye must be used within a ImpayeProvider")
  }
  return context
}
