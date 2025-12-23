// lib/payement/payement-api.ts
"use client"

import { useState, useEffect } from 'react'
import { 
  Paiement, 
  Fournisseur, 
  PaiementStats, 
  CreatePaiementData, 
  UpdatePaiementData 
} from './payement-types'

// Données mockées
const mockFournisseurs: Fournisseur[] = [
  { id: "F001", nom: "Jean Rakoto", soldeDette: 500000, statut: "actif", telephone: "+261 34 12 345 67" },
  { id: "F002", nom: "Marie Randria", soldeDette: 0, statut: "actif", telephone: "+261 34 12 345 68" },
  { id: "F003", nom: "Pierre Andria", soldeDette: 1500000, statut: "actif", telephone: "+261 34 12 345 69" },
  { id: "F004", nom: "Sophie Rabe", soldeDette: 0, statut: "inactif", telephone: "+261 34 12 345 70" },
]

const mockPaiements: Paiement[] = [
  {
    id: "PAY-001",
    fournisseur: mockFournisseurs[0],
    montant: 1500000,
    date: "2024-01-15",
    statut: "payé",
    methode: "espèces",
    reference: "REF-001",
    type: "avance",
    description: "Avance pour future collecte de girofle",
    montantDu: 500000,
    montantAvance: 1500000,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z"
  },
  {
    id: "PAY-002",
    fournisseur: mockFournisseurs[1],
    montant: 2750000,
    date: "2024-01-14",
    statut: "en_attente",
    methode: "virement",
    reference: "REF-002",
    type: "paiement_complet",
    description: "Paiement pour collecte girofle livrée",
    createdAt: "2024-01-14T10:30:00Z",
    updatedAt: "2024-01-14T10:30:00Z"
  },
  {
    id: "PAY-003",
    fournisseur: mockFournisseurs[2],
    montant: 1200000,
    date: "2024-01-13",
    statut: "annulé",
    methode: "chèque",
    reference: "REF-003",
    type: "acompte",
    description: "Acompte sur commande future",
    createdAt: "2024-01-13T14:20:00Z",
    updatedAt: "2024-01-13T16:45:00Z"
  },
  {
    id: "PAY-004",
    fournisseur: mockFournisseurs[3],
    montant: 3200000,
    date: "2024-01-12",
    statut: "payé",
    methode: "espèces",
    reference: "REF-004",
    type: "règlement",
    description: "Règlement solde précédent",
    createdAt: "2024-01-12T09:15:00Z",
    updatedAt: "2024-01-12T09:15:00Z"
  },
  {
    id: "PAY-005",
    fournisseur: mockFournisseurs[0],
    montant: 1000000,
    date: "2024-01-10",
    statut: "payé",
    methode: "virement",
    reference: "REF-005",
    type: "avance",
    description: "Avance sans contrepartie immédiate",
    montantDu: 1000000,
    montantAvance: 1000000,
    createdAt: "2024-01-10T11:00:00Z",
    updatedAt: "2024-01-10T11:00:00Z"
  }
]

export const usePaiements = () => {
  const [paiements, setPaiements] = useState<Paiement[]>(mockPaiements)
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>(mockFournisseurs)
  const [loading, setLoading] = useState(false)

  // Calcul des statistiques
  const stats: PaiementStats = {
    totalPaiements: paiements.reduce((sum, p) => sum + p.montant, 0),
    totalPayes: paiements.filter(p => p.statut === "payé").reduce((sum, p) => sum + p.montant, 0),
    totalEnAttente: paiements.filter(p => p.statut === "en_attente").reduce((sum, p) => sum + p.montant, 0),
    totalAvances: paiements.filter(p => p.type === "avance" && p.statut === "payé").reduce((sum, p) => sum + p.montant, 0),
    totalDettes: fournisseurs.reduce((sum, f) => sum + f.soldeDette, 0)
  }

  // Générer une référence unique
  const generateReference = (): string => {
    const timestamp = new Date().getTime()
    const random = Math.floor(Math.random() * 1000)
    return `PAY-${timestamp}-${random}`
  }

  // Créer un paiement
  const createPaiement = async (data: CreatePaiementData): Promise<Paiement> => {
    setLoading(true)
    try {
      const fournisseur = fournisseurs.find(f => f.id === data.fournisseurId)
      if (!fournisseur) {
        throw new Error("Fournisseur non trouvé")
      }

      const nouveauPaiement: Paiement = {
        id: generateReference(),
        fournisseur,
        montant: data.montant,
        date: data.date,
        statut: "payé",
        methode: data.methode,
        reference: generateReference(),
        type: data.type,
        description: data.description,
        montantDu: data.type === "avance" ? data.montant : 0,
        montantAvance: data.type === "avance" ? data.montant : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Mettre à jour la dette du fournisseur si c'est une avance
      if (data.type === "avance") {
        const updatedFournisseurs = fournisseurs.map(f => 
          f.id === data.fournisseurId 
            ? { ...f, soldeDette: f.soldeDette + data.montant }
            : f
        )
        setFournisseurs(updatedFournisseurs)
      }

      setPaiements(prev => [nouveauPaiement, ...prev])
      return nouveauPaiement
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour un paiement
  const updatePaiement = async (id: string, data: UpdatePaiementData): Promise<Paiement> => {
    setLoading(true)
    try {
      const paiementIndex = paiements.findIndex(p => p.id === id)
      if (paiementIndex === -1) {
        throw new Error("Paiement non trouvé")
      }

      const updatedPaiements = [...paiements]
      updatedPaiements[paiementIndex] = {
        ...updatedPaiements[paiementIndex],
        ...data,
        updatedAt: new Date().toISOString()
      }

      setPaiements(updatedPaiements)
      return updatedPaiements[paiementIndex]
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un paiement
  const deletePaiement = async (id: string): Promise<void> => {
    setLoading(true)
    try {
      const paiement = paiements.find(p => p.id === id)
      if (paiement && paiement.type === "avance") {
        // Réduire la dette du fournisseur si on supprime une avance
        const updatedFournisseurs = fournisseurs.map(f => 
          f.id === paiement.fournisseur.id 
            ? { ...f, soldeDette: Math.max(0, f.soldeDette - paiement.montant) }
            : f
        )
        setFournisseurs(updatedFournisseurs)
      }

      setPaiements(prev => prev.filter(p => p.id !== id))
    } finally {
      setLoading(false)
    }
  }

  return {
    paiements,
    fournisseurs,
    stats,
    loading,
    createPaiement,
    updatePaiement,
    deletePaiement
  }
}
