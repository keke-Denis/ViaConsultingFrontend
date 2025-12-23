//contexts/fournisseur/fournisseur-contexts.tsx
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Fournisseur, FournisseurFormData } from "@/lib/fournisseur/fournisseur-types"
import { fournisseurAPI } from "@/lib/fournisseur/fournisseur-api"

interface FournisseurContextType {
  fournisseurs: Fournisseur[]
  currentFournisseur: Fournisseur | null
  isLoading: boolean
  error: string | null
  createFournisseur: (data: FournisseurFormData) => Promise<{ success: boolean; message: string; data?: Fournisseur }>
  getFournisseurs: () => Promise<void>
  getFournisseur: (id: number) => Promise<void>
  updateFournisseur: (id: number, data: Partial<FournisseurFormData>) => Promise<{ success: boolean; message: string }>
  deleteFournisseur: (id: number) => Promise<{ success: boolean; message: string }>
  clearError: () => void
  clearCurrentFournisseur: () => void
}

const FournisseurContext = createContext<FournisseurContextType | undefined>(undefined)

export function FournisseurProvider({ children }: { children: ReactNode }) {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [currentFournisseur, setCurrentFournisseur] = useState<Fournisseur | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFournisseur = async (data: FournisseurFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fournisseurAPI.create(data)
      
      if (response.success && response.data) {
        setFournisseurs(prev => [...prev, response.data!])
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la création du fournisseur"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const getFournisseurs = async () => {
    try {
      setIsLoading(true)
      const response = await fournisseurAPI.getAll()
      
      if (response.success) {
        setFournisseurs(response.data || [])
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement des fournisseurs"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getFournisseur = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await fournisseurAPI.getById(id)
      
      if (response.success) {
        setCurrentFournisseur(response.data || null)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement du fournisseur"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFournisseur = async (id: number, data: Partial<FournisseurFormData>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fournisseurAPI.update(id, data)
      
      if (response.success) {
        setFournisseurs(prev => 
          prev.map(fournisseur => 
            fournisseur.id === id ? { ...fournisseur, ...data } : fournisseur
          )
        )
        
        if (currentFournisseur?.id === id) {
          setCurrentFournisseur(prev => prev ? { ...prev, ...data } : null)
        }
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour du fournisseur"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFournisseur = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fournisseurAPI.delete(id)
      
      if (response.success) {
        setFournisseurs(prev => prev.filter(fournisseur => fournisseur.id !== id))
        
        if (currentFournisseur?.id === id) {
          setCurrentFournisseur(null)
        }
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du fournisseur"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)
  const clearCurrentFournisseur = () => setCurrentFournisseur(null)

  const value: FournisseurContextType = {
    fournisseurs,
    currentFournisseur,
    isLoading,
    error,
    createFournisseur,
    getFournisseurs,
    getFournisseur,
    updateFournisseur,
    deleteFournisseur,
    clearError,
    clearCurrentFournisseur,
  }

  return (
    <FournisseurContext.Provider value={value}>
      {children}
    </FournisseurContext.Provider>
  )
}

export function useFournisseur() {
  const context = useContext(FournisseurContext)
  if (context === undefined) {
    throw new Error("useFournisseur must be used within a FournisseurProvider")
  }
  return context
}
