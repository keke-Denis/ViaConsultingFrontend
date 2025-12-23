// lib/TestHuille/fiche-reception.service.ts
import api from "@/api/api"

export interface FicheReception {
  id: number
  numero_document: string
  date_reception: string
  heure_reception: string
  fournisseur_id: number
  site_collecte_id: number
  utilisateur_id: number
  poids_brut: number
  statut: string
  created_at: string
  updated_at: string
  
  // Relations
  fournisseur?: {
    id: number
    nom: string
    prenom: string
    contact: string
  }
  site_collecte?: {
    id: number
    Nom: string
  }
  utilisateur?: {
    id: number
    name: string
    email: string
    role: string
  }

  // Champs optionnels
  poids_agreer?: number
  taux_humidite?: number
  taux_dessiccation?: number
  poids_net?: number
  type_emballage?: 'sac' | 'bidon' | 'fut'
  poids_emballage?: number
  nombre_colisage?: number
  prix_unitaire?: number
  prix_total?: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  count?: number
}

export const ficheService = {
  // Récupérer toutes les fiches
  getAll: async (): Promise<FicheReception[]> => {
    try {
      const response = await api.get<ApiResponse<FicheReception[]>>("/fiche-receptions")
      return response.data.data || []
    } catch (error) {
      console.error('Erreur lors du chargement des fiches:', error)
      return []
    }
  },

  // Récupérer une fiche par ID
  getById: async (id: number): Promise<FicheReception> => {
    const response = await api.get(`/fiche-receptions/${id}`)
    return response.data.data
  },

  // Créer une nouvelle fiche
  create: async (data: any): Promise<FicheReception> => {
    const response = await api.post("/fiche-receptions", data)
    return response.data.data
  },

  // Mettre à jour une fiche
  update: async (id: number, data: any): Promise<FicheReception> => {
    const response = await api.put(`/fiche-receptions/${id}`, data)
    return response.data.data
  },

  // Supprimer une fiche
  delete: async (id: number): Promise<void> => {
    await api.delete(`/fiche-receptions/${id}`)
  }
}