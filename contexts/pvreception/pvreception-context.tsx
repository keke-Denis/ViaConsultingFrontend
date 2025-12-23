// contexts/pvreception/pvreception-context.ts
"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { PVReception, PVReceptionFormData, PVReceptionResponse, CalculPoidsNet } from "@/lib/pvreception/pvreception-types"
import { pvReceptionAPI, pvReceptionUtils } from "@/lib/pvreception/pvreception-api"

interface PVReceptionContextType {
  // State
  pvReceptions: PVReception[]
  currentPVReception: PVReception | null
  isLoading: boolean
  error: string | null
  
  // Actions CRUD
  createPVReception: (data: PVReceptionFormData) => Promise<PVReceptionResponse>
  getPVReceptions: () => Promise<void>
  getPVReception: (id: number) => Promise<void>
  updatePVReception: (id: number, data: Partial<PVReceptionFormData>) => Promise<PVReceptionResponse>
  deletePVReception: (id: number) => Promise<{ success: boolean; message: string }>
  
  // Actions utilitaires
  getPVReceptionsByType: (type: string) => Promise<void>
  getPVReceptionsByStatut: (statut: string) => Promise<void>
  
  // Utilitaires
  calculerPoidsNet: (data: CalculPoidsNet) => number
  calculerPrixTotal: (poidsNet: number, prixUnitaire: number) => number
  validerDonnees: (data: PVReceptionFormData) => string[]
  
  // Gestion d'état
  clearError: () => void
  clearCurrentPVReception: () => void
  setCurrentPVReception: (pv: PVReception | null) => void
}

const PVReceptionContext = createContext<PVReceptionContextType | undefined>(undefined)

export function PVReceptionProvider({ children }: { children: ReactNode }) {
  const [pvReceptions, setPVReceptions] = useState<PVReception[]>([])
  const [currentPVReception, setCurrentPVReception] = useState<PVReception | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Créer un PV de réception
  const createPVReception = useCallback(async (data: PVReceptionFormData): Promise<PVReceptionResponse> => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Validation des données
      const erreurs = pvReceptionUtils.validerDonnees(data)
      if (erreurs.length > 0) {
        return {
          success: false,
          message: 'Erreurs de validation',
          data: undefined
        }
      }
      
      const response = await pvReceptionAPI.create(data)
      
      if (response.success && response.data) {
        setPVReceptions(prev => [response.data!, ...prev])
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la création du PV de réception"
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        data: undefined
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Récupérer tous les PV de réception
  const getPVReceptions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      const response = await pvReceptionAPI.getAll()
      
      if (response.success) {
        setPVReceptions(response.data || [])
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement des PV de réception"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Récupérer un PV de réception par ID
  const getPVReception = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true)
      const response = await pvReceptionAPI.getById(id)
      
      if (response.success) {
        setCurrentPVReception(response.data || null)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement du PV de réception"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mettre à jour un PV de réception
  const updatePVReception = useCallback(async (id: number, data: Partial<PVReceptionFormData>): Promise<PVReceptionResponse> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await pvReceptionAPI.update(id, data)
      
      if (response.success && response.data) {
        setPVReceptions(prev => 
          prev.map(pv => 
            pv.id === id ? response.data! : pv
          )
        )
        
        if (currentPVReception?.id === id) {
          setCurrentPVReception(response.data)
        }
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour du PV de réception"
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        data: undefined
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentPVReception])

  // Supprimer un PV de réception
  const deletePVReception = useCallback(async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await pvReceptionAPI.delete(id)
      
      if (response.success) {
        setPVReceptions(prev => prev.filter(pv => pv.id !== id))
        
        if (currentPVReception?.id === id) {
          setCurrentPVReception(null)
        }
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du PV de réception"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [currentPVReception])

  // Récupérer les PV par type
  const getPVReceptionsByType = useCallback(async (type: string): Promise<void> => {
    try {
      setIsLoading(true)
      const response = await pvReceptionAPI.getByType(type)
      
      if (response.success) {
        setPVReceptions(response.data || [])
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du filtrage par type"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Récupérer les PV par statut
  const getPVReceptionsByStatut = useCallback(async (statut: string): Promise<void> => {
    try {
      setIsLoading(true)
      const response = await pvReceptionAPI.getByStatut(statut)
      
      if (response.success) {
        setPVReceptions(response.data || [])
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du filtrage par statut"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Utilitaires
  const calculerPoidsNet = useCallback((data: CalculPoidsNet): number => {
    return pvReceptionUtils.calculerPoidsNet(data)
  }, [])

  const calculerPrixTotal = useCallback((poidsNet: number, prixUnitaire: number): number => {
    return pvReceptionUtils.calculerPrixTotal({ poidsNet, prixUnitaire })
  }, [])

  const validerDonnees = useCallback((data: PVReceptionFormData): string[] => {
    return pvReceptionUtils.validerDonnees(data)
  }, [])

  // Gestion d'état
  const clearError = useCallback(() => setError(null), [])
  const clearCurrentPVReception = useCallback(() => setCurrentPVReception(null), [])
  const setCurrentPVReceptionCallback = useCallback((pv: PVReception | null) => setCurrentPVReception(pv), [])

  const value: PVReceptionContextType = {
    // State
    pvReceptions,
    currentPVReception,
    isLoading,
    error,
    
    // Actions CRUD
    createPVReception,
    getPVReceptions,
    getPVReception,
    updatePVReception,
    deletePVReception,
    
    // Actions de filtrage
    getPVReceptionsByType,
    getPVReceptionsByStatut,
    
    // Utilitaires
    calculerPoidsNet,
    calculerPrixTotal,
    validerDonnees,
    
    // Gestion d'état
    clearError,
    clearCurrentPVReception,
    setCurrentPVReception: setCurrentPVReceptionCallback,
  }

  return (
    <PVReceptionContext.Provider value={value}>
      {children}
    </PVReceptionContext.Provider>
  )
}

export function usePVReception() {
  const context = useContext(PVReceptionContext)
  if (context === undefined) {
    throw new Error("usePVReception must be used within a PVReceptionProvider")
  }
  return context
}
