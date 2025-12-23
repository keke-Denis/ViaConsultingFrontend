"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { provenanceAPI, Provenance } from '@/lib/fournisseur/provenance-api'

interface ProvenanceContextType {
  provenances: Provenance[]
  isLoading: boolean
  error: string | null
  createProvenance: (nom: string) => Promise<Provenance>
  refreshProvenances: () => Promise<void>
  clearError: () => void
}

const ProvenanceContext = createContext<ProvenanceContextType | undefined>(undefined)

interface ProvenanceProviderProps {
  children: ReactNode
}

export function ProvenanceProvider({ children }: ProvenanceProviderProps) {
  const [provenances, setProvenances] = useState<Provenance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProvenances = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await provenanceAPI.getAll()
      setProvenances(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des provenances')
      console.error('Erreur chargement provenances:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createProvenance = async (nom: string): Promise<Provenance> => {
    try {
      setError(null)
      const newProvenance = await provenanceAPI.create(nom)
      
      setProvenances(prev => [...prev, newProvenance])
      
      return newProvenance
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la création de la provenance'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const refreshProvenances = async () => {
    await loadProvenances()
  }

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    loadProvenances()
  }, [])

  const value: ProvenanceContextType = {
    provenances,
    isLoading,
    error,
    createProvenance,
    refreshProvenances,
    clearError
  }

  return (
    <ProvenanceContext.Provider value={value}>
      {children}
    </ProvenanceContext.Provider>
  )
}

export function useProvenance() {
  const context = useContext(ProvenanceContext)
  if (context === undefined) {
    throw new Error('useProvenance must be used within a ProvenanceProvider')
  }
  return context
}
