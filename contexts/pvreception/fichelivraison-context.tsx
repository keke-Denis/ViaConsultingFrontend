//contexts/collecte/fichelivraison-context.tsx
"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { 
  FicheLivraison, 
  CreateFicheLivraisonData
} from "@/lib/pvreception/fichelivraison-types"
import { ficheLivraisonApi, ficheLivraisonUtils } from "@/lib/pvreception/fichelivraison-api"

interface FicheLivraisonContextType {
  ficheLivraisons: FicheLivraison[]
  currentFicheLivraison: FicheLivraison | null
  isLoading: boolean
  error: string | null
  createFicheLivraison: (data: CreateFicheLivraisonData) => Promise<FicheLivraison>
  creerLivraisonPartielle: (pvReceptionId: number, data: CreateFicheLivraisonData) => Promise<FicheLivraison>
  getFicheLivraisons: () => Promise<void>
  getFicheLivraison: (id: number) => Promise<void>
  livrer: (ficheLivraisonId: number) => Promise<FicheLivraison>
  livrerPartielle: (ficheLivraisonId: number, quantite_livree: number) => Promise<FicheLivraison>
  clearError: () => void
  clearCurrentFicheLivraison: () => void
}

const FicheLivraisonContext = createContext<FicheLivraisonContextType | undefined>(undefined)

export function FicheLivraisonProvider({ children }: { children: ReactNode }) {
  const [ficheLivraisons, setFicheLivraisons] = useState<FicheLivraison[]>([])
  const [currentFicheLivraison, setCurrentFicheLivraison] = useState<FicheLivraison | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFicheLivraison = useCallback(async (data: CreateFicheLivraisonData): Promise<FicheLivraison> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const erreurs = ficheLivraisonUtils.validerDonnees(data)
      if (erreurs.length > 0) {
        const errorMessage = erreurs.join(', ')
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      const response = await ficheLivraisonApi.create(data)
      const ficheLivraison: FicheLivraison = response.data
      
      setFicheLivraisons(prev => [ficheLivraison, ...prev])
      return ficheLivraison
    } catch (error: any) {
      let errorMessage = error.message || "Erreur lors de la création de la fiche de livraison"
      
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

  const creerLivraisonPartielle = useCallback(async (pvReceptionId: number, data: CreateFicheLivraisonData): Promise<FicheLivraison> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const erreurs = ficheLivraisonUtils.validerDonnees(data)
      if (erreurs.length > 0) {
        const errorMessage = erreurs.join(', ')
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      const response = await ficheLivraisonApi.create(data)
      const ficheLivraison: FicheLivraison = response.data
      
      setFicheLivraisons(prev => [ficheLivraison, ...prev])
      return ficheLivraison
    } catch (error: any) {
      let errorMessage = error.message || "Erreur lors de la création de la livraison partielle"
      
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

  const getFicheLivraisons = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await ficheLivraisonApi.getAll()
      
      const ficheLivraisonsData = Array.isArray(response.data) ? response.data : []
      setFicheLivraisons(ficheLivraisonsData)
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || "Erreur lors du chargement des fiches de livraison"
      setError(errorMessage)
      setFicheLivraisons([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFicheLivraison = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await ficheLivraisonApi.getById(id)
      
      if (!response.data) {
        throw new Error("Fiche de livraison non trouvée")
      }
      
      setCurrentFicheLivraison(response.data)
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || "Erreur lors du chargement de la fiche de livraison"
      setError(errorMessage)
      setCurrentFicheLivraison(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const livrer = useCallback(async (ficheLivraisonId: number): Promise<FicheLivraison> => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!ficheLivraisonId || ficheLivraisonId <= 0) {
        const errorMessage = 'ID fiche de livraison invalide'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      const response = await ficheLivraisonApi.livrer(ficheLivraisonId)
      
      if (!response.data) {
        throw new Error("Réponse invalide de l'API")
      }
      
      const ficheLivraison: FicheLivraison = response.data
      
      setFicheLivraisons(prev => 
        prev.map(f => f.id === ficheLivraisonId ? ficheLivraison : f)
      )
      
      if (currentFicheLivraison?.id === ficheLivraisonId) {
        setCurrentFicheLivraison(ficheLivraison)
      }
      
      return ficheLivraison
    } catch (error: any) {
      let errorMessage = error.message || "Erreur lors de la confirmation de la livraison"
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          errorMessage = Object.values(validationErrors).flat().join(', ')
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Fiche de livraison non trouvée"
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [currentFicheLivraison])

  const livrerPartielle = useCallback(async (ficheLivraisonId: number, quantite_livree: number): Promise<FicheLivraison> => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!ficheLivraisonId || ficheLivraisonId <= 0) {
        const errorMessage = 'ID fiche de livraison invalide'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      if (!quantite_livree || quantite_livree <= 0) {
        const errorMessage = 'Quantité livrée invalide'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
      
      const response = await ficheLivraisonApi.livrerPartielle(ficheLivraisonId, quantite_livree)
      
      if (!response.data) {
        throw new Error("Réponse invalide de l'API")
      }
      
      const ficheLivraison: FicheLivraison = response.data
      
      setFicheLivraisons(prev => 
        prev.map(f => f.id === ficheLivraisonId ? ficheLivraison : f)
      )
      
      if (currentFicheLivraison?.id === ficheLivraisonId) {
        setCurrentFicheLivraison(ficheLivraison)
      }
      
      return ficheLivraison
    } catch (error: any) {
      let errorMessage = error.message || "Erreur lors de la livraison partielle"
      
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          errorMessage = Object.values(validationErrors).flat().join(', ')
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Fiche de livraison non trouvée"
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [currentFicheLivraison])

  const clearError = useCallback(() => setError(null), [])
  const clearCurrentFicheLivraison = useCallback(() => setCurrentFicheLivraison(null), [])

  const value: FicheLivraisonContextType = {
    ficheLivraisons,
    currentFicheLivraison,
    isLoading,
    error,
    createFicheLivraison,
    creerLivraisonPartielle,
    getFicheLivraisons,
    getFicheLivraison,
    livrer,
    livrerPartielle,
    clearError,
    clearCurrentFicheLivraison,
  }

  return (
    <FicheLivraisonContext.Provider value={value}>
      {children}
    </FicheLivraisonContext.Provider>
  )
}

export function useFicheLivraison() {
  const context = useContext(FicheLivraisonContext)
  if (context === undefined) {
    throw new Error("useFicheLivraison must be used within a FicheLivraisonProvider")
  }
  return context
}
