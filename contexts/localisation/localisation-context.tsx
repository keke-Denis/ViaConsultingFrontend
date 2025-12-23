// contexts/localisation/localisation-context.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { localisationAPI, Localisation } from '@/lib/fournisseur/localisation-api'

interface LocalisationContextType {
  localisations: Localisation[]
  isLoading: boolean
  error: string | null
  createLocalisation: (nom: string) => Promise<Localisation>
  refreshLocalisations: () => Promise<void>
  clearError: () => void
}

const LocalisationContext = createContext<LocalisationContextType | undefined>(undefined)

interface LocalisationProviderProps {
  children: ReactNode
}

export function LocalisationProvider({ children }: LocalisationProviderProps) {
  const [localisations, setLocalisations] = useState<Localisation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLocalisations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await localisationAPI.getAll()
      setLocalisations(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des localisations')
      console.error('Erreur chargement localisations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createLocalisation = async (nom: string): Promise<Localisation> => {
    try {
      setError(null)
      const newLocalisation = await localisationAPI.create(nom)
      
      // Ajouter la nouvelle localisation à la liste
      setLocalisations(prev => [...prev, newLocalisation])
      
      return newLocalisation
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la création de la localisation'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const refreshLocalisations = async () => {
    await loadLocalisations()
  }

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    loadLocalisations()
  }, [])

  const value: LocalisationContextType = {
    localisations,
    isLoading,
    error,
    createLocalisation,
    refreshLocalisations,
    clearError
  }

  return (
    <LocalisationContext.Provider value={value}>
      {children}
    </LocalisationContext.Provider>
  )
}

export function useLocalisation() {
  const context = useContext(LocalisationContext)
  if (context === undefined) {
    throw new Error('useLocalisation must be used within a LocalisationProvider')
  }
  return context
}
